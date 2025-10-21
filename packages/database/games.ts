// Types pour les jeux de société

export interface BoardGame {
  id: string;
  name: string;
  yearPublished?: string;
  minPlayers?: number;
  maxPlayers?: number;
  playingTime?: number;
  minPlaytime?: number;
  maxPlaytime?: number;
  minAge?: number;
  description?: string;
  image?: string;
  thumbnail?: string;
  categories?: string[];
  mechanics?: string[];
  designers?: string[];
  artists?: string[];
  publishers?: string[];
  averageRating?: number;
  usersRated?: number;
  rank?: number;
  complexity?: string | number;
}

export interface BoardGameSearchResult {
  id: string;
  name: string;
  yearPublished?: string;
  thumbnail?: string;
}

export interface GamePreference {
  user_id: string;
  game_id: string;
  status: 'owned' | 'wishlist' | 'played';
  created_at: string;
}

