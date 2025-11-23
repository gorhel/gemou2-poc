import { router } from 'expo-router'
import React from 'react'
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet, Image } from 'react-native'
import MachiColors from '../../theme/colors'

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

interface MarketplaceCardProps {
  item: MarketplaceItem
  onViewDetails: (item: MarketplaceItem) => void
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
    return 'https://via.placeholder.com/400x200'
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

  const formatLocation = () => {
    const parts: string[] = []
    
    if (item.location_quarter) {
      parts.push(item.location_quarter)
    }
    
    if (item.location_city) {
      parts.push(item.location_city)
    }
    
    if (parts.length === 0 && item.location) {
      return item.location
    }
    
    return parts.join(', ') || 'Localisation non spécifiée'
  }

  const getTypeIcon = () => {
    const icons = {
      sale: '💰',
      exchange: '🔄',
      donation: '🎁'
    }
    return icons[item.type]
  }

  const formatDate = (dateTime: string) => {
    const d = new Date(dateTime);
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('fr-FR', { month: 'long' });
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${day} ${month}, ${hours}:${minutes}`;
  };

  const price = formatPrice()
  const typeIcon = getTypeIcon()
  const location = formatLocation()

  return (
    <TouchableOpacity
      // onPress={() => onViewDetails(item)}
      onPress={() => router.push(`/trade/${item.id}`)}
      activeOpacity={0.9}
      style={styles.eventCard}
    >
      {/* Image de fond */}

      <View style={styles.eventContent}>
        <View style={styles.eventTextContent}>
          <Text style={styles.eventTimeSection}> 
            {item.type === 'sale' && (
              '💰 Vente  - ' + price
            )}
            {item.type === 'exchange' && (
              '🔄 Échange  - '
            )}
            {item.type === 'donation' && (
              '🎁 Don  - '
            )}
            - Créé le{formatDate(item.created_at)}</Text>
          <Text style={styles.eventTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.eventTime}> 
          📍{item.location}, {item.location_quarter}, {item.location_city}
          </Text>
        </View>
        <View style={styles.eventImageContainer}>
          {item.images ? (
            <Image source={{ uri: item.images[0] }} style={styles.eventImage} />
          ) : (
            <View style={styles.eventImagePlaceholder}>
              <Text style={styles.eventImageEmoji}>🎲</Text>
            </View>
          )}
        </View>
      </View>


    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    height: 192,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  imageBackground: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  typeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  infoContainer: {
    gap: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoIcon: {
    fontSize: 14,
    color: 'white',
  },
  infoText: {
    fontSize: 14,
    color: 'white',
    flex: 1,
  },
  priceText: {
    fontSize: 14,
    color: '#86efac',
    fontWeight: '600',
  },
  eventCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventContent: {
    flexDirection: 'row',
    padding: 16,
  },
  eventTextContent: {
    flex: 1,
    marginRight: 12,
  },
  eventTimeSection: {
    fontSize: 12,
    color: MachiColors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: MachiColors.text,
    marginBottom: 8,
  },
  eventTime: {
    fontSize: 14,
    color: MachiColors.textSecondary,
  },
  eventImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  eventImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: MachiColors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventImageEmoji: {
    fontSize: 32,
  },
})

