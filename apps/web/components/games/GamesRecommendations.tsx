'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClientSupabaseClient } from '../../lib/supabase-client';
import { LoadingSpinner } from '../ui/Loading';
import { Button } from '../ui/Button';

// Type pour les jeux de la base de données
interface Game {
  id: string;
  bgg_id: string | null;
  name: string;
  description: string | null;
  min_players: number | null;
  max_players: number | null;
  duration_min: number | null;
  photo_url: string | null;
  data: any;
}

export default function GamesRecommendations() {
  const supabase = createClientSupabaseClient();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRandomGames();
  }, []);

  const fetchRandomGames = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer tous les jeux depuis la table games
      const { data, error: supabaseError } = await supabase
        .from('games')
        .select('*')
        .limit(50);

      if (supabaseError) {
        throw supabaseError;
      }

      if (!data || data.length === 0) {
        setGames([]);
        return;
      }

      // Mélanger aléatoirement les jeux et en prendre 8
      const shuffled = [...data].sort(() => Math.random() - 0.5);
      const randomGames = shuffled.slice(0, 8);
      setGames(randomGames);
    } catch (error: any) {
      console.error('Error fetching random games:', error);
      setError('Erreur lors du chargement des jeux recommandés');
    } finally {
      setLoading(false);
    }
  };

  const getPlayerCount = (game: Game) => {
    if (game.min_players && game.max_players) {
      if (game.min_players === game.max_players) {
        return `${game.min_players} joueur${game.min_players > 1 ? 's' : ''}`;
      }
      return `${game.min_players}-${game.max_players} joueurs`;
    }
    return 'Non spécifié';
  };

  const getDuration = (game: Game) => {
    if (game.duration_min) {
      return `⏱️ ${game.duration_min} min`;
    }
    return '';
  };

  const getMainCategory = (game: Game) => {
    if (game.data?.categories && game.data.categories.length > 0) {
      return game.data.categories[0];
    }
    return null;
  };

  const handleRefresh = () => {
    fetchRandomGames();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <Button onClick={handleRefresh} variant="outline" className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-4xl mb-3">🎲</div>
        <p className="text-gray-600 mb-2">Aucun jeu disponible pour le moment</p>
        <p className="text-sm text-gray-500">Revenez plus tard pour découvrir de nouveaux jeux !</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {games.map((game) => (
        <Link 
          key={game.id} 
          href={`/games/${game.id}`}
          className="group"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md hover:-translate-y-1 h-full flex flex-col">
            {/* Image */}
            <div className="aspect-square bg-gray-100 relative overflow-hidden">
              <img
                src={game.photo_url || 'https://via.placeholder.com/300?text=Jeu'}
                alt={game.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=Jeu';
                }}
              />
              
              {/* Badge complexité */}
              {game.data?.complexity && (
                <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-lg shadow-sm">
                  <span className="text-xs font-semibold text-gray-700">
                    {typeof game.data.complexity === 'number' 
                      ? `${game.data.complexity.toFixed(1)}/5` 
                      : game.data.complexity}
                  </span>
                </div>
              )}

              {/* Badge catégorie */}
              {getMainCategory(game) && (
                <div className="absolute bottom-2 left-2 bg-blue-500 px-2 py-1 rounded-lg">
                  <span className="text-xs font-medium text-white">
                    {getMainCategory(game)}
                  </span>
                </div>
              )}
            </div>

            {/* Contenu */}
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {game.name}
              </h3>

              {/* Infos rapides */}
              <div className="space-y-1 text-sm text-gray-600 mt-auto">
                <div className="flex items-center">
                  <span className="mr-1">👥</span>
                  <span>{getPlayerCount(game)}</span>
                </div>
                {getDuration(game) && (
                  <div className="flex items-center">
                    <span>{getDuration(game)}</span>
                  </div>
                )}
                {game.data?.minAge && (
                  <div className="flex items-center">
                    <span className="mr-1">🎯</span>
                    <span>{game.data.minAge}+ ans</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
