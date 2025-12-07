import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Pressable } from 'react-native'
import { router } from 'expo-router'
import { FriendRequest } from './types'
import { ConfirmationModal, ModalVariant } from '../ui'

interface SentRequestCardProps {
  request: FriendRequest
  onCancel: (requestId: string, onSuccess?: () => void, onError?: (error: string) => void) => void
  loading?: boolean
  onCloseModal?: () => void
}

export function SentRequestCard({ 
  request, 
  onCancel, 
  loading = false,
  onCloseModal
}: SentRequestCardProps) {
  const receiver = request.receiver
  const displayName = receiver?.full_name || receiver?.username || 'Utilisateur'
  const username = receiver?.username ? `@${receiver.username}` : ''

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

  const handleViewProfile = () => {
    if (receiver?.username) {
      // Fermer la modale parente si disponible
      onCloseModal?.()
      // Naviguer vers le profil
      router.push(`/profile/${receiver.username}`)
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
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>⏳ En attente</Text>
          </View>
          <Text style={styles.viewProfileHint}>Voir le profil →</Text>
        </View>
      </View>

      <View style={styles.actions}>
        {loading ? (
          <ActivityIndicator size="small" color="#ef4444" />
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={(e) => {
              e.stopPropagation()
              onCancel(
                request.id,
                () => {
                  setModalConfig({
                    variant: 'info',
                    title: 'Demande annulée',
                    message: `Demande d'ami à ${displayName} annulée`
                  })
                  setModalVisible(true)
                },
                (error) => {
                  setModalConfig({
                    variant: 'error',
                    title: 'Erreur',
                    message: error || 'Impossible d\'annuler la demande'
                  })
                  setModalVisible(true)
                }
              )
            }}
          >
            <Text style={styles.cancelText}>❌</Text>
          </TouchableOpacity>
        )}
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
    backgroundColor: '#6b7280',
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
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 12,
    color: '#92400e',
  },
  viewProfileHint: {
    fontSize: 12,
    color: '#3b82f6',
    marginTop: 4,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#fee2e2',
  },
  cancelText: {
    fontSize: 18,
  },
})

