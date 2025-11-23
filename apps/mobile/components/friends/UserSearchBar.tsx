import React, { useState, useCallback } from 'react'
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Platform
} from 'react-native'
import { supabase } from '../../lib'
import { Profile } from './types'
import { ConfirmationModal, ModalVariant } from '../ui'

interface UserSearchBarProps {
  onSendRequest: (userId: string, onSuccess?: () => void, onError?: (error: string) => void) => void
  currentUserId: string
  existingFriendIds: string[]
  pendingRequestIds: string[]
}

export function UserSearchBar({
  onSendRequest,
  currentUserId,
  existingFriendIds,
  pendingRequestIds
}: UserSearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalConfig, setModalConfig] = useState<{
    variant: ModalVariant
    title: string
    message: string
  }>({
    variant: 'success',
    title: '',
    message: ''
  })

  const searchUsers = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([])
      setShowResults(false)
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, bio, friends_list_public')
        .neq('id', currentUserId)
        .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
        .limit(10)

      if (error) throw error

      setResults((data || []) as Profile[])
      setShowResults(true)
    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
    } finally {
      setLoading(false)
    }
  }, [currentUserId])

  const handleSearch = (text: string) => {
    setQuery(text)
    searchUsers(text)
  }

  const getButtonStatus = (userId: string) => {
    if (existingFriendIds.includes(userId)) return 'friend'
    if (pendingRequestIds.includes(userId)) return 'pending'
    return 'add'
  }

  const renderUserItem = ({ item }: { item: Profile }) => {
    const status = getButtonStatus(item.id)
    const displayName = item.full_name || item.username || 'Utilisateur'
    const username = item.username ? `@${item.username}` : ''

    return (
      <View style={styles.resultItem}>
        <View style={styles.resultLeft}>
          <View style={styles.resultAvatar}>
            <Text style={styles.resultAvatarText}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.resultInfo}>
            <Text style={styles.resultName}>{displayName}</Text>
            {username && <Text style={styles.resultUsername}>{username}</Text>}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.actionButton,
            status === 'friend' && styles.friendButton,
            status === 'pending' && styles.pendingButton
          ]}
          onPress={() => {
            if (status === 'add') {
              onSendRequest(
                item.id,
                () => {
                  setModalConfig({
                    variant: 'success',
                    title: 'Demande envoyée',
                    message: `Demande d'ami envoyée à ${displayName}`
                  })
                  setModalVisible(true)
                },
                (error) => {
                  setModalConfig({
                    variant: 'error',
                    title: 'Erreur',
                    message: error || 'Impossible d\'envoyer la demande'
                  })
                  setModalVisible(true)
                }
              )
            }
          }}
          disabled={status !== 'add'}
        >
          <Text style={styles.actionButtonText}>
            {status === 'add' && '➕ Ajouter'}
            {status === 'pending' && '⏳ En attente'}
            {status === 'friend' && '✅ Amis'}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchInputContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un utilisateur..."
          placeholderTextColor="#9ca3af"
          value={query}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {loading && <ActivityIndicator size="small" color="#3b82f6" />}
      </View>

      {showResults && results.length > 0 && (
        <View style={styles.resultsContainer}>
          <FlatList
            data={results}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      )}

      {showResults && results.length === 0 && !loading && (
        <View style={styles.noResults}>
          <Text style={styles.noResultsText}>Aucun utilisateur trouvé</Text>
        </View>
      )}

      <ConfirmationModal
        visible={modalVisible}
        variant={modalConfig.variant}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={() => setModalVisible(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    padding: 42,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    backgroundColor: '#f9fafb',
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    height: 56,
    backgroundColor: '#f9fafb',
  },
  resultsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
  },
  resultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  resultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultAvatarText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  resultUsername: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
  },
  friendButton: {
    backgroundColor: '#10b981',
  },
  pendingButton: {
    backgroundColor: '#f59e0b',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  noResults: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
    alignItems: 'center',
  },
  noResultsText: {
    color: '#6b7280',
    fontSize: 14,
  },
})

