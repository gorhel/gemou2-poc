import React from 'react'
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native'
import PageFooter from './PageFooter'
import { TopHeader } from '../TopHeader'
import MachiColors from '../../theme/colors'

interface PageLayoutProps {
  children: React.ReactNode
  showHeader?: boolean
  showFooter?: boolean
  refreshing?: boolean
  onRefresh?: () => void
  scrollEnabled?: boolean
  contentContainerStyle?: any
  // Props pour le TopHeader
  overrideTitle?: string
  overrideSubtitle?: string
  overrideShowBackButton?: boolean
  overrideRightActions?: Array<{
    label?: string
    icon?: string
    onPress: () => void
  }>
  dynamicTitle?: string
  dynamicSubtitle?: string
  actionHandlers?: Record<string, () => void>
}

/**
 * Composant de layout réutilisable pour les pages mobile
 * 
 * Intègre automatiquement :
 * - TopHeader (optionnel)
 * - ScrollView avec RefreshControl
 * - PageFooter (optionnel)
 * 
 * @example
 * ```tsx
 * export default function MyPage() {
 *   const [refreshing, setRefreshing] = useState(false)
 * 
 *   const onRefresh = async () => {
 *     setRefreshing(true)
 *     await loadData()
 *     setRefreshing(false)
 *   }
 * 
 *   return (
 *     <PageLayout refreshing={refreshing} onRefresh={onRefresh}>
 *       <Text>Mon contenu</Text>
 *     </PageLayout>
 *   )
 * }
 * ```
 */
export function PageLayout({
  children,
  showHeader = true,
  showFooter = true,
  refreshing = false,
  onRefresh,
  scrollEnabled = true,
  contentContainerStyle,
  overrideTitle,
  overrideSubtitle,
  overrideShowBackButton,
  overrideRightActions,
  dynamicTitle,
  dynamicSubtitle,
  actionHandlers
}: PageLayoutProps) {
  return (
    <View style={styles.container}>
      {showHeader && (
        <TopHeader
          overrideTitle={overrideTitle}
          overrideSubtitle={overrideSubtitle}
          overrideShowBackButton={overrideShowBackButton}
          overrideRightActions={overrideRightActions}
          dynamicTitle={dynamicTitle}
          dynamicSubtitle={dynamicSubtitle}
          actionHandlers={actionHandlers}
        />
      )}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
        scrollEnabled={scrollEnabled}
      >
        {children}
        
        {showFooter && <PageFooter />}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MachiColors.background
  },
  scrollView: {
    flex: 1
  },
  contentContainer: {
    paddingBottom: 0 // Le footer gère son propre padding
  }
})

