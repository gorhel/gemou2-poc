'use client'

import React, { useEffect, useState } from 'react'
import { createClientSupabaseClient } from '../../lib/supabase-client'
import { LoadingSpinner } from '../ui/Loading'
import { Button } from '../ui/Button'
import MarketplaceCard from './MarketplaceCard'
import { 
  MarketplaceItemEnriched,
  MarketplaceItemType,
  TYPE_LABELS
} from '../../types/marketplace'

export interface MarketplaceListingsProps {
  limit?: number
}

export const MarketplaceListings: React.FC<MarketplaceListingsProps> = ({ 
  limit = 50 
}) => {
  const [items, setItems] = useState<MarketplaceItemEnriched[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<MarketplaceItemType | 'all'>('all')
  const [selectedItem, setSelectedItem] = useState<MarketplaceItemEnriched | null>(null)
  const supabase = createClientSupabaseClient()

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

  const handleViewDetails = (item: MarketplaceItemEnriched) => {
    setSelectedItem(item)
    // TODO: Ouvrir une modal ou rediriger vers la page de détails
    window.location.href = `/trade/${item.id}`
  }

  const handleContact = async (itemId: string) => {
    // TODO: Implémenter la logique de contact
    alert('Fonctionnalité de contact à venir')
  }

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true
    return item.type === filter
  })

  const getFilterButtonClass = (filterType: string) => {
    const baseClass = 'px-4 py-2 rounded-lg text-sm font-medium transition-colors'
    return filter === filterType
      ? `${baseClass} bg-blue-500 text-white`
      : `${baseClass} bg-gray-100 text-gray-700 hover:bg-gray-200`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <LoadingSpinner size="xl" className="mb-4" />
          <p className="text-gray-600">Chargement des annonces...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <span className="text-4xl">⚠️</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchItems} variant="outline">
          Réessayer
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filtres compacts */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={getFilterButtonClass('all')}
        >
          Tous
        </button>
        <button
          onClick={() => setFilter('sale')}
          className={getFilterButtonClass('sale')}
        >
          💰 {TYPE_LABELS.sale}
        </button>
        <button
          onClick={() => setFilter('exchange')}
          className={getFilterButtonClass('exchange')}
        >
          🔄 {TYPE_LABELS.exchange}
        </button>
        <button
          onClick={() => setFilter('donation')}
          className={getFilterButtonClass('donation')}
        >
          🎁 {TYPE_LABELS.donation}
        </button>
      </div>

      {/* Liste des annonces - Format rectangulaire horizontal */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <span className="text-6xl">🛒</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune annonce trouvée</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'Il n\'y a pas encore d\'annonces disponibles.'
              : `Aucune annonce de type "${TYPE_LABELS[filter]}" n'est disponible.`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <MarketplaceCard
              key={item.id}
              item={item}
              onViewDetails={handleViewDetails}
              onContact={handleContact}
            />
          ))}
        </div>
      )}
    </div>
  )
}

