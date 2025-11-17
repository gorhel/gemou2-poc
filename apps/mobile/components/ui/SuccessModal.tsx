import React from 'react'
import { View, Text } from 'react-native'
import { Modal } from './Modal'
import { Button } from './Button'

export interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  confirmText?: string
}

export function SuccessModal({
  isOpen,
  onClose,
  title,
  description,
  confirmText = 'OK'
}: SuccessModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
    >
      <View className="items-center py-6">
        {/* Icône de succès */}
        <View className="items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <Text className="text-4xl">✓</Text>
        </View>

        {/* Titre */}
        <Text className="text-xl font-semibold text-gray-900 mb-2 text-center">
          {title}
        </Text>

        {/* Description */}
        {description && (
          <Text className="text-sm text-gray-600 mb-6 text-center">
            {description}
          </Text>
        )}

        {/* Bouton de confirmation */}
        <Button
          onPress={onClose}
          variant="primary"
          className="w-full"
        >
          {confirmText}
        </Button>
      </View>
    </Modal>
  )
}






