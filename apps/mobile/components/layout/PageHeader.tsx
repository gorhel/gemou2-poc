import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  rightAction?: ReactNode;
}

/**
 * Composant Header centralisé pour toutes les pages mobile
 * 
 * @param title - Titre de la page (obligatoire)
 * @param subtitle - Sous-titre ou description
 * @param icon - Emoji ou icône à afficher avant le titre
 * @param showBackButton - Afficher le bouton retour (pour les pages de détail)
 * @param onBack - Fonction personnalisée pour le retour (sinon router.back())
 * @param rightAction - Composant d'action à afficher à droite
 */
export default function PageHeader({
  title,
  subtitle,
  icon,
  showBackButton = false,
  onBack,
  rightAction,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Partie gauche : Bouton retour + Titre */}
        <View style={styles.leftSection}>
          {showBackButton && (
            <TouchableOpacity 
              onPress={handleBack} 
              style={styles.backButton}
              accessibilityLabel="Retour"
              accessibilityRole="button"
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.titleContainer}>
            <View style={styles.titleRow}>
              {icon && <Text style={styles.icon}>{icon}</Text>}
              <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                {title}
              </Text>
            </View>
            {subtitle && (
              <Text style={styles.subtitle} numberOfLines={2} ellipsizeMode="tail">
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        {/* Partie droite : Actions */}
        {rightAction && (
          <View style={styles.rightSection}>
            {rightAction}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
    minWidth: 0,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#374151',
  },
  titleContainer: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  rightSection: {
    flexShrink: 0,
  },
});



