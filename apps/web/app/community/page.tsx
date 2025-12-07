'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClientSupabaseClient } from '../../lib/supabase-client'
import { getUserConversations } from '@gemou2/database'
import { Card, CardHeader, CardTitle, CardContent, LoadingSpinner, Button } from '../../components/ui'
import ResponsiveLayout from '../../components/layout/ResponsiveLayout'

type TabType = 'players' | 'conversations'

interface Profile {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  city: string | null
}

interface InterlocutorProfile {
  user_id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
}

interface ConversationItem {
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

/**
 * Détermine l'image à afficher selon le type de conversation
 */
function getConversationImage(conversation: ConversationItem): string | null {
  switch (conversation.type) {
    case 'marketplace':
      return conversation.marketplace_item?.images?.[0] || null
    case 'event':
      return conversation.event?.image_url || null
    case 'direct':
      return conversation.interlocutor?.avatar_url || null
    case 'group':
      return conversation.members?.[0]?.avatar_url || null
    default:
      return null
  }
}

/**
 * Détermine l'émoji de fallback selon le type de conversation
 */
function getConversationEmoji(type: ConversationItem['type']): string {
  switch (type) {
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
function getConversationTitle(conversation: ConversationItem): string {
  switch (conversation.type) {
    case 'marketplace':
      return conversation.marketplace_item?.title || 'Annonce'
    case 'event':
      return conversation.event?.title || 'Événement'
    case 'direct':
      return conversation.interlocutor?.full_name 
        || conversation.interlocutor?.username 
        || 'Conversation'
    case 'group':
      const memberNames = conversation.members
        ?.slice(0, 2)
        .map(m => m.full_name || m.username || 'Inconnu')
        .join(', ')
      return memberNames 
        ? (conversation.members && conversation.members.length > 2 
            ? `${memberNames} et ${conversation.members.length - 2} autres` 
            : memberNames)
        : 'Groupe'
    default:
      return 'Conversation'
  }
}

export default function CommunityPage() {
  const router = useRouter()
  const supabase = createClientSupabaseClient()
  const [user, setUser] = useState<any>(null)
  const [users, setUsers] = useState<Profile[]>([])
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingConversations, setLoadingConversations] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('players')

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
          router.push('/login')
          return
        }

        setUser(user)

        // Charger les utilisateurs de la communauté
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url, city')
          .neq('id', user.id)
          .limit(20)

        if (usersError) throw usersError
        setUsers(usersData || [])

      } catch (error) {
        console.error('Error loading community:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router, supabase])

  // Charger les conversations quand on switch sur l'onglet conversations
  useEffect(() => {
    if (activeTab === 'conversations' && user && conversations.length === 0) {
      loadConversations()
    }
  }, [activeTab, user])

  const loadConversations = async () => {
    if (!user) return

    setLoadingConversations(true)
    try {
      const { conversations: data, error } = await getUserConversations(supabase, user.id)

      if (error) {
        console.error('Error loading conversations:', error)
        return
      }

      setConversations(data || [])
    } catch (error) {
      console.error('Exception loading conversations:', error)
    } finally {
      setLoadingConversations(false)
    }
  }

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.city?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      return "Aujourd'hui"
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

  if (!user) {
    return null
  }

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">👥 Communauté</h1>
                <p className="text-gray-600">Connectez-vous avec d'autres passionnés de jeux de société</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="flex space-x-4 border-b border-gray-200">
            <button
              className={`pb-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'players'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('players')}
            >
              👥 Joueurs
            </button>
            <button
              className={`pb-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'conversations'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('conversations')}
            >
              💬 Conversations
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {activeTab === 'players' ? (
            <>
              {/* Search */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Rechercher un joueur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Users List */}
              {filteredUsers.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <div className="text-6xl mb-4">👥</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun joueur trouvé</h3>
                    <p className="text-gray-600">
                      {searchQuery ? 'Essayez une autre recherche' : 'Soyez le premier de votre communauté !'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredUsers.map((userItem) => (
                    <Card
                      key={userItem.id}
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => router.push(`/profile/${userItem.username}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden">
                            {userItem.avatar_url ? (
                              <Image
                                src={userItem.avatar_url}
                                alt={userItem.full_name || 'Avatar'}
                                width={56}
                                height={56}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-white text-xl font-bold">
                                {(userItem.full_name || userItem.username || '?')[0].toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {userItem.full_name || userItem.username || 'Utilisateur'}
                            </h3>
                            <p className="text-sm text-gray-500 truncate">@{userItem.username}</p>
                            {userItem.city && (
                              <p className="text-sm text-gray-400 truncate">📍 {userItem.city}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Conversations List */}
              {loadingConversations ? (
                <div className="text-center py-12">
                  <LoadingSpinner size="lg" className="mb-4" />
                  <p className="text-gray-600">Chargement des conversations...</p>
                </div>
              ) : conversations.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune conversation</h3>
                    <p className="text-gray-600">
                      Les conversations de groupe et marketplace apparaîtront ici lorsque vous participerez à des événements ou contacterez un vendeur.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {conversations.map((conversation) => {
                    const isMarketplace = conversation.type === 'marketplace'
                    const isEvent = conversation.type === 'event'
                    const isDirect = conversation.type === 'direct'

                    const imageUrl = getConversationImage(conversation)
                    const fallbackEmoji = getConversationEmoji(conversation.type)
                    const title = getConversationTitle(conversation)

                    const price = isMarketplace && conversation.marketplace_item?.price
                      ? `${conversation.marketplace_item.price}€`
                      : null

                    return (
                      <Card
                        key={conversation.id}
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => router.push(`/conversations/${conversation.id}`)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-4">
                            <div className={`w-16 h-16 ${isDirect ? 'rounded-full' : 'rounded-xl'} bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 ${isDirect && !imageUrl ? 'bg-indigo-100' : ''}`}>
                              {imageUrl ? (
                                <Image
                                  src={imageUrl}
                                  alt={title}
                                  width={64}
                                  height={64}
                                  className={`w-full h-full object-cover ${isDirect ? 'rounded-full' : ''}`}
                                />
                              ) : (
                                <span className="text-3xl">
                                  {fallbackEmoji}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
                              <p className="text-sm text-gray-500">{formatDate(conversation.created_at)}</p>
                              {isEvent && conversation.event?.date_time && (
                                <p className="text-sm text-gray-400">
                                  📅 {new Date(conversation.event.date_time).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              )}
                              {isMarketplace && price && (
                                <p className="text-sm text-gray-400">💰 {price}</p>
                              )}
                            </div>
                            {/* Heure du dernier message */}
                            <div className="flex-shrink-0 text-right">
                              <span className="text-sm text-gray-400">
                                {formatLastMessageTime(conversation.created_at)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ResponsiveLayout>
  )
}
