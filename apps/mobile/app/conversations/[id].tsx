'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert
} from 'react-native'
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router'
import { getConversationDetails, getConversationMessages, getConversationMembers, sendMessage } from '@gemou2/database'
import { supabase, useUnreadMessages } from '../../lib'
import { PageLayout } from '../../components/layout'
import { TopHeader } from '../../components/TopHeader'
import MachiColors from '../../theme/colors'

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  profiles: {
    id: string
    username: string
    full_name: string
    avatar_url: string | null
  }
}

interface ConversationMember {
  user_id: string
  role: string
  joined_at: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
}

interface ConversationDetails {
  id: string
  type: string
  event_id: string | null
  marketplace_item_id: string | null
  created_by: string
  created_at: string
  events: {
    id: string
    title: string
    image_url: string | null
    date_time: string
    location: string
  } | null
  marketplace_items: {
    id: string
    title: string
    images: string[] | null
    price: number | null
    type: string
    seller_id: string
  } | null
}

export default function ConversationPage() {
  const params = useLocalSearchParams<{ id: string }>()
  const id = Array.isArray(params.id) ? params.id[0] : params.id

  const [user, setUser] = useState<any>(null)
  const [conversation, setConversation] = useState<ConversationDetails | null>(null)
  const [members, setMembers] = useState<ConversationMember[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const flatListRef = useRef<FlatList>(null)
  
  // Hook pour les messages non lus
  const { markAsRead } = useUnreadMessages()

  useEffect(() => {
    loadConversation()
    
    // S'abonner aux nouveaux messages en temps réel
    const subscription = supabase
      .channel(`conversation:${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${id}`
        },
        (payload) => {
          loadMessages()
          // Marquer comme lu quand un nouveau message arrive (l'utilisateur voit les messages)
          markAsRead(id)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [id, markAsRead])

  // Marquer la conversation comme lue quand l'écran obtient le focus
  useFocusEffect(
    useCallback(() => {
      if (id && user) {
        markAsRead(id)
      }
    }, [id, user, markAsRead])
  )

  const loadConversation = async () => {
    try {
      console.log('[ConversationPage] Loading conversation:', id)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('[ConversationPage] No user, redirecting to login')
        router.replace('/login')
        return
      }
      setUser(user)
      console.log('[ConversationPage] User authenticated:', user.id)

      // Charger les détails de la conversation
      const { conversation: convData, error: convError } = await getConversationDetails(supabase, id)
      if (convError) {
        console.error('[ConversationPage] Error loading conversation:', convError)
        console.error('[ConversationPage] Error details:', JSON.stringify(convError, null, 2))
        
        // Si l'utilisateur n'est pas membre, rediriger
        if (convError.code === 'NOT_MEMBER' || convError.message?.includes('Not a member')) {
          Alert.alert('Accès refusé', 'Vous n\'êtes pas membre de cette conversation')
          router.back()
          return
        }
        
        // Si la conversation n'existe pas
        if (convError.code === 'NOT_FOUND' || convError.code === 'PGRST116') {
          Alert.alert('Conversation introuvable', 'Cette conversation n\'existe pas ou a été supprimée')
          router.back()
          return
        }
        
        return
      }
      
      if (!convData) {
        console.error('[ConversationPage] No conversation data returned')
        return
      }
      
      console.log('[ConversationPage] Conversation loaded:', {
        id: convData.id,
        type: convData.type,
        hasEvent: !!convData.events,
        hasMarketplaceItem: !!convData.marketplace_items
      })
      
      setConversation(convData)

      // Charger les membres de la conversation
      const { members: membersData, error: membersError } = await getConversationMembers(supabase, id)
      if (!membersError && membersData) {
        setMembers(membersData)
        console.log('[ConversationPage] Members loaded:', membersData.length)
      }

      // Charger les messages
      await loadMessages()
      
      // Marquer la conversation comme lue après chargement
      if (user) {
        markAsRead(id)
      }
    } catch (error) {
      console.error('[ConversationPage] Exception:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async () => {
    try {
      const { messages: messagesData, error } = await getConversationMessages(supabase, id)
      if (error) {
        console.error('Error loading messages:', error)
        return
      }
      setMessages(messagesData || [])
      
      // Scroll vers le bas après chargement
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!messageText.trim() || !user || sending) return

    setSending(true)
    try {
      const { message: newMessage, error } = await sendMessage(supabase, id, user.id, messageText.trim())
      
      if (error) {
        console.error('Error sending message:', error)
        return
      }

      setMessageText('')
      await loadMessages()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setSending(false)
    }
  }

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  const getInitials = (name: string) => {
    if (!name) return '??'
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Obtenir l'interlocuteur (l'autre membre de la conversation pour les conversations marketplace)
  const getInterlocutor = (): ConversationMember | null => {
    if (!user || members.length === 0) return null
    // Trouver le membre qui n'est pas l'utilisateur courant
    return members.find(m => m.user_id !== user.id) || null
  }

  // Obtenir le titre du header (pseudo de l'interlocuteur + nom de l'annonce/event)
  const getHeaderTitle = (): string => {
    if (!conversation) return 'Conversation'
    
    const interlocutor = getInterlocutor()
    const interlocutorName = interlocutor?.full_name || interlocutor?.username || ''
    
    if (conversation.type === 'marketplace' && conversation.marketplace_items) {
      const itemTitle = conversation.marketplace_items.title
      if (interlocutorName) {
        return `${interlocutorName} • ${itemTitle}`
      }
      return itemTitle
    }
    
    if (conversation.type === 'event' && conversation.events) {
      return conversation.events.title
    }
    
    return 'Conversation'
  }

  // Obtenir l'image de la vignette (annonce ou event)
  const getVignetteImage = (): string | null => {
    if (!conversation) return null
    
    if (conversation.type === 'marketplace' && conversation.marketplace_items?.images?.length) {
      return conversation.marketplace_items.images[0]
    }
    
    if (conversation.type === 'event' && conversation.events?.image_url) {
      return conversation.events.image_url
    }
    
    return null
  }

  // Obtenir le titre de l'item (annonce ou event)
  const getItemTitle = (): string => {
    if (!conversation) return ''
    
    if (conversation.type === 'marketplace' && conversation.marketplace_items) {
      return conversation.marketplace_items.title
    }
    
    if (conversation.type === 'event' && conversation.events) {
      return conversation.events.title
    }
    
    return ''
  }

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.sender_id === user?.id

    return (
      <View style={[styles.messageContainer, isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer]}>
        {!isOwnMessage && (
          <View style={styles.avatarContainer}>
            {item.profiles?.avatar_url ? (
              <Image
                source={{ uri: item.profiles.avatar_url }}
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.avatarFallback, { backgroundColor: `hsl(${item.sender_id.charCodeAt(0) * 137.5 % 360}, 70%, 50%)` }]}>
                <Text style={styles.avatarInitials}>
                  {getInitials(item.profiles?.full_name || item.profiles?.username || 'U')}
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={[styles.messageBubble, isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble]}>
          {!isOwnMessage && (
            <Text style={styles.senderName}>
              @{item.profiles?.username || 'Utilisateur'}
            </Text>
          )}
          <Text style={[styles.messageText, isOwnMessage ? styles.ownMessageText : styles.otherMessageText]}>
            {item.content}
          </Text>
          <Text style={[styles.messageTime, isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime]}>
            {formatMessageTime(item.created_at)}
          </Text>
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    )
  }

  if (!conversation) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>😕</Text>
        <Text style={styles.errorTitle}>Conversation introuvable</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const interlocutor = getInterlocutor()
  const vignetteImage = getVignetteImage()
  const itemTitle = getItemTitle()

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* TopHeader avec titre dynamique */}
      <TopHeader 
        dynamicTitle={getHeaderTitle()}
        overrideShowBackButton={true}
      />

      {/* Vignette avec image et info interlocuteur */}
      <View style={styles.vignetteContainer}>
        {/* Image de l'annonce/event à gauche */}
        <TouchableOpacity
          style={styles.vignetteImageContainer}
          onPress={() => {
            if (conversation.type === 'event' && conversation.event_id) {
              router.push(`/events/${conversation.event_id}`)
            } else if (conversation.type === 'marketplace' && conversation.marketplace_item_id) {
              router.push(`/trade/${conversation.marketplace_item_id}`)
            }
          }}
        >
          {vignetteImage ? (
            <Image
              source={{ uri: vignetteImage }}
              style={styles.vignetteImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.vignetteImagePlaceholder}>
              <Text style={styles.vignetteImageEmoji}>
                {conversation.type === 'marketplace' ? '🛒' : '🎮'}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Infos interlocuteur à droite */}
        <View style={styles.vignetteInfo}>
          {conversation.type === 'marketplace' && interlocutor ? (
            <TouchableOpacity 
              style={styles.interlocutorRow}
              onPress={() => router.push(`/profile/${interlocutor.username}`)}
            >
              {interlocutor.avatar_url ? (
                <Image
                  source={{ uri: interlocutor.avatar_url }}
                  style={styles.interlocutorAvatar}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.interlocutorAvatarFallback, { backgroundColor: MachiColors.primary }]}>
                  <Text style={styles.interlocutorAvatarInitials}>
                    {getInitials(interlocutor.full_name || interlocutor.username || 'U')}
                  </Text>
                </View>
              )}
              <View style={styles.interlocutorTextContainer}>
                {interlocutor.full_name && (
                  <Text style={styles.interlocutorName} numberOfLines={1}>
                    {interlocutor.full_name}
                  </Text>
                )}
                <Text style={styles.interlocutorUsername} numberOfLines={1}>
                  @{interlocutor.username || 'utilisateur'}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.interlocutorRow}>
              <View style={[styles.interlocutorAvatarFallback, { backgroundColor: MachiColors.primary }]}>
                <Text style={styles.interlocutorAvatarInitials}>👥</Text>
              </View>
              <View style={styles.interlocutorTextContainer}>
                <Text style={styles.interlocutorName} numberOfLines={1}>
                  Groupe
                </Text>
                <Text style={styles.interlocutorUsername} numberOfLines={1}>
                  {members.length} participants
                </Text>
              </View>
            </View>
          )}
          
          {/* Titre de l'annonce/event */}
          <TouchableOpacity
            onPress={() => {
              if (conversation.type === 'event' && conversation.event_id) {
                router.push(`/events/${conversation.event_id}`)
              } else if (conversation.type === 'marketplace' && conversation.marketplace_item_id) {
                router.push(`/trade/${conversation.marketplace_item_id}`)
              }
            }}
          >
            <Text style={styles.vignetteItemTitle} numberOfLines={1}>
              {itemTitle}
            </Text>
            <Text style={styles.vignetteItemLink}>
              {conversation.type === 'event' ? 'Voir l\'événement →' : 'Voir l\'annonce →'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyTitle}>Aucun message</Text>
            <Text style={styles.emptyText}>Soyez le premier à envoyer un message !</Text>
          </View>
        }
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Écrivez un message..."
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!messageText.trim() || sending) && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!messageText.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.sendButtonText}>➤</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
    padding: 40
  },
  errorEmoji: {
    fontSize: 60,
    marginBottom: 20
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center'
  },
  backButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  // Vignette styles
  vignetteContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'center'
  },
  vignetteImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12
  },
  vignetteImage: {
    width: '100%',
    height: '100%'
  },
  vignetteImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  vignetteImageEmoji: {
    fontSize: 28
  },
  vignetteInfo: {
    flex: 1
  },
  interlocutorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  interlocutorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8
  },
  interlocutorAvatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  interlocutorAvatarInitials: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
  interlocutorTextContainer: {
    flex: 1
  },
  interlocutorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937'
  },
  interlocutorUsername: {
    fontSize: 12,
    color: '#6b7280'
  },
  vignetteItemTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2
  },
  vignetteItemLink: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500'
  },
  messagesList: {
    padding: 16,
    flexGrow: 1
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end'
  },
  ownMessageContainer: {
    justifyContent: 'flex-end'
  },
  otherMessageContainer: {
    justifyContent: 'flex-start'
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    overflow: 'hidden'
  },
  avatar: {
    width: '100%',
    height: '100%'
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarInitials: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 12,
    padding: 12
  },
  ownMessageBubble: {
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4
  },
  otherMessageBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22
  },
  ownMessageText: {
    color: 'white'
  },
  otherMessageText: {
    color: '#1f2937'
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right'
  },
  otherMessageTime: {
    color: '#9ca3af'
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'flex-end'
  },
  input: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendButtonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.5
  },
  sendButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold'
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 20
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center'
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center'
  }
})

