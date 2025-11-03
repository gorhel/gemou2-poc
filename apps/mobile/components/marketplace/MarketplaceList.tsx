import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, TextInput } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../../lib/supabase'
import MarketplaceCard from './MarketplaceCard'

interface MarketplaceItem {
  id: string
  title: string
  description: string | null
  price: number | null
  type: 'sale' | 'exchange' | 'donation'
  condition: string | null
  seller_id: string | null
  images: string[] | null
  status: string
  location: string | null
  location_quarter: string | null
  location_city: string | null
  game_id: string | null
  game_name: string | null
  game_photo: string | null
  wanted_game: string | null
  created_at: string
}

type FilterType = 'all' | 'sale' | 'exchange' | 'donation'

const TYPE_LABELS = {
  sale: 'Vente',
  exchange: 'Échange',
  donation: 'Don'
}

interface MarketplaceListProps {
  limit?: number
}

export default function MarketplaceList({ limit = 50 }: MarketplaceListProps) {
  const [items, setItems] = useState<MarketplaceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('marketplace_items_enriched')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (fetchError) {
        console.error('Error fetching marketplace items:', fetchError)
        setError('Erreur lors du chargement des annonces')
        return
      }

      setItems(data || [])
    } catch (err) {
      console.error('Error:', err)
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (item: MarketplaceItem) => {
    router.push(`/trade/${item.id}`)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
  }

  // Filtrage combiné : type + recherche textuelle
  const filteredItems = items.filter(item => {
    // Filtre par type
    const typeMatch = filter === 'all' || item.type === filter

    // Filtre par recherche textuelle
    if (!searchQuery.trim()) {
      return typeMatch
    }

    const query = searchQuery.toLowerCase().trim()
    const searchableText = [
      item.title,
      item.description,
      item.game_name,
      item.location,
      item.location_city,
      item.location_quarter
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const textMatch = searchableText.includes(query)

    return typeMatch && textMatch
  })

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Chargement des annonces...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorTitle}>Erreur de chargement</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity 
          onPress={fetchItems}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une annonce, un jeu..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filtres compacts */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScrollView}
        contentContainerStyle={styles.filtersContent}
      >
        <TouchableOpacity
          onPress={() => setFilter('all')}
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Tous
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilter('sale')}
          style={[styles.filterButton, filter === 'sale' && styles.filterButtonActive]}
        >
          <Text style={[styles.filterText, filter === 'sale' && styles.filterTextActive]}>
            💰 {TYPE_LABELS.sale}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilter('exchange')}
          style={[styles.filterButton, filter === 'exchange' && styles.filterButtonActive]}
        >
          <Text style={[styles.filterText, filter === 'exchange' && styles.filterTextActive]}>
            🔄 {TYPE_LABELS.exchange}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilter('donation')}
          style={[styles.filterButton, filter === 'donation' && styles.filterButtonActive]}
        >
          <Text style={[styles.filterText, filter === 'donation' && styles.filterTextActive]}>
            🎁 {TYPE_LABELS.donation}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Liste des annonces */}
      <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
        {filteredItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🛒</Text>
            <Text style={styles.emptyTitle}>Aucune annonce trouvée</Text>
            <Text style={styles.emptyMessage}>
              {searchQuery.trim() 
                ? `Aucun résultat pour "${searchQuery}"`
                : filter === 'all' 
                  ? 'Il n\'y a pas encore d\'annonces disponibles.'
                  : `Aucune annonce de type "${TYPE_LABELS[filter]}" n'est disponible.`
              }
            </Text>
          </View>
        ) : (
          filteredItems.map((item) => (
            <MarketplaceCard
              key={item.id}
              item={item}
              onViewDetails={handleViewDetails}
            />
          ))
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  // Barre de recherche
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: 'white',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  clearButtonText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '500',
  },
  // Filtres optimisés
  filtersScrollView: {
    flexGrow: 0,
    flexShrink: 0,
    maxHeight: 50,
    paddingVertical: 8,
    backgroundColor: 'white',
  },
  filtersContent: {
    paddingHorizontal: 16,
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#dbeafe',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  filterTextActive: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100, // Espace pour le bouton fixe
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
})

