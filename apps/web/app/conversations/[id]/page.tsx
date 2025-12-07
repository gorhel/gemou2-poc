'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClientSupabaseClient } from '../../../lib/supabase-client'
import { 
  getConversationDetails, 
  getConversationMessages, 
  getConversationMembers, 
  sendMessage 
} from '@gemou2/database'
import { ResponsiveLayout, PageHeader } from '../../../components/layout'
import { Button, Card, CardContent, LoadingSpinner } from '../../../components/ui'

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
  const router = useRouter()
  const params = useParams()
  const conversationId = params.id as string
  const supabase = createClientSupabaseClient()

  const [user, setUser] = useState<any>(null)
  const [conversation, setConversation] = useState<ConversationDetails | null>(null)
  const [members, setMembers] = useState<ConversationMember[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const loadMessages = useCallback(async () => {
    try {
      const { messages: messagesData, error: msgError } = await getConversationMessages(supabase, conversationId)
      if (msgError) {
        console.error('Error loading messages:', msgError)
        return
      }
      setMessages(messagesData || [])
      setTimeout(scrollToBottom, 100)
    } catch (err) {
      console.error('Error:', err)
    }
  }, [supabase, conversationId, scrollToBottom])

  useEffect(() => {
    const loadConversation = async () => {
      try {
        console.log('[ConversationPage] Loading conversation:', conversationId)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          console.error('[ConversationPage] No user, redirecting to login')
          router.replace('/login')
          return
        }
        setUser(user)

        // Charger les détails de la conversation
        const { conversation: convData, error: convError } = await getConversationDetails(supabase, conversationId)
        if (convError) {
          console.error('[ConversationPage] Error loading conversation:', convError)
          
          if (convError.code === 'NOT_MEMBER') {
            setError('Vous n\'êtes pas membre de cette conversation')
            return
          }
          
          if (convError.code === 'NOT_FOUND') {
            setError('Cette conversation n\'existe pas ou a été supprimée')
            return
          }
          
          setError('Erreur lors du chargement de la conversation')
          return
        }

        if (!convData) {
          setError('Conversation introuvable')
          return
        }

        setConversation(convData)

        // Charger les membres de la conversation
        const { members: membersData, error: membersError } = await getConversationMembers(supabase, conversationId)
        if (!membersError && membersData) {
          setMembers(membersData)
        }

        // Charger les messages
        await loadMessages()
      } catch (err) {
        console.error('[ConversationPage] Exception:', err)
        setError('Une erreur est survenue')
      } finally {
        setLoading(false)
      }
    }

    loadConversation()

    // S'abonner aux nouveaux messages en temps réel
    const subscription = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        () => {
          loadMessages()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [conversationId, supabase, router, loadMessages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim() || !user || sending) return

    setSending(true)
    try {
      const { error: sendError } = await sendMessage(supabase, conversationId, user.id, messageText.trim())

      if (sendError) {
        console.error('Error sending message:', sendError)
        return
      }

      setMessageText('')
      await loadMessages()
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setSending(false)
    }
  }

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Aujourd\'hui'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier'
    }
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
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
    return members.find(m => m.user_id !== user.id) || null
  }

  // Obtenir le titre du header (prénom de l'interlocuteur + nom de l'annonce/event)
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

  // Grouper les messages par date
  const groupMessagesByDate = () => {
    const groups: { date: string; messages: Message[] }[] = []
    let currentDate = ''

    messages.forEach(message => {
      const messageDate = formatMessageDate(message.created_at)
      if (messageDate !== currentDate) {
        currentDate = messageDate
        groups.push({ date: messageDate, messages: [message] })
      } else {
        groups[groups.length - 1].messages.push(message)
      }
    })

    return groups
  }

  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="xl" className="mb-4" />
            <p className="text-gray-600 text-lg">Chargement...</p>
          </div>
        </div>
      </ResponsiveLayout>
    )
  }

  if (error || !conversation) {
    return (
      <ResponsiveLayout>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">😕</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {error || 'Conversation introuvable'}
              </h2>
              <p className="text-gray-600 mb-6">
                Cette conversation n'existe pas ou n'est plus accessible.
              </p>
              <Button onClick={() => router.back()}>
                ← Retour
              </Button>
            </CardContent>
          </Card>
        </div>
      </ResponsiveLayout>
    )
  }

  const interlocutor = getInterlocutor()
  const vignetteImage = getVignetteImage()
  const itemTitle = getItemTitle()
  const messageGroups = groupMessagesByDate()

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex flex-col">
        {/* PageHeader avec titre: "← Retour | Prénom • Titre annonce/event" */}
        <PageHeader
          icon="💬"
          title={getHeaderTitle()}
          showBackButton
        />

        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col px-4 sm:px-6 lg:px-8 py-4">
          {/* Vignette Card avec image et info interlocuteur */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* 🖼️ Image de l'annonce/event à gauche [cliquable] */}
                <Link
                  href={conversation.type === 'event' && conversation.event_id 
                    ? `/events/${conversation.event_id}` 
                    : `/trade/${conversation.marketplace_item_id}`}
                  className="flex-shrink-0"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                    {vignetteImage ? (
                      <img
                        src={vignetteImage}
                        alt={itemTitle}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        {conversation.type === 'marketplace' ? '🛒' : '🎮'}
                      </div>
                    )}
                  </div>
                </Link>

                {/* 📋 Info interlocuteur à droite */}
                <div className="flex-1 min-w-0">
                  {conversation.type === 'marketplace' && interlocutor ? (
                    <Link
                      href={`/profile/${interlocutor.username}`}
                      className="flex items-center gap-3 mb-2 group"
                    >
                      {/* 👤 Avatar */}
                      {interlocutor.avatar_url ? (
                        <img
                          src={interlocutor.avatar_url}
                          alt={interlocutor.username || 'Utilisateur'}
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 group-hover:border-primary-400 transition-colors"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-semibold text-sm">
                          {getInitials(interlocutor.full_name || interlocutor.username || 'U')}
                        </div>
                      )}
                      <div className="min-w-0">
                        {/* 📝 Prénom (si présent) */}
                        {interlocutor.full_name && (
                          <p className="font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                            {interlocutor.full_name}
                          </p>
                        )}
                        {/* 📝 @pseudo */}
                        <p className="text-sm text-gray-500 truncate">
                          @{interlocutor.username || 'utilisateur'}
                        </p>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white text-lg">
                        👥
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Groupe</p>
                        <p className="text-sm text-gray-500">{members.length} participants</p>
                      </div>
                    </div>
                  )}

                  {/* 📝 Titre item + 🔗 Lien "Voir l'annonce/event →" */}
                  <Link
                    href={conversation.type === 'event' && conversation.event_id 
                      ? `/events/${conversation.event_id}` 
                      : `/trade/${conversation.marketplace_item_id}`}
                    className="block"
                  >
                    <p className="text-sm font-medium text-gray-700 truncate hover:text-primary-600 transition-colors">
                      {itemTitle}
                    </p>
                    <p className="text-xs text-primary-600 font-medium">
                      {conversation.type === 'event' ? 'Voir l\'événement →' : 'Voir l\'annonce →'}
                    </p>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 📦 Zone Messages */}
          <Card className="flex-1 flex flex-col overflow-hidden">
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-6"
              style={{ maxHeight: 'calc(100vh - 400px)', minHeight: '300px' }}
            >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun message</h3>
                  <p className="text-gray-500 text-center">Soyez le premier à envoyer un message !</p>
                </div>
              ) : (
                messageGroups.map((group, groupIndex) => (
                  <div key={groupIndex}>
                    {/* 📅 Séparateurs de date */}
                    <div className="flex items-center justify-center mb-4">
                      <div className="bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                        {group.date}
                      </div>
                    </div>

                    {/* 💬 Messages (avatar + bulle + heure) */}
                    <div className="space-y-3">
                      {group.messages.map((message) => {
                        const isOwnMessage = message.sender_id === user?.id
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`flex items-end gap-2 max-w-[75%] ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                              {/* Avatar (seulement pour les autres) */}
                              {!isOwnMessage && (
                                <div className="flex-shrink-0">
                                  {message.profiles?.avatar_url ? (
                                    <img
                                      src={message.profiles.avatar_url}
                                      alt={message.profiles.username}
                                      className="w-8 h-8 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div 
                                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                      style={{ backgroundColor: `hsl(${message.sender_id.charCodeAt(0) * 137.5 % 360}, 70%, 50%)` }}
                                    >
                                      {getInitials(message.profiles?.full_name || message.profiles?.username || 'U')}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Bulle de message */}
                              <div
                                className={`rounded-2xl px-4 py-2 ${
                                  isOwnMessage
                                    ? 'bg-primary-500 text-white rounded-br-sm'
                                    : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
                                }`}
                              >
                                {!isOwnMessage && (
                                  <p className="text-xs font-medium text-gray-500 mb-1">
                                    @{message.profiles?.username || 'Utilisateur'}
                                  </p>
                                )}
                                <p className="text-sm whitespace-pre-wrap break-words">
                                  {message.content}
                                </p>
                                <p className={`text-xs mt-1 ${isOwnMessage ? 'text-white/70' : 'text-gray-400'}`}>
                                  {formatMessageTime(message.created_at)}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 📦 Zone de saisie */}
            <form onSubmit={handleSendMessage} className="border-t p-4 bg-white">
              <div className="flex gap-3">
                {/* 📝 Input texte */}
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Écrivez un message..."
                  className="flex-1 px-4 py-3 rounded-full border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                  maxLength={1000}
                />
                {/* 🔘 Bouton envoyer */}
                <Button
                  type="submit"
                  disabled={!messageText.trim() || sending}
                  className="rounded-full w-12 h-12 flex items-center justify-center"
                >
                  {sending ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <span className="text-lg">➤</span>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </ResponsiveLayout>
  )
}

