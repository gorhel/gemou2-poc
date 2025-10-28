/**
 * Types et interfaces pour le Marketplace (Ventes & Échanges)
 * Généré à partir de la migration: 20251009120000_add_marketplace_trade_features.sql
 */

// =====================================================
// ENUMS
// =====================================================

export type MarketplaceItemCondition = 
  | 'new'
  | 'excellent'
  | 'good'
  | 'fair'
  | 'worn';

export type MarketplaceItemType = 
  | 'sale'
  | 'exchange'
  | 'donation';

export type MarketplaceItemStatus = 
  | 'draft'
  | 'available'
  | 'sold'
  | 'exchanged'
  | 'donated'
  | 'closed';

// =====================================================
// LABELS pour l'UI
// =====================================================

export const CONDITION_LABELS: Record<MarketplaceItemCondition, string> = {
  new: 'Neuf',
  excellent: 'Très bon état',
  good: 'Bon état',
  fair: 'État correct',
  worn: 'Usé'
};

export const TYPE_LABELS: Record<MarketplaceItemType, string> = {
  sale: 'Vente',
  exchange: 'Échange',
  donation: 'Don'
};

export const STATUS_LABELS: Record<MarketplaceItemStatus, string> = {
  draft: 'Brouillon',
  available: 'Disponible',
  sold: 'Vendu',
  exchanged: 'Échangé',
  donated: 'Donné',
  closed: 'Fermé'
};

// =====================================================
// INTERFACES
// =====================================================

/**
 * Structure de base d'une annonce marketplace
 */
export interface MarketplaceItem {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  type: MarketplaceItemType;
  category: string | null;
  condition: MarketplaceItemCondition | null;
  seller_id: string | null;
  images: string[] | null;
  status: MarketplaceItemStatus;
  location: string | null;
  created_at: string;
  updated_at: string;
  
  // Nouvelles colonnes de la migration
  game_id: string | null;
  custom_game_name: string | null;
  wanted_game: string | null;
  delivery_available: boolean;
  location_quarter: string | null;
  location_city: string | null;
}

/**
 * Annonce enrichie avec les infos du vendeur et du jeu
 * (depuis la vue marketplace_items_enriched)
 */
export interface MarketplaceItemEnriched extends MarketplaceItem {
  // Infos du vendeur
  seller_username: string | null;
  seller_full_name: string | null;
  seller_avatar: string | null;
  seller_city: string | null;
  
  // Infos du jeu
  game_name: string | null;
  game_photo: string | null;
  game_bgg_id: string | null;
  game_min_players: number | null;
  game_max_players: number | null;
}

/**
 * Formulaire de création d'annonce
 */
export interface CreateMarketplaceItemForm {
  // Informations générales
  title: string;
  description?: string;
  condition: MarketplaceItemCondition;
  
  // Identification du jeu
  game_id?: string | null;
  custom_game_name?: string | null;
  
  // Type de transaction
  type: MarketplaceItemType;
  price?: number | null;
  wanted_game?: string | null;
  
  // Localisation
  location_quarter?: string;
  location_city?: string;
  
  // Options
  delivery_available: boolean;
  
  // Images
  images?: string[];
  
  // Status
  status: MarketplaceItemStatus;
}

/**
 * Filtres pour rechercher des annonces
 */
export interface MarketplaceFilters {
  type?: MarketplaceItemType;
  condition?: MarketplaceItemCondition;
  location_city?: string;
  min_price?: number;
  max_price?: number;
  search?: string; // Recherche dans title, description, wanted_game
  game_id?: string;
  delivery_available?: boolean;
}

/**
 * Payload de notification marketplace
 */
export interface MarketplaceContactNotificationPayload {
  conversation_id: string;
  marketplace_item_id: string;
  item_title: string;
  buyer_id: string;
}

/**
 * Options pour l'autocomplete de localisation
 */
export interface LocationOption {
  quarter: string;
  city: string;
  label: string; // Format: "Quartier, Ville"
}

// =====================================================
// HELPERS & VALIDATORS
// =====================================================

/**
 * Valide si un formulaire est valide pour publication
 */
