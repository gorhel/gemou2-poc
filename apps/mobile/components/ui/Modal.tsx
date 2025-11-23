import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { Button } from './Button';
import MachiColors from '../../theme/colors';

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
  contentPadding?: number;
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
  contentPadding = 24,
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
      <View style={styles.modalOverlay}>
        {/* Overlay - pour fermer au clic */}
        <Pressable
          style={styles.overlayPressable}
          onPress={closeOnOverlayClick ? onClose : undefined}
        />

        {/* Modal content */}
        <View style={[styles.modalContent, modalSizeStyle, { maxHeight: '90%' }]}>
          {/* Header */}
          {(title || showCloseButton) && (
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                {title && (
                  <Text style={styles.modalTitle}>
                    {title}
                  </Text>
                )}
                {description && (
                  <Text style={styles.modalDescription}>
                    {description}
                  </Text>
                )}
              </View>

              {showCloseButton && (
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Content */}
          <ScrollView style={[styles.modalScrollView, { padding: contentPadding }]} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>

          {/* Footer */}
          {footer && (
            <View style={styles.modalFooter}>
              {React.Children.map(React.Children.toArray(footer), (child, index) => {
                if (index > 0) {
                  return (
                    <React.Fragment key={index}>
                      <View style={{ width: 12 }} />
                      {child}
                    </React.Fragment>
                  )
                }
                return child
              })}
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
      description={undefined}
      size="sm"
      footer={
        <View style={styles.confirmModalFooter}>
          <Button variant="ghost" onPress={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <View style={styles.confirmModalFooterSpacer} />
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
      <View style={styles.confirmModalContent}>
        <View style={styles.confirmModalIconContainer}>
          <Text style={styles.confirmModalIcon}>⚠️</Text>
        </View>
        <Text style={styles.confirmModalMessage}>
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

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayPressable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: MachiColors.border,
  },
  modalHeaderContent: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: MachiColors.text,
  },
  modalDescription: {
    marginTop: 4,
    fontSize: 14,
    color: MachiColors.textSecondary,
  },
  closeButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: MachiColors.neutral,
  },
  closeButtonText: {
    color: MachiColors.textSecondary,
    fontSize: 20,
    fontWeight: '600',
  },
  modalScrollView: {
    // padding est maintenant contrôlé par la prop contentPadding
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: MachiColors.border,
    backgroundColor: MachiColors.background,
  },
  confirmModalContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  confirmModalIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: MachiColors.neutral,
    marginBottom: 16,
  },
  confirmModalIcon: {
    fontSize: 24,
    color: MachiColors.textSecondary,
  },
  confirmModalMessage: {
    fontSize: 14,
    color: MachiColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  confirmModalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confirmModalFooterSpacer: {
    width: 12,
  },
});

