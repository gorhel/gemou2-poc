import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native'
import { router } from 'expo-router'
import { Profile } from './types'
import { ConfirmationModal, ModalVariant } from '../ui'

interface FriendCardProps {
  friend: Profile
  onRemove: (friendId: string, onSuccess?: () => void, onError?: (error: string) => void) => void
  onMessage?: (friendId: string) => void
  onCloseModal?: () => void
}

export function FriendCard({ friend, onRemove, onMessage, onCloseModal }: FriendCardProps) {
  const displayName = friend.full_name || friend.username || 'Utilisateur'
  const username = friend.username ? `@${friend.username}` : ''

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

  const handleRemove = () => {
    onRemove(
      friend.id,
      () => {
        setModalConfig({
          variant: 'info',
          title: 'Ami retiré',
          message: `${displayName} a été retiré de vos amis`
        })
        setModalVisible(true)
      },
      (error) => {
        setModalConfig({
          variant: 'error',
          title: 'Erreur',
          message: error || 'Impossible de retirer cet ami'
        })
        setModalVisible(true)
      }
    )
  }

  const handleViewProfile = () => {
    if (friend.username) {
      // Fermer la modale parente si disponible
      onCloseModal?.()
      // Naviguer vers le profil
      router.push(`/profile/${friend.username}`)
    }
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed
      ]}
      onPress={handleViewProfile}
    >
      <View style={styles.leftSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{displayName}</Text>
          {username && <Text style={styles.username}>{username}</Text>}
          <Text style={styles.viewProfileHint}>Voir le profil →</Text>
        </View>
      </View>

      <View style={styles.actions}>
        {onMessage && (
          <TouchableOpacity
            style={[styles.button, styles.messageButton]}
            onPress={(e) => {
              e.stopPropagation()
              onMessage(friend.id)
            }}
          >
            <Text style={styles.buttonIcon}>💬</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.button, styles.removeButton]}
          onPress={(e) => {
            e.stopPropagation()
            handleRemove()
          }}
        >
          <Text style={styles.buttonIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>

      <ConfirmationModal
        visible={modalVisible}
        variant={modalConfig.variant}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={() => setModalVisible(false)}
      />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardPressed: {
    backgroundColor: '#f8fafc',
    borderColor: '#3b82f6',
    transform: [{ scale: 0.98 }],
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: '#6b7280',
  },
  viewProfileHint: {
    fontSize: 12,
    color: '#3b82f6',
    marginTop: 4,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  messageButton: {
    backgroundColor: '#dbeafe',
  },
  removeButton: {
    backgroundColor: '#fee2e2',
  },
  buttonIcon: {
    fontSize: 18,
  },
})

