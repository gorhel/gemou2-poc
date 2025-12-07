import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

/**
 * Crée une conversation de groupe pour un événement
 * @param supabase - Client Supabase
 * @param eventId - ID de l'événement
 * @param creatorId - ID du créateur de la conversation
 * @returns L'ID de la conversation créée
 */
export async function createEventConversation(
  supabase: SupabaseClient<Database>,
  eventId: string,
  creatorId: string
): Promise<{ conversationId: string | null; error: any }> {
  try {
    // Vérifier si une conversation existe déjà pour cet événement
    const { data: existingConversation, error: checkError } = await supabase
      .from('conversations')
      .select('id')
      .eq('event_id', eventId)
      .eq('type', 'event')
      .single()

    if (existingConversation) {
      return { conversationId: existingConversation.id, error: null }
    }

    // Créer la conversation
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .insert({
        type: 'event',
        event_id: eventId,
        created_by: creatorId
      })
      .select('id')
      .single()

    if (conversationError) throw conversationError

    // Récupérer tous les participants de l'événement (y compris le créateur)
    const { data: participants, error: participantsError } = await supabase
      .from('event_participants')
      .select('user_id')
      .eq('event_id', eventId)
      .neq('status', 'cancelled')

    if (participantsError) throw participantsError

    // Ajouter tous les participants à la conversation
    const conversationMembers = participants.map(p => ({
      conversation_id: conversation.id,
      user_id: p.user_id,
      role: p.user_id === creatorId ? 'admin' : 'member'
    }))

    const { error: membersError } = await supabase
      .from('conversation_members')
      .insert(conversationMembers)

    if (membersError) throw membersError

    return { conversationId: conversation.id, error: null }
  } catch (error) {
    console.error('Error creating event conversation:', error)
    return { conversationId: null, error }
  }
}

/**
 * Récupère les conversations d'un utilisateur
 * Ne retourne que les conversations qui ont au moins un message
 * @param supabase - Client Supabase
 * @param userId - ID de l'utilisateur
 * @returns Liste des conversations avec des messages
 */
