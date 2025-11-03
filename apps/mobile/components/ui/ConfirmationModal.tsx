import React from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated
} from 'react-native'

export type ModalVariant = 'success' | 'error' | 'info' | 'warning'

interface ConfirmationModalProps {
  visible: boolean
  variant: ModalVariant
  title: string
  message: string
  onClose: () => void
  autoClose?: boolean
  autoCloseDuration?: number
}

const VARIANT_CONFIG = {
  success: {
    emoji: '✅',
    color: '#10b981',
    backgroundColor: '#d1fae5'
  },
  error: {
    emoji: '❌',
    color: '#ef4444',
    backgroundColor: '#fee2e2'
  },
  info: {
    emoji: 'ℹ️',
    color: '#3b82f6',
    backgroundColor: '#dbeafe'
  },
  warning: {
    emoji: '⚠️',
    color: '#f59e0b',
    backgroundColor: '#fef3c7'
  }
}

export function ConfirmationModal({
  visible,
  variant,
  title,
  message,
  onClose,
  autoClose = true,
  autoCloseDuration = 2000
}: ConfirmationModalProps) {
  const config = VARIANT_CONFIG[variant]

  React.useEffect(() => {
    if (visible && autoClose) {
      const timer = setTimeout(() => {
        onClose()
      }, autoCloseDuration)

      return () => clearTimeout(timer)
    }
  }, [visible, autoClose, autoCloseDuration, onClose])

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={[styles.iconContainer, { backgroundColor: config.backgroundColor }]}>
            <Text style={styles.iconEmoji}>{config.emoji}</Text>
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {!autoClose && (
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: config.color }]}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  iconEmoji: {
    fontSize: 32
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  }
})

