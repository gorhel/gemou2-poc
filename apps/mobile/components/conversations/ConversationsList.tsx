'use client'

import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  FlatList
} from 'react-native'
import { router } from 'expo-router'
import { getUserConversations } from '@gemou2/database'
import { supabase, useUnreadMessages } from '../../lib'

interface InterlocutorProfile {
  user_id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
}

interface ConversationItemProps {
  id: string
  type: 'direct' | 'group' | 'event' | 'marketplace'
  event: {
    id: string
    title: string
    image_url: string | null
    date_time: string
  } | null
  marketplace_item: {
    id: string
    title: string
    images: string[] | null
    price: number | null
    type: string
    seller_id: string
  } | null
  interlocutor: InterlocutorProfile | null
  members: InterlocutorProfile[] | null
  created_at: string
}

export function ConversationsList() {
  const [conversations, setConversations] = useState<ConversationItemProps[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  // Hook pour les messages non lus
  const { unreadByConversation, refresh: refreshUnread } = useUnreadMessages()

  const loadConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }

      setUser(user)
      console.log('[ConversationsList] Loading conversations for user:', user.id)

      const { conversations: data, error } = await getUserConversations(supabase, user.id)
      
      if (error) {
        console.error('[ConversationsList] Error loading conversations:', error)
        console.error('[ConversationsList] Error details:', JSON.stringify(error, null, 2))
        return
      }

      console.log('[ConversationsList] Conversations loaded:', data?.length || 0)
      console.log('[ConversationsList] Conversations data:', JSON.stringify(data, null, 2))
      setConversations(data || [])
    } catch (error) {
      console.error('[ConversationsList] Exception loading conversations:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadConversations()
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    loadConversations()
    refreshUnread()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      return 'Aujourd\'hui'
    } else if (diffInDays === 1) {
      return 'Hier'
    } else if (diffInDays < 7) {
      return `Il y a ${diffInDays} jours`
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    }
  }

  /**
   * Formate l'heure du dernier message
   * - Si moins de 24h : affiche l'heure exacte (HH:mm)
   * - Si plus de 24h : affiche le nombre de jours
   */
  const formatLastMessageTime = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = diffInMs / (1000 * 60 * 60)
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInHours < 24) {
      // Moins de 24h : afficher l'heure exacte
      return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } else if (diffInDays === 1) {
      return 'Hier'
    } else if (diffInDays < 7) {
      return `${diffInDays}j`
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7)
      return `${weeks}sem`
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    }
  }

  /**
   * Détermine l'image à afficher selon le type de conversation
   */
  const getConversationImage = (item: ConversationItemProps): string | null => {
    switch (item.type) {
      case 'marketplace':
        return item.marketplace_item?.images?.[0] || null
      case 'event':
        return item.event?.image_url || null
      case 'direct':
        return item.interlocutor?.avatar_url || null
      case 'group':
        // Pour les groupes, on pourrait afficher l'avatar du premier membre
        return item.members?.[0]?.avatar_url || null
      default:
        return null
    }
  }

  /**
   * Détermine l'émoji de fallback selon le type de conversation
   */
  const getConversationEmoji = (item: ConversationItemProps): string => {
    switch (item.type) {
      case 'marketplace':
        return '📦'
      case 'event':
        return '🎉'
      case 'direct':
        return '👤'
      case 'group':
        return '👥'
      default:
        return '💬'
    }
  }

  /**
   * Détermine le titre à afficher selon le type de conversation
   */
  const getConversationTitle = (item: ConversationItemProps): string => {
    switch (item.type) {
      case 'marketplace':
        return item.marketplace_item?.title || 'Annonce'
      case 'event':
        return item.event?.title || 'Événement'
      case 'direct':
        return item.interlocutor?.full_name 
          || item.interlocutor?.username 
          || 'Conversation'
      case 'group':
        // Pour les groupes, lister quelques noms des membres
        const memberNames = item.members
          ?.slice(0, 2)
          .map(m => m.full_name || m.username || 'Inconnu')
          .join(', ')
        return memberNames 
          ? (item.members && item.members.length > 2 
              ? `${memberNames} et ${item.members.length - 2} autres` 
              : memberNames)
          : 'Groupe'
      default:
        return 'Conversation'
    }
  }

  const renderConversation = ({ item }: { item: ConversationItemProps }) => {
    const isMarketplace = item.type === 'marketplace'
    const isEvent = item.type === 'event'
    const isDirect = item.type === 'direct'
    
    // Nombre de messages non lus pour cette conversation
    const unreadCount = unreadByConversation.get(item.id) || 0
    const hasUnread = unreadCount > 0
    
    // Image selon le type de conversation
    const imageUrl = getConversationImage(item)
    
    // Émoji de fallback selon le type
    const fallbackEmoji = getConversationEmoji(item)
    
    // Titre selon le type de conversation
    const title = getConversationTitle(item)
    
    // Prix pour marketplace
    const price = isMarketplace && item.marketplace_item?.price
      ? `${item.marketplace_item.price}€`
      : null

    return (
      <TouchableOpacity
        style={[styles.conversationCard, hasUnread && styles.conversationCardUnread]}
        onPress={() => router.push(`/conversations/${item.id}`)}
      >
        {/* Indicateur de messages non lus */}
        {hasUnread && (
          <View style={styles.unreadIndicator}>
            <View style={styles.unreadDot} />
          </View>
        )}

        <View style={[
          styles.conversationImageContainer,
          isDirect && styles.conversationImageContainerRound
        ]}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={[
                styles.conversationImage,
                isDirect && styles.conversationImageRound
              ]}
              resizeMode="cover"
            />
          ) : (
            <View style={[
              styles.conversationImagePlaceholder,
              isDirect && styles.conversationImagePlaceholderRound
            ]}>
              <Text style={styles.conversationImageEmoji}>
                {fallbackEmoji}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.conversationInfo}>
          <View style={styles.titleRow}>
            <Text style={[styles.conversationTitle, hasUnread && styles.conversationTitleUnread]} numberOfLines={1}>
              {title}
            </Text>
            {hasUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.conversationSubtitle, hasUnread && styles.conversationSubtitleUnread]} numberOfLines={1}>
            {hasUnread ? `${unreadCount} nouveau${unreadCount > 1 ? 'x' : ''} message${unreadCount > 1 ? 's' : ''}` : formatDate(item.created_at)}
          </Text>
          {isEvent && item.event?.date_time && (
            <Text style={styles.conversationDate}>
              📅 {new Date(item.event.date_time).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          )}
          {isMarketplace && price && (
            <Text style={styles.conversationDate}>
              💰 {price}
            </Text>
          )}
        </View>

        {/* Heure du dernier message */}
        <View style={styles.lastMessageTimeContainer}>
          <Text style={[styles.lastMessageTime, hasUnread && styles.lastMessageTimeUnread]}>
            {formatLastMessageTime(item.created_at)}
          </Text>
        </View>
      </TouchableOpacity>
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

  if (conversations.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyEmoji}>💬</Text>
        <Text style={styles.emptyTitle}>Aucune conversation</Text>
        <Text style={styles.emptyText}>
          Les conversations de groupe et marketplace apparaîtront ici lorsque vous participerez à des événements ou contacterez un vendeur.
        </Text>
      </View>
    )
  }

  return (
    <FlatList
      data={conversations}
      renderItem={renderConversation}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280'
  },
  listContainer: {
    padding: 16
  },
  conversationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2
  },
  conversationImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12
  },
  conversationImageContainerRound: {
    borderRadius: 30
  },
  conversationImage: {
    width: '100%',
    height: '100%'
  },
  conversationImageRound: {
    borderRadius: 30
  },
  conversationImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  conversationImagePlaceholderRound: {
    borderRadius: 30,
    backgroundColor: '#e0e7ff'
  },
  conversationImageEmoji: {
    fontSize: 30
  },
  conversationInfo: {
    flex: 1,
    marginRight: 8
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4
  },
  conversationSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2
  },
  conversationDate: {
    fontSize: 12,
    color: '#9ca3af'
  },
  lastMessageTimeContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 50
  },
  lastMessageTime: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '400'
  },
  lastMessageTimeUnread: {
    color: '#3b82f6',
    fontWeight: '600'
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
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
    textAlign: 'center',
    lineHeight: 24
  },
  // Styles pour les messages non lus
  conversationCardUnread: {
    backgroundColor: '#f0f7ff',
  },
  unreadIndicator: {
    position: 'absolute',
    left: 8,
    top: '50%',
    marginTop: -4
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6'
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  conversationTitleUnread: {
    fontWeight: 'bold',
    color: '#1f2937'
  },
  conversationSubtitleUnread: {
    fontWeight: '600',
    color: '#3b82f6'
  },
  unreadBadge: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: 8
  },
  unreadBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold'
  }
})