export async function getUserConversations(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<{ conversations: any[] | null; error: any }> {
  try {
    console.log('[getUserConversations] Fetching conversations for user:', userId)
    
    const { data, error } = await supabase
      .from('conversation_members')
      .select(`
        conversation_id,
        conversations (
          id,
          type,
          event_id,
          marketplace_item_id,
          created_by,
          created_at,
          events (
            id,
            title,
            image_url,
            date_time
          ),
          marketplace_items (
            id,
            title,
            images,
            price,
            type,
            seller_id
          )
        )
      `)
      .eq('user_id', userId)
      .order('joined_at', { ascending: false })

    if (error) {
      console.error('[getUserConversations] Supabase error:', error)
      throw error
    }

    console.log('[getUserConversations] Raw data received:', JSON.stringify(data, null, 2))

    // Transformer les données pour avoir un format plus simple
    const allConversations = data
      .filter(item => item.conversations !== null)
      .map(item => ({
        id: item.conversations.id,
        type: item.conversations.type,
        event_id: item.conversations.event_id,
        marketplace_item_id: item.conversations.marketplace_item_id,
        created_by: item.conversations.created_by,
        created_at: item.conversations.created_at,
        event: item.conversations.events,
        marketplace_item: item.conversations.marketplace_items
      }))

    console.log('[getUserConversations] All conversations before filtering:', allConversations.length)

    // Récupérer les IDs des conversations qui ont au moins un message
    const conversationIds = allConversations.map(c => c.id)
    
    if (conversationIds.length === 0) {
      console.log('[getUserConversations] No conversations found for user')
      return { conversations: [], error: null }
    }

    // Récupérer les conversation_ids qui ont des messages
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('conversation_id')
      .in('conversation_id', conversationIds)

    if (messagesError) {
      console.error('[getUserConversations] Error fetching messages:', messagesError)
      // En cas d'erreur, retourner quand même toutes les conversations
      return { conversations: allConversations, error: null }
    }

    // Créer un Set des conversation_ids qui ont des messages
    const conversationIdsWithMessages = new Set(
      messagesData?.map(m => m.conversation_id) || []
    )

    console.log('[getUserConversations] Conversations with messages:', conversationIdsWithMessages.size)

    // Filtrer pour ne garder que les conversations avec des messages
    let conversations = allConversations.filter(c => 
      conversationIdsWithMessages.has(c.id)
    )

    // Récupérer les membres des conversations (direct/group) avec leurs profils
    const directOrGroupConvIds = conversations
      .filter(c => c.type === 'direct' || c.type === 'group')
      .map(c => c.id)

    if (directOrGroupConvIds.length > 0) {
      const { data: membersData, error: membersError } = await supabase
        .from('conversation_members')
        .select(`
          conversation_id,
          user_id,
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url,
            profile_photo_url
          )
        `)
        .in('conversation_id', directOrGroupConvIds)

      if (!membersError && membersData) {
        // Grouper les membres par conversation
        const membersByConversation = new Map<string, any[]>()
        membersData.forEach(m => {
          const convId = m.conversation_id
          if (!membersByConversation.has(convId)) {
            membersByConversation.set(convId, [])
          }
          membersByConversation.get(convId)?.push({
            user_id: m.user_id,
            username: m.profiles?.username || null,
            full_name: m.profiles?.full_name || null,
            avatar_url: m.profiles?.avatar_url || m.profiles?.profile_photo_url || null
          })
        })

        // Enrichir les conversations avec les membres
        conversations = conversations.map(c => {
          if (c.type === 'direct' || c.type === 'group') {
            const members = membersByConversation.get(c.id) || []
            // Pour les conversations directes, trouver l'interlocuteur (l'autre membre)
            const otherMembers = members.filter(m => m.user_id !== userId)
            return {
              ...c,
              members,
              // L'interlocuteur est le premier membre qui n'est pas l'utilisateur courant
              interlocutor: otherMembers.length > 0 ? otherMembers[0] : null
            }
          }
          return c
        })
      }
    }

    console.log('[getUserConversations] Filtered conversations:', JSON.stringify(conversations, null, 2))
    console.log('[getUserConversations] Total conversations with messages:', conversations.length)
    console.log('[getUserConversations] Marketplace conversations:', conversations.filter(c => c.type === 'marketplace').length)

    return { conversations, error: null }
  } catch (error) {
    console.error('[getUserConversations] Error fetching user conversations:', error)
    return { conversations: null, error }
  }
}

/**
 * Récupère les messages d'une conversation
 * @param supabase - Client Supabase
 * @param conversationId - ID de la conversation
 * @param limit - Nombre maximum de messages à récupérer
 * @returns Liste des messages
 */
export async function getConversationMessages(
  supabase: SupabaseClient<Database>,
  conversationId: string,
  limit: number = 50
): Promise<{ messages: any[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        conversation_id,
        sender_id,
        content,
        attachments,
        created_at,
        profiles:sender_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit)

    if (error) throw error

    return { messages: data, error: null }
  } catch (error) {
    console.error('Error fetching conversation messages:', error)
    return { messages: null, error }
  }
}

/**
 * Envoie un message dans une conversation
 * @param supabase - Client Supabase
 * @param conversationId - ID de la conversation
 * @param senderId - ID de l'expéditeur
 * @param content - Contenu du message
 * @returns Le message créé
 */
