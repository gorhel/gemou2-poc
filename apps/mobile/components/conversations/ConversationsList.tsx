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
import { supabase } from '../../lib'

interface ConversationItemProps {
  id: string
  type: string
  event: {
    id: string
    title: string
    image_url: string | null
    date_time: string
  } | null
  created_at: string
}

export function ConversationsList() {
  const [conversations, setConversations] = useState<ConversationItemProps[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [user, setUser] = useState<any>(null)

  const loadConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }

      setUser(user)

      const { conversations: data, error } = await getUserConversations(supabase, user.id)
      
      if (error) {
        console.error('Error loading conversations:', error)
        return
      }

      setConversations(data || [])
    } catch (error) {
      console.error('Error loading conversations:', error)
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

  const renderConversation = ({ item }: { item: ConversationItemProps }) => (
    <TouchableOpacity
      style={styles.conversationCard}
      onPress={() => router.push(`/conversations/${item.id}`)}
    >
      <View style={styles.conversationImageContainer}>
        {item.event?.image_url ? (
          <Image
            source={{ uri: item.event.image_url }}
            style={styles.conversationImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.conversationImagePlaceholder}>
            <Text style={styles.conversationImageEmoji}>💬</Text>
          </View>
        )}
      </View>

      <View style={styles.conversationInfo}>
        <Text style={styles.conversationTitle} numberOfLines={1}>
          {item.event?.title || 'Conversation'}
        </Text>
        <Text style={styles.conversationSubtitle} numberOfLines={1}>
          {formatDate(item.created_at)}
        </Text>
        {item.event?.date_time && (
          <Text style={styles.conversationDate}>
            📅 {new Date(item.event.date_time).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.viewEventButton}
        onPress={(e) => {
          e.stopPropagation()
          if (item.event?.id) {
            router.push(`/events/${item.event.id}`)
          }
        }}
      >
        <Text style={styles.viewEventButtonText}>Voir l'événement</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  )

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
          Les conversations de groupe apparaîtront ici lorsque vous participerez à des événements.
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
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  conversationImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12
  },
  conversationImage: {
    width: '100%',
    height: '100%'
  },
  conversationImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center'
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
  viewEventButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  viewEventButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6'
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
  }
})

