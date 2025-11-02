/**
 * Données mockées pour les tests
 */

import type { User, Session } from '@supabase/supabase-js';

/**
 * Mock d'un utilisateur Supabase
 */
export const mockUser: User = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'test@example.com',
  email_confirmed_at: '2024-01-01T00:00:00Z',
  phone: '',
  confirmed_at: '2024-01-01T00:00:00Z',
  last_sign_in_at: '2024-01-01T00:00:00Z',
  app_metadata: {},
  user_metadata: {
    username: 'testuser',
    full_name: 'Test User',
  },
  identities: [],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

/**
 * Mock d'une session Supabase
 */
export const mockSession: Session = {
  access_token: 'mock-access-token-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: mockUser,
};

/**
 * Mock d'un événement
 */
export const mockEvent = {
  id: 'event-123',
  title: 'Tournoi Mario Kart',
  description: 'Grand tournoi mensuel de Mario Kart 8 Deluxe',
  date: '2024-12-25T18:00:00Z',
  location: 'Paris Gaming Center',
  max_participants: 16,
  current_participants: 8,
  created_by: mockUser.id,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  status: 'upcoming',
  game_id: 'game-123',
};

/**
 * Mock d'un jeu
 */
export const mockGame = {
  id: 'game-123',
  name: 'Mario Kart 8 Deluxe',
  slug: 'mario-kart-8-deluxe',
  cover_url: 'https://example.com/mario-kart.jpg',
  release_date: '2017-04-28',
  platforms: ['Nintendo Switch'],
  genres: ['Racing', 'Multiplayer'],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

/**
 * Mock d'un article du marketplace
 */
export const mockMarketplaceItem = {
  id: 'item-123',
  title: 'Nintendo Switch',
  description: 'Console en excellent état avec deux manettes',
  price: 250,
  condition: 'excellent' as const,
  seller_id: mockUser.id,
  status: 'available' as const,
  type: 'sale' as const,
  game_id: 'game-123',
  images: ['https://example.com/switch1.jpg', 'https://example.com/switch2.jpg'],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

/**
 * Mock d'un profil utilisateur
 */
export const mockProfile = {
  id: mockUser.id,
  username: 'testuser',
  full_name: 'Test User',
  avatar_url: 'https://example.com/avatar.jpg',
  bio: 'Gamer passionné de Nintendo',
  location: 'Paris, France',
  favorite_games: ['game-123'],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

/**
 * Mock d'une collection de jeux
 */
export const mockGames = [
  mockGame,
  {
    id: 'game-456',
    name: 'The Legend of Zelda: Breath of the Wild',
    slug: 'zelda-botw',
    cover_url: 'https://example.com/zelda.jpg',
    release_date: '2017-03-03',
    platforms: ['Nintendo Switch'],
    genres: ['Action', 'Adventure'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'game-789',
    name: 'Super Smash Bros. Ultimate',
    slug: 'smash-bros-ultimate',
    cover_url: 'https://example.com/smash.jpg',
    release_date: '2018-12-07',
    platforms: ['Nintendo Switch'],
    genres: ['Fighting', 'Multiplayer'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

/**
 * Mock de plusieurs événements
 */
export const mockEvents = [
  mockEvent,
  {
    ...mockEvent,
    id: 'event-456',
    title: 'Soirée Smash Bros',
    game_id: 'game-789',
    date: '2024-12-30T20:00:00Z',
  },
];

/**
 * Mock d'erreurs API
 */
export const mockErrors = {
  unauthorized: {
    message: 'Non autorisé',
    status: 401,
  },
  notFound: {
    message: 'Ressource non trouvée',
    status: 404,
  },
  serverError: {
    message: 'Erreur serveur',
    status: 500,
  },
  validationError: {
    message: 'Erreur de validation',
    status: 400,
    details: {
      email: 'Email invalide',
      password: 'Mot de passe trop court',
    },
  },
};