export async function sendMessage(
  supabase: SupabaseClient<Database>,
  conversationId: string,
  senderId: string,
  content: string
): Promise<{ message: any | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        attachments: []
      })
      .select(`
        id,
        conversation_id,
        sender_id,
        content,
        attachments,
        created_at,
        profiles:sender_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (error) throw error

    return { message: data, error: null }
  } catch (error) {
    console.error('Error sending message:', error)
    return { message: null, error }
  }
}

/**
 * Récupère les détails d'une conversation
 * @param supabase - Client Supabase
 * @param conversationId - ID de la conversation
 * @returns Détails de la conversation
 */
export async function getConversationDetails(
  supabase: SupabaseClient<Database>,
  conversationId: string
): Promise<{ conversation: any | null; error: any }> {
  try {
    console.log('[getConversationDetails] Fetching conversation:', conversationId)
    
    // D'abord vérifier si l'utilisateur est membre de la conversation
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error('[getConversationDetails] No authenticated user')
      return { conversation: null, error: { message: 'Not authenticated' } }
    }

    console.log('[getConversationDetails] User ID:', user.id)

    // Vérifier si l'utilisateur est membre
    const { data: memberCheck, error: memberError } = await supabase
      .from('conversation_members')
      .select('conversation_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .single()

    if (memberError || !memberCheck) {
      console.error('[getConversationDetails] User is not a member of this conversation:', memberError)
      return { conversation: null, error: { message: 'Not a member of this conversation', code: 'NOT_MEMBER' } }
    }

    console.log('[getConversationDetails] User is a member, fetching conversation details')

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id,
        type,
        event_id,
        marketplace_item_id,
        created_by,
        created_at,
        events (
          id,
          title,
          image_url,
          date_time,
          location
        ),
        marketplace_items (
          id,
          title,
          images,
          price,
          type,
          seller_id
        )
      `)
      .eq('id', conversationId)
      .maybeSingle()

    if (error) {
      console.error('[getConversationDetails] Supabase error:', error)
      throw error
    }

    if (!data) {
      console.error('[getConversationDetails] Conversation not found')
      return { conversation: null, error: { message: 'Conversation not found', code: 'NOT_FOUND' } }
    }

    console.log('[getConversationDetails] Conversation found:', {
      id: data.id,
      type: data.type,
      hasEvent: !!data.events,
      hasMarketplaceItem: !!data.marketplace_items
    })

    return { conversation: data, error: null }
  } catch (error) {
    console.error('[getConversationDetails] Exception:', error)
    return { conversation: null, error }
  }
}

/**
 * Récupère les membres d'une conversation avec leurs profils
 * @param supabase - Client Supabase
 * @param conversationId - ID de la conversation
 * @returns Liste des membres avec leurs profils
 */
export async function getConversationMembers(
  supabase: SupabaseClient<Database>,
  conversationId: string
): Promise<{ members: any[] | null; error: any }> {
  try {
    console.log('[getConversationMembers] Fetching members for conversation:', conversationId)

    const { data, error } = await supabase
      .from('conversation_members')
      .select(`
        conversation_id,
        user_id,
        role,
        joined_at,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('conversation_id', conversationId)

    if (error) {
      console.error('[getConversationMembers] Supabase error:', error)
      throw error
    }

    // Transformer les données pour avoir un format plus simple
    const members = data?.map(item => ({
      user_id: item.user_id,
      role: item.role,
      joined_at: item.joined_at,
      username: item.profiles?.username || null,
      full_name: item.profiles?.full_name || null,
      avatar_url: item.profiles?.avatar_url || null
    })) || []

    console.log('[getConversationMembers] Members found:', members.length)

    return { members, error: null }
  } catch (error) {
    console.error('[getConversationMembers] Exception:', error)
    return { members: null, error }
  }
}

/**
 * Crée une conversation marketplace entre un acheteur et un vendeur
 * Utilise la fonction RPC create_marketplace_conversation qui gère la logique
 * de vérification et de création de manière sécurisée
 * @param supabase - Client Supabase
 * @param marketplaceItemId - ID de l'annonce marketplace
 * @param buyerId - ID de l'acheteur
 * @returns L'ID de la conversation créée ou récupérée
 */
export async function createMarketplaceConversation(
  supabase: SupabaseClient<Database>,
  marketplaceItemId: string,
  buyerId: string
): Promise<{ conversationId: string | null; error: any }> {
  try {
    const { data: conversationId, error } = await supabase.rpc(
      'create_marketplace_conversation',
      {
        p_marketplace_item_id: marketplaceItemId,
        p_buyer_id: buyerId
      }
    )

    if (error) {
      console.error('Error creating marketplace conversation:', error)
      return { conversationId: null, error }
    }

    return { conversationId, error: null }
  } catch (error) {
    console.error('Error creating marketplace conversation:', error)
    return { conversationId: null, error }
  }
}

/**
 * Crée une notification pour une nouvelle conversation
 * @param supabase - Client Supabase
 * @param userIds - IDs des utilisateurs à notifier
 * @param eventId - ID de l'événement
 * @param eventTitle - Titre de l'événement
 */
export async function notifyConversationCreated(
  supabase: SupabaseClient<Database>,
  userIds: string[],
  eventId: string,
  eventTitle: string
): Promise<{ success: boolean; error: any }> {
  try {
    const notifications = userIds.map(userId => ({
      user_id: userId,
      type: 'conversation_created',
      payload: {
        event_id: eventId,
        event_title: eventTitle,
        message: `Une conversation a été créée pour l'événement "${eventTitle}"`
      }
    }))

    const { error } = await supabase
      .from('notifications')
      .insert(notifications)

    if (error) throw error

    return { success: true, error: null }
  } catch (error) {
    console.error('Error creating notifications:', error)
    return { success: false, error }
  }
}

