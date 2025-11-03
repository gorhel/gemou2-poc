import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { FriendRequest } from './types'
import { ConfirmationModal, ModalVariant } from '../ui'

interface FriendRequestCardProps {
  request: FriendRequest
  onAccept: (requestId: string, onSuccess?: () => void, onError?: (error: string) => void) => void
  onReject: (requestId: string, onSuccess?: () => void, onError?: (error: string) => void) => void
  loading?: boolean
}

export function FriendRequestCard({ 
  request, 
  onAccept, 
  onReject, 
  loading = false 
}: FriendRequestCardProps) {
  const sender = request.sender
  const displayName = sender?.full_name || sender?.username || 'Utilisateur'
  const username = sender?.username ? `@${sender.username}` : ''

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

  return (
    <View style={styles.card}>
      <View style={styles.leftSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{displayName}</Text>
          {username && <Text style={styles.username}>{username}</Text>}
        </View>
      </View>

      <View style={styles.actions}>
        {loading ? (
          <ActivityIndicator size="small" color="#3b82f6" />
        ) : (
          <>
            <TouchableOpacity
              style={[styles.button, styles.acceptButton]}
              onPress={() => {
                onAccept(
                  request.id,
                  () => {
                    setModalConfig({
                      variant: 'success',
                      title: 'Demande acceptée',
                      message: `${displayName} est maintenant votre ami !`
                    })
                    setModalVisible(true)
                  },
                  (error) => {
                    setModalConfig({
                      variant: 'error',
                      title: 'Erreur',
                      message: error || 'Impossible d\'accepter la demande'
                    })
                    setModalVisible(true)
                  }
                )
              }}
            >
              <Text style={styles.acceptText}>✅</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.rejectButton]}
              onPress={() => {
                onReject(
                  request.id,
                  () => {
                    setModalConfig({
                      variant: 'info',
                      title: 'Demande refusée',
                      message: `La demande de ${displayName} a été refusée`
                    })
                    setModalVisible(true)
                  },
                  (error) => {
                    setModalConfig({
                      variant: 'error',
                      title: 'Erreur',
                      message: error || 'Impossible de refuser la demande'
                    })
                    setModalVisible(true)
                  }
                )
              }}
            >
              <Text style={styles.rejectText}>❌</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

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
    backgroundColor: '#3b82f6',
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
  },
  acceptButton: {
    backgroundColor: '#dcfce7',
  },
  acceptText: {
    fontSize: 18,
  },
  rejectButton: {
    backgroundColor: '#fee2e2',
  },
  rejectText: {
    fontSize: 18,
  },
})