export function validateMarketplaceForm(form: CreateMarketplaceItemForm): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Titre obligatoire
  if (!form.title?.trim()) {
    errors.push('Le titre est obligatoire');
  }

  // Au moins game_id OU custom_game_name
  if (!form.game_id && !form.custom_game_name?.trim()) {
    errors.push('Vous devez sélectionner un jeu ou entrer un nom personnalisé');
  }

  // Condition obligatoire
  if (!form.condition) {
    errors.push('L\'état du jeu est obligatoire');
  }

  // Si vente, prix obligatoire
  if (form.type === 'sale' && (!form.price || form.price <= 0)) {
    errors.push('Le prix est obligatoire pour une vente');
  }

  // Si échange, jeu recherché obligatoire
  if (form.type === 'exchange' && !form.wanted_game?.trim()) {
    errors.push('Le jeu recherché est obligatoire pour un échange');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Formate le prix pour l'affichage
 */
export function formatPrice(price: number | null): string {
  if (!price) return 'Prix non spécifié';
  return `${price.toFixed(2)} €`;
}

/**
 * Formate la localisation
 */
export function formatLocation(item: MarketplaceItem | MarketplaceItemEnriched): string {
  const parts: string[] = [];
  
  if (item.location_quarter) {
    parts.push(item.location_quarter);
  }
  
  if (item.location_city) {
    parts.push(item.location_city);
  }
  
  if (parts.length === 0 && item.location) {
    return item.location;
  }
  
  return parts.join(', ') || 'Localisation non spécifiée';
}

/**
 * Vérifie si l'utilisateur peut éditer l'annonce
 */
export function canEditItem(item: MarketplaceItem, userId: string | null): boolean {
  return item.seller_id === userId;
}

/**
 * Vérifie si l'utilisateur peut contacter le vendeur
 */
export function canContactSeller(item: MarketplaceItem, userId: string | null): boolean {
  return (
    userId !== null && 
    item.seller_id !== userId &&
    item.status === 'available'
  );
}

/**
 * Retourne la couleur du badge selon le status
 */
export function getStatusColor(status: MarketplaceItemStatus): string {
  const colors: Record<MarketplaceItemStatus, string> = {
    draft: 'bg-gray-100 text-gray-800',
    available: 'bg-green-100 text-green-800',
    sold: 'bg-red-100 text-red-800',
    exchanged: 'bg-blue-100 text-blue-800',
    donated: 'bg-purple-100 text-purple-800',
    closed: 'bg-gray-100 text-gray-600'
  };
  
  return colors[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Retourne l'icône selon le type
 */
export function getTypeIcon(type: MarketplaceItemType): string {
  const icons: Record<MarketplaceItemType, string> = {
    sale: '💰',
    exchange: '🔄',
    donation: '🎁'
  };
  return icons[type];
}

/**
 * Retourne l'icône selon la condition
 */
export function getConditionIcon(condition: MarketplaceItemCondition | null): string {
  const icons: Record<MarketplaceItemCondition, string> = {
    new: '✨',
    excellent: '⭐',
    good: '👍',
    fair: '👌',
    worn: '📦'
  };
  
  return condition ? icons[condition] : '📦';
}

// =====================================================
// CONSTANTES pour La Réunion
// =====================================================

export const REUNION_CITIES = [
  'Saint-Denis',
  'Saint-Paul',
  'Saint-Pierre',
  'Le Tampon',
  'Saint-André',
  'Saint-Louis',
  'Saint-Benoît',
  'Le Port',
  'La Possession',
  'Saint-Joseph',
  'Saint-Leu',
  'Sainte-Marie',
  'Sainte-Suzanne',
  'Petite-Île',
  'Salazie',
  'Cilaos',
  'Entre-Deux',
  'L\'Étang-Salé',
  'Les Avirons',
  'Bras-Panon',
  'Sainte-Rose',
  'Plaine-des-Palmistes',
  'Les Trois-Bassins',
  'Saint-Philippe'
] as const;

export const POPULAR_QUARTERS_BY_CITY: Record<string, string[]> = {
  'Saint-Denis': [
    'Bellepierre',
    'Le Moufia',
    'Sainte-Clotilde',
    'Le Butor',
    'La Bretagne',
    'Montgaillard',
    'La Providence'
  ],
  'Saint-Paul': [
    'Centre-ville',
    'Plateau Caillou',
    'Savanna',
    'Etang Saint-Paul',
    'La Plaine',
    'Boucan Canot',
    'Saint-Gilles-les-Bains'
  ],
  'Saint-Pierre': [
    'Terre Sainte',
    'Bois d\'Olives',
    'Ravine des Cabris',
    'Ligne Paradis',
    'Pierrefonds',
    'Centre-ville'
  ],
  'Le Tampon': [
    'Trois-Mares',
    'Dix-Septième',
    'Bourg-Murat',
    'Vingt-Troisième'
  ]
};

/**
 * Génère les options d'autocomplete pour la localisation
 */
export function getLocationOptions(searchTerm: string = ''): LocationOption[] {
  const options: LocationOption[] = [];
  
  // Ajouter les villes
  REUNION_CITIES.forEach(city => {
    if (city.toLowerCase().includes(searchTerm.toLowerCase())) {
      options.push({
        quarter: '',
        city,
        label: city
      });
    }
    
    // Ajouter les quartiers
    const quarters = POPULAR_QUARTERS_BY_CITY[city] || [];
    quarters.forEach(quarter => {
      const label = `${quarter}, ${city}`;
      if (label.toLowerCase().includes(searchTerm.toLowerCase())) {
        options.push({
          quarter,
          city,
          label
        });
      }
    });
  });
  
  return options.slice(0, 10); // Limiter à 10 résultats
}

// =====================================================
// TYPES POUR LES REQUÊTES SUPABASE
// =====================================================

export interface CreateMarketplaceConversationParams {
  p_marketplace_item_id: string;
  p_buyer_id: string;
}

export interface CreateMarketplaceConversationResponse {
  data: string | null; // conversation_id
  error: Error | null;
}

