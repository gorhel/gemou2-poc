'use client';

import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '../ui/Loading';
import { Button } from '../ui/Button';
import GameCard from './GameCard';
import GameDetailsModal from './GameDetailsModal';
import { BoardGame } from '../../lib/types/games';

export default function GamesRecommendations() {
  const [games, setGames] = useState<BoardGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<BoardGame | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPopularGames();
  }, []);

  const fetchPopularGames = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer 10 jeux populaires via l'API route
      const response = await fetch('/api/games/popular?limit=10');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setGames(data.games || []);
    } catch (error: any) {
      console.error('Error fetching popular games:', error);
      setError('Erreur lors du chargement des jeux recommandés');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (game: BoardGame) => {
    setSelectedGame(game);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGame(null);
  };

  const handleRefresh = () => {
    fetchPopularGames();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">🎲 Recommandations de jeux</h2>
            <p className="text-gray-600">Découvrez les jeux de société les plus populaires</p>
          </div>
        </div>
        
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <LoadingSpinner size="xl" className="mb-4" />
            <p className="text-gray-600">Chargement des recommandations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">🎲 Recommandations de jeux</h2>
            <p className="text-gray-600">Découvrez les jeux de société les plus populaires</p>
          </div>
        </div>
        
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Liste des jeux - Format carré */}
      {games.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <span className="text-6xl">🎲</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun jeu trouvé</h3>
          <p className="text-gray-600">
            Impossible de charger les recommandations de jeux.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {games.slice(0, 8).map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Modal de détails */}
      <GameDetailsModal
        game={selectedGame}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
