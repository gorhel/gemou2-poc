import React from 'react'
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native'
import PageFooter from './PageFooter'
import { TopHeader } from '../TopHeader'

interface PageLayoutProps {
  children: React.ReactNode
  showHeader?: boolean
  showFooter?: boolean
  refreshing?: boolean
  onRefresh?: () => void
  scrollEnabled?: boolean
  contentContainerStyle?: any
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
  contentContainerStyle
}: PageLayoutProps) {
  return (
    <View style={styles.container}>
      {showHeader && <TopHeader />}
      
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
    backgroundColor: '#f8fafc'
  },
  scrollView: {
    flex: 1
  },
  contentContainer: {
    paddingBottom: 0 // Le footer gère son propre padding
  }
})

