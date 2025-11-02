import React, { useEffect } from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Pressable,
  Dimensions,
} from 'react-native';
import { Button } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  footer?: React.ReactNode;
  className?: string;
}

const getModalSizeStyle = (size: ModalProps['size'] = 'md') => {
  const { width } = Dimensions.get('window');
  
  const sizeStyles = {
    sm: { width: Math.min(width * 0.8, 400) },
    md: { width: Math.min(width * 0.85, 500) },
    lg: { width: Math.min(width * 0.9, 700) },
    xl: { width: Math.min(width * 0.95, 900) },
    full: { width: width - 32, marginHorizontal: 16 },
  };

  return sizeStyles[size];
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  footer,
  className = '',
}) => {
  const modalSizeStyle = getModalSizeStyle(size);

  return (
    <RNModal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 items-center justify-center bg-black/50">
        {/* Overlay - pour fermer au clic */}
        <Pressable
          className="absolute inset-0"
          onPress={closeOnOverlayClick ? onClose : undefined}
        />

        {/* Modal content */}
        <View
          className={`bg-white rounded-lg shadow-xl overflow-hidden ${className}`}
          style={[modalSizeStyle, { maxHeight: '90%' }]}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <View className="flex-row items-center justify-between p-6 border-b border-gray-200">
              <View className="flex-1">
                {title && (
                  <Text className="text-lg font-semibold text-gray-900">
                    {title}
                  </Text>
                )}
                {description && (
                  <Text className="mt-1 text-sm text-gray-600">
                    {description}
                  </Text>
                )}
              </View>

              {showCloseButton && (
                <TouchableOpacity
                  onPress={onClose}
                  className="p-2 rounded-md bg-gray-100"
                  activeOpacity={0.7}
                >
                  <Text className="text-gray-600 text-xl">×</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Content */}
          <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>

          {/* Footer */}
          {footer && (
            <View className="flex-row items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              {footer}
            </View>
          )}
        </View>
      </View>
    </RNModal>
  );
};

// Composant Modal de confirmation
export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'default' | 'destructive';
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  confirmVariant = 'default',
  loading = false,
}) => {
  const handleConfirm = () => {
    onConfirm();
    if (!loading) {
      onClose();
    }
  };

  // Mapper les variantes vers celles du Button
  const buttonVariant = confirmVariant === 'destructive' ? 'danger' : 'primary';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <View className="flex-row space-x-3">
          <Button variant="ghost" onPress={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={buttonVariant}
            onPress={handleConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </View>
      }
    >
      <View className="items-center py-4">
        <View className="items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
          <Text className="text-2xl text-gray-600">⚠️</Text>
        </View>
        <Text className="text-sm text-gray-600 text-center">
          {description || 'Êtes-vous sûr de vouloir continuer ?'}
        </Text>
      </View>
    </Modal>
  );
};

// Hook personnalisé pour gérer les modales
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = React.useState(initialState);

  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);
  const toggle = React.useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
};

