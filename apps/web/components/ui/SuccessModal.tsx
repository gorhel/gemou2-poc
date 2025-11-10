'use client'

import React from 'react'
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
      <div className="text-center py-6">
        {/* Icône de succès */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <svg
            className="h-10 w-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Titre */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-600 mb-6">
            {description}
          </p>
        )}

        {/* Bouton de confirmation */}
        <Button
          onClick={onClose}
          className="w-full"
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  )
}




