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
 * @param supabase - Client Supabase
 * @param userId - ID de l'utilisateur
 * @returns Liste des conversations
 */
export async function getUserConversations(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<{ conversations: any[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('conversation_members')
      .select(`
        conversation_id,
        conversations (
          id,
          type,
          event_id,
          created_by,
          created_at,
          events (
            id,
            title,
            image_url,
            date_time
          )
        )
      `)
      .eq('user_id', userId)
      .order('joined_at', { ascending: false })

    if (error) throw error

    // Transformer les données pour avoir un format plus simple
    const conversations = data
      .filter(item => item.conversations !== null)
      .map(item => ({
        id: item.conversations.id,
        type: item.conversations.type,
        event_id: item.conversations.event_id,
        created_by: item.conversations.created_by,
        created_at: item.conversations.created_at,
        event: item.conversations.events
      }))

    return { conversations, error: null }
  } catch (error) {
    console.error('Error fetching user conversations:', error)
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
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id,
        type,
        event_id,
        created_by,
        created_at,
        events (
          id,
          title,
          image_url,
          date_time,
          location
        )
      `)
      .eq('id', conversationId)
      .single()

    if (error) throw error

    return { conversation: data, error: null }
  } catch (error) {
    console.error('Error fetching conversation details:', error)
    return { conversation: null, error }
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

