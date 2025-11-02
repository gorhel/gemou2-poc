'use client'

import React from 'react'
import { Button } from '../ui/Button'
import { 
  MarketplaceItemEnriched,
  getTypeIcon,
  formatLocation
} from '../../types/marketplace'

interface MarketplaceCardProps {
  item: MarketplaceItemEnriched
  onViewDetails: (item: MarketplaceItemEnriched) => void
  onContact?: (itemId: string) => void
}

export default function MarketplaceCard({ 
  item, 
  onViewDetails,
  onContact 
}: MarketplaceCardProps) {
  const getDefaultImage = () => {
    if (item.images && item.images.length > 0) {
      return item.images[0]
    }
    if (item.game_photo) {
      return item.game_photo
    }
    return '/placeholder-game.jpg'
  }

  const formatPrice = () => {
    if (item.type === 'donation') {
      return 'Gratuit'
    }
    if (item.type === 'sale' && item.price) {
      return `${item.price.toFixed(2)} €`
    }
    return null
  }

  const price = formatPrice()
  const typeIcon = getTypeIcon(item.type)
  const location = formatLocation(item)

  return (
    <div 
      className="relative h-48 rounded-lg overflow-hidden cursor-pointer group hover:scale-105 transition-transform duration-200"
      onClick={() => onViewDetails(item)}
    >
      {/* Image de fond */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-gray-300"
        style={{
          backgroundImage: `url(${getDefaultImage()})`
        }}
      >
        {/* Overlay sombre pour la lisibilité */}
        <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-opacity duration-200" />
      </div>

      {/* Badge type en haut à droite */}
      <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-xs font-medium shadow-sm">
        {typeIcon}
      </div>

      {/* Contenu en bas */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        {/* Titre avec emoji */}
        <h3 className="text-lg font-bold mb-1 line-clamp-1">
          {typeIcon} {item.title}
        </h3>
        
        {/* Informations */}
        <div className="space-y-1 text-sm text-gray-200">
          {/* Prix ou type */}
          {price && (
            <div className="flex items-center space-x-2">
              <span>💵</span>
              <span className="font-semibold text-green-300">{price}</span>
            </div>
          )}
          
          {/* Localisation */}
          <div className="flex items-center space-x-2">
            <span>📍</span>
            <span className="line-clamp-1">{location}</span>
          </div>

          {/* Nom du jeu si disponible */}
          {item.game_name && (
            <div className="flex items-center space-x-2">
              <span>🎮</span>
              <span className="line-clamp-1">{item.game_name}</span>
            </div>
          )}

          {/* Jeu recherché pour les échanges */}
          {item.type === 'exchange' && item.wanted_game && (
            <div className="flex items-center space-x-2">
              <span>🔍</span>
              <span className="line-clamp-1">Cherche: {item.wanted_game}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions au hover */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
        <div className="flex space-x-2">
          <Button
            onClick={(e) => {
              e.stopPropagation()
              onViewDetails(item)
            }}
            variant="outline"
            size="sm"
            className="bg-white text-gray-900 hover:bg-gray-100"
          >
            Voir détails
          </Button>
          {item.status === 'available' && onContact && (
            <Button
              onClick={(e) => {
                e.stopPropagation()
                onContact(item.id)
              }}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Contacter
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

