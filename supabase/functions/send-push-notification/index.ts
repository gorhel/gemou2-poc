/**
 * Supabase Edge Function: send-push-notification
 * 
 * Cette fonction est appelée via un webhook Supabase Database Trigger
 * quand un nouveau message est inséré dans la table `messages`.
 * Elle envoie une notification push à tous les membres de la conversation
 * (sauf l'expéditeur).
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExpoPushMessage {
  to: string
  sound?: 'default' | null
  title: string
  body: string
  data?: Record<string, unknown>
  channelId?: string
  badge?: number
}

interface PushToken {
  user_id: string
  token: string
  platform: string
  username: string | null
  full_name: string | null
}

interface NewMessagePayload {
  type: 'INSERT'
  table: string
  record: {
    id: string
    conversation_id: string
    sender_id: string
    content: string
    created_at: string
  }
}

/**
 * Envoie des notifications push via l'API Expo Push
 */
async function sendExpoPushNotifications(messages: ExpoPushMessage[]): Promise<void> {
  if (messages.length === 0) return

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    })

    const result = await response.json()
    console.log('[send-push-notification] Expo Push result:', JSON.stringify(result))

    // Vérifier les erreurs et désactiver les tokens invalides
    if (result.data) {
      for (let i = 0; i < result.data.length; i++) {
        const ticket = result.data[i]
        if (ticket.status === 'error') {
          console.error(`[send-push-notification] Error for message ${i}:`, ticket.message)
          
          // Si le token est invalide, on pourrait le désactiver ici
          if (ticket.details?.error === 'DeviceNotRegistered') {
            console.log('[send-push-notification] Device not registered, token should be deactivated')
          }
        }
      }
    }
  } catch (error) {
    console.error('[send-push-notification] Error sending push notifications:', error)
    throw error
  }
}

serve(async (req) => {
  // Gestion CORS pour les preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Créer le client Supabase avec les clés d'environnement
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parser le payload du webhook
    const payload: NewMessagePayload = await req.json()
    
    console.log('[send-push-notification] Received payload:', JSON.stringify(payload))

    // Vérifier que c'est bien un INSERT sur la table messages
    if (payload.type !== 'INSERT' || payload.table !== 'messages') {
      console.log('[send-push-notification] Ignoring non-message insert')
      return new Response(JSON.stringify({ success: false, reason: 'Not a message insert' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const message = payload.record
    const { conversation_id, sender_id, content } = message

    // Récupérer les informations de l'expéditeur
    const { data: senderProfile, error: senderError } = await supabase
      .from('profiles')
      .select('username, full_name')
      .eq('id', sender_id)
      .single()

    if (senderError) {
      console.error('[send-push-notification] Error fetching sender profile:', senderError)
    }

    const senderName = senderProfile?.full_name || senderProfile?.username || 'Quelqu\'un'

    // Récupérer les informations de la conversation
    const { data: conversationData, error: convError } = await supabase
      .from('conversations')
      .select(`
        id,
        type,
        events (title),
        marketplace_items (title)
      `)
      .eq('id', conversation_id)
      .single()

    if (convError) {
      console.error('[send-push-notification] Error fetching conversation:', convError)
    }

    // Construire le titre de la notification
    let notificationTitle = `Message de ${senderName}`
    if (conversationData?.type === 'event' && conversationData.events?.title) {
      notificationTitle = `${senderName} - ${conversationData.events.title}`
    } else if (conversationData?.type === 'marketplace' && conversationData.marketplace_items?.title) {
      notificationTitle = `${senderName} - ${conversationData.marketplace_items.title}`
    }

    // Récupérer les tokens push des membres de la conversation (sauf l'expéditeur)
    const { data: tokens, error: tokensError } = await supabase
      .rpc('get_conversation_push_tokens', {
        p_conversation_id: conversation_id,
        p_exclude_user_id: sender_id,
      })

    if (tokensError) {
      console.error('[send-push-notification] Error fetching push tokens:', tokensError)
      return new Response(JSON.stringify({ success: false, error: tokensError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    if (!tokens || tokens.length === 0) {
      console.log('[send-push-notification] No push tokens found for conversation members')
      return new Response(JSON.stringify({ success: true, sent: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    console.log(`[send-push-notification] Found ${tokens.length} push tokens`)

    // Construire les messages push
    const pushMessages: ExpoPushMessage[] = tokens.map((token: PushToken) => ({
      to: token.token,
      sound: 'default',
      title: notificationTitle,
      body: content.length > 100 ? content.substring(0, 97) + '...' : content,
      data: {
        conversation_id,
        message_id: message.id,
        sender_id,
        type: 'new_message',
      },
      channelId: 'messages',
    }))

    // Envoyer les notifications
    await sendExpoPushNotifications(pushMessages)

    console.log(`[send-push-notification] Successfully sent ${pushMessages.length} notifications`)

    return new Response(JSON.stringify({ success: true, sent: pushMessages.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('[send-push-notification] Error:', error)
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

