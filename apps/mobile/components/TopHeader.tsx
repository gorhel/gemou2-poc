import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  SafeAreaView
} from 'react-native'
import { router, usePathname } from 'expo-router'
import { getHeaderConfig, HeaderConfig } from '../config/headers.config'
import { useDefaultActionHandlers } from '../hooks/useDefaultActionHandlers'

interface TopHeaderProps {
  // Props optionnelles pour override la config
  overrideTitle?: string
  overrideSubtitle?: string
  overrideShowBackButton?: boolean
  overrideRightActions?: Array<{
    label?: string
    icon?: string
    onPress: () => void
  }>
  // Props pour les valeurs dynamiques
  dynamicTitle?: string
  dynamicSubtitle?: string
  // Handlers pour les actions
  actionHandlers?: Record<string, () => void>
}

export function TopHeader({
  overrideTitle,
  overrideSubtitle,
  overrideShowBackButton,
  overrideRightActions,
  dynamicTitle,
  dynamicSubtitle,
  actionHandlers = {}
}: TopHeaderProps) {
  const pathname = usePathname()
  const config = getHeaderConfig(pathname)
  const defaultHandlers = useDefaultActionHandlers()

  // Déterminer les valeurs finales
  const title = overrideTitle 
    || (config.title === 'dynamic' ? dynamicTitle : config.title)
    || 'Gémou2'

  const subtitle = overrideSubtitle
    || (config.subtitle === 'dynamic' ? dynamicSubtitle : config.subtitle)

  // ✨ NOUVEAU : Vérifier automatiquement s'il y a un historique de navigation
  // Le bouton de retour s'affiche si :
  // 1. Un override explicite est fourni (overrideShowBackButton)
  // 2. OU la config dit de l'afficher (config.showBackButton)
  // 3. OU il y a un historique de navigation (router.canGoBack())
  const canNavigateBack = router.canGoBack()
  const showBackButton = overrideShowBackButton ?? (config.showBackButton || canNavigateBack)

  const rightActions = overrideRightActions || config.rightActions

  // Handler par défaut pour le bouton retour
  const handleBack = () => {
    // Revenir à la page précédente dans l'historique de navigation
    if (canNavigateBack) {
      router.back()
    }
  }

  // Handler pour les actions
  // Priorité : actionHandlers passés en props > handlers par défaut
  const handleAction = (actionId: string) => {
    const customHandler = actionHandlers[actionId]
    const defaultHandler = defaultHandlers[actionId]
    
    if (customHandler) {
      // Si un handler custom est fourni, l'utiliser
      customHandler()
    } else if (defaultHandler) {
      // Sinon utiliser le handler par défaut
      defaultHandler()
    } else {
      // Si aucun handler n'est trouvé, logger un warning
      console.warn(`No handler found for action: ${actionId}`)
    }
  }

  return (
      <View style={styles.header}>
        {/* Left Section: Back Button or Spacer */}
        <View style={styles.leftSection}>
          {showBackButton ? (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Retour</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.spacer} />
          )}
        </View>

        {/* Center Section: Title & Subtitle */}
        <View style={styles.centerSection}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right Section: Actions */}
        <View style={styles.rightSection}>
          {rightActions && rightActions.length > 0 ? (
            <View style={styles.actionsContainer}>
              {rightActions.map((action, index) => {
                // Gérer les deux types d'actions : avec 'onPress' ou avec 'action'
                const handlePress = () => {
                  if ('onPress' in action && action.onPress) {
                    action.onPress()
                  } else if ('action' in action && action.action) {
                    handleAction(action.action)
                  }
                }
                
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={handlePress}
                    style={styles.actionButton}
                  >
                    {action.icon ? (
                      <Text style={styles.actionIcon}>{action.icon}</Text>
                    ) : (
                      <Text style={styles.actionText}>{action.label}</Text>
                    )}
                  </TouchableOpacity>
                )
              })}
            </View>
          ) : (
            <View style={styles.spacer} />
          )}
        </View>
      </View>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'white',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 60,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    //borderWidth: 1,
    //borderColor: '#e5e7eb',
    //borderRadius: 8,
    backgroundColor: 'white',
  },
  actionIcon: {
    fontSize: 18,
  },
  actionText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  spacer: {
    width: 60,
  },
})

