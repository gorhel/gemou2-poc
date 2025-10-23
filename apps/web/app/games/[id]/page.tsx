'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientSupabaseClient } from '../../../lib/supabase-client';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent } from '../../../components/ui/Card';
import { LoadingSpinner } from '../../../components/ui/Loading';
import { ResponsiveLayout } from '../../../components/layout';

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

export default function GameDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClientSupabaseClient();
  
  const gameId = params.id as string;
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (gameId) {
      fetchGameDetails();
    }
  }, [gameId]);

  const fetchGameDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      if (!data) {
        setError('Jeu non trouvé');
        return;
      }

      setGame(data);
    } catch (error: any) {
      console.error('Error fetching game details:', error);
      setError('Erreur lors du chargement des détails du jeu');
    } finally {
      setLoading(false);
    }
  };

  const getPlayerCount = () => {
    if (!game) return 'Non spécifié';
    
    if (game.min_players && game.max_players) {
      if (game.min_players === game.max_players) {
        return `${game.min_players} joueur${game.min_players > 1 ? 's' : ''}`;
      }
      return `${game.min_players} - ${game.max_players} joueurs`;
    }
    return 'Non spécifié';
  };

  const getDuration = () => {
    if (!game || !game.duration_min) return 'Non spécifiée';
    return `${game.duration_min} min`;
  };

  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <LoadingSpinner size="xl" className="mb-4" />
              <p className="text-gray-600 text-lg">Chargement des détails du jeu...</p>
            </div>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (error || !game) {
    return (
      <ResponsiveLayout>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h1>
                <p className="text-gray-600 mb-6">{error || 'Jeu non trouvé'}</p>
                <Button onClick={() => router.push('/dashboard')}>
                  Retour au tableau de bord
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
        {/* Header avec breadcrumb */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-2 text-sm">
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                Tableau de bord
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">Détails du jeu</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* En-tête avec image et info principales */}
            <Card>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Image */}
                  <div className="md:col-span-1">
                    <div className="aspect-square overflow-hidden md:rounded-l-lg">
                      <img
                        src={game.photo_url || 'https://via.placeholder.com/400?text=Jeu'}
                        alt={game.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=Jeu';
                        }}
                      />
                    </div>
                  </div>

                  {/* Informations principales */}
                  <div className="md:col-span-2 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                          {game.name}
                        </h1>
                        {game.data?.yearPublished && (
                          <p className="text-gray-600 mb-4">
                            📅 Publié en {game.data.yearPublished}
                          </p>
                        )}
                      </div>
                      {game.data?.averageRating && (
                        <div className="flex items-center space-x-1 bg-yellow-50 px-3 py-2 rounded-lg">
                          <span className="text-2xl">⭐</span>
                          <span className="text-xl font-bold text-gray-900">
                            {game.data.averageRating.toFixed(1)}
                          </span>
                          <span className="text-sm text-gray-600">/10</span>
                        </div>
                      )}
                    </div>

                    {/* Badges d'informations rapides */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="text-2xl mb-1">👥</div>
                        <div className="text-xs text-gray-600 mb-1">Joueurs</div>
                        <div className="text-sm font-semibold text-gray-900">
                          {getPlayerCount()}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="text-2xl mb-1">⏱️</div>
                        <div className="text-xs text-gray-600 mb-1">Durée</div>
                        <div className="text-sm font-semibold text-gray-900">
                          {getDuration()}
                        </div>
                      </div>

                      {game.data?.minAge && (
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <div className="text-2xl mb-1">🎯</div>
                          <div className="text-xs text-gray-600 mb-1">Âge min</div>
                          <div className="text-sm font-semibold text-gray-900">
                            {game.data.minAge}+ ans
                          </div>
                        </div>
                      )}

                      {game.data?.complexity && (
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <div className="text-2xl mb-1">🧩</div>
                          <div className="text-xs text-gray-600 mb-1">Complexité</div>
                          <div className="text-sm font-semibold text-gray-900">
                            {typeof game.data.complexity === 'number' 
                              ? `${game.data.complexity.toFixed(1)}/5` 
                              : game.data.complexity}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                      <Button onClick={() => router.back()} variant="outline">
                        ← Retour
                      </Button>
                      {game.bgg_id && (
                        <Button
                          onClick={() => window.open(`https://boardgamegeek.com/boardgame/${game.bgg_id}`, '_blank')}
                          variant="default"
                        >
                          Voir sur BoardGameGeek →
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  📖 Description
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {game.description || 'Aucune description disponible pour ce jeu.'}
                </p>
              </CardContent>
            </Card>

            {/* Catégories et Mécaniques */}
            {((game.data?.categories && game.data.categories.length > 0) || 
              (game.data?.mechanics && game.data.mechanics.length > 0)) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Catégories */}
                {game.data?.categories && game.data.categories.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">
                        🏷️ Catégories
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {game.data.categories.map((category: string, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Mécaniques */}
                {game.data?.mechanics && game.data.mechanics.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">
                        ⚙️ Mécaniques
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {game.data.mechanics.map((mechanic: string, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-purple-50 text-purple-700 border border-purple-200"
                          >
                            {mechanic}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Créateurs, Artistes, Éditeurs */}
            {((game.data?.designers && game.data.designers.length > 0) ||
              (game.data?.artists && game.data.artists.length > 0) ||
              (game.data?.publishers && game.data.publishers.length > 0)) && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    👥 Équipe créative
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {game.data?.designers && game.data.designers.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">🎨 Concepteurs</h3>
                        <p className="text-gray-700 text-sm">
                          {game.data.designers.join(', ')}
                        </p>
                      </div>
                    )}

                    {game.data?.artists && game.data.artists.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">🖌️ Artistes</h3>
                        <p className="text-gray-700 text-sm">
                          {game.data.artists.join(', ')}
                        </p>
                      </div>
                    )}

                    {game.data?.publishers && game.data.publishers.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">🏢 Éditeurs</h3>
                        <p className="text-gray-700 text-sm">
                          {game.data.publishers.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
}