// ═══════════════════════════════════════════════════════════
// Fonctions pour les messages non lus et notifications push
// ═══════════════════════════════════════════════════════════

interface UnreadCount {
  conversation_id: string
  unread_count: number
}

/**
 * Marque une conversation comme lue pour un utilisateur
 * @param supabase - Client Supabase
 * @param conversationId - ID de la conversation
 * @param userId - ID de l'utilisateur
 */
export async function markConversationAsRead(
  supabase: SupabaseClient<Database>,
  conversationId: string,
  userId: string
): Promise<{ success: boolean; error: any }> {
  try {
    const { error } = await supabase.rpc('mark_conversation_as_read', {
      p_conversation_id: conversationId,
      p_user_id: userId,
    })

    if (error) throw error

    return { success: true, error: null }
  } catch (error) {
    console.error('Error marking conversation as read:', error)
    return { success: false, error }
  }
}

/**
 * Récupère le nombre de messages non lus par conversation pour un utilisateur
 * @param supabase - Client Supabase
 * @param userId - ID de l'utilisateur
 * @returns Map de conversation_id -> nombre de messages non lus
 */
export async function getUnreadMessagesCount(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<{ counts: UnreadCount[] | null; error: any }> {
  try {
    const { data, error } = await supabase.rpc('get_unread_messages_count', {
      p_user_id: userId,
    })

    if (error) throw error

    return { counts: data as UnreadCount[], error: null }
  } catch (error) {
    console.error('Error fetching unread messages count:', error)
    return { counts: null, error }
  }
}

/**
 * Récupère le total des messages non lus pour un utilisateur
 * @param supabase - Client Supabase
 * @param userId - ID de l'utilisateur
 * @returns Le nombre total de messages non lus
 */
export async function getTotalUnreadMessages(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<{ total: number; error: any }> {
  try {
    const { data, error } = await supabase.rpc('get_total_unread_messages', {
      p_user_id: userId,
    })

    if (error) throw error

    return { total: data as number, error: null }
  } catch (error) {
    console.error('Error fetching total unread messages:', error)
    return { total: 0, error }
  }
}

/**
 * Enregistre ou met à jour un token push pour un utilisateur
 * @param supabase - Client Supabase
 * @param userId - ID de l'utilisateur
 * @param token - Token Expo Push
 * @param platform - Plateforme (ios, android, web)
 * @param deviceId - ID du device (optionnel)
 */
export async function upsertPushToken(
  supabase: SupabaseClient<Database>,
  userId: string,
  token: string,
  platform: 'ios' | 'android' | 'web',
  deviceId?: string
): Promise<{ tokenId: string | null; error: any }> {
  try {
    const { data, error } = await supabase.rpc('upsert_push_token', {
      p_user_id: userId,
      p_token: token,
      p_platform: platform,
      p_device_id: deviceId || null,
    })

    if (error) throw error

    return { tokenId: data as string, error: null }
  } catch (error) {
    console.error('Error upserting push token:', error)
    return { tokenId: null, error }
  }
}

/**
 * Désactive un token push
 * @param supabase - Client Supabase
 * @param userId - ID de l'utilisateur
 * @param token - Token à désactiver
 */
export async function deactivatePushToken(
  supabase: SupabaseClient<Database>,
  userId: string,
  token: string
): Promise<{ success: boolean; error: any }> {
  try {
    const { error } = await supabase
      .from('push_tokens')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('token', token)

    if (error) throw error

    return { success: true, error: null }
  } catch (error) {
    console.error('Error deactivating push token:', error)
    return { success: false, error }
  }
}

