'use client';

import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { BoardGame } from '../../lib/types/games';

interface GameDetailsModalProps {
  game: BoardGame | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function GameDetailsModal({ 
  game, 
  isOpen, 
  onClose 
}: GameDetailsModalProps) {
  if (!game) return null;

  const formatPlayingTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h${remainingMinutes}min` : `${hours} heures`;
  };

  const getComplexityColor = (complexity: number | string) => {
    const num = typeof complexity === 'number' ? complexity : parseFloat(complexity) || 0;
    if (num <= 2) return 'text-green-600 bg-green-100 border-green-200';
    if (num <= 3) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    if (num <= 4) return 'text-orange-600 bg-orange-100 border-orange-200';
    return 'text-red-600 bg-red-100 border-red-200';
  };

  const getComplexityText = (complexity: number | string) => {
    const num = typeof complexity === 'number' ? complexity : parseFloat(complexity) || 0;
    if (num <= 1.5) return 'Très facile';
    if (num <= 2.5) return 'Facile';
    if (num <= 3.5) return 'Moyen';
    if (num <= 4.5) return 'Difficile';
    return 'Très difficile';
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-600';
    if (rating >= 7) return 'text-yellow-600';
    if (rating >= 6) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 10 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <span key={i} className="text-yellow-400">★</span>
        ))}
        {hasHalfStar && <span className="text-yellow-400">☆</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={i} className="text-gray-300">☆</span>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          ({rating.toFixed(1)}/10)
        </span>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{game.name}</h2>
            <div className="flex items-center gap-4 text-lg text-gray-600">
              <span>📅 {game.yearPublished}</span>
              <span>👥 {game.minPlayers === game.maxPlayers ? game.minPlayers : `${game.minPlayers}-${game.maxPlayers}`} joueurs</span>
              <span>⏱️ {formatPlayingTime(game.playingTime)}</span>
              <span>🎂 {game.minAge}+ ans</span>
            </div>
          </div>
        </div>

        {/* Image et informations principales */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Image */}
          <div className="lg:col-span-1">
            <div className="aspect-square w-full overflow-hidden rounded-lg">
              <img
                src={game.image || game.thumbnail || '/placeholder-game.svg'}
                alt={game.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-game.svg';
                }}
              />
            </div>
          </div>

          {/* Informations principales */}
          <div className="lg:col-span-2 space-y-6">
            {/* Note et complexité */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">⭐ Note moyenne</h3>
                <div className="space-y-2">
                  {getRatingStars(game.averageRating)}
                  <p className="text-sm text-gray-600">
                    Basé sur {game.usersRated.toLocaleString()} avis
                  </p>
                  {game.rank > 0 && (
                    <p className="text-sm text-gray-600">
                      Classé #{game.rank} sur BoardGameGeek
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🧩 Complexité</h3>
                <div className="space-y-2">
                  <span className={`px-3 py-2 rounded-full text-sm font-medium border ${getComplexityColor(game.complexity)}`}>
                    {getComplexityText(game.complexity)} ({typeof game.complexity === 'number' ? game.complexity.toFixed(1) : game.complexity}/5)
                  </span>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(typeof game.complexity === 'number' ? game.complexity : 0) / 5 * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Designers et artistes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {game.designers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">🎨 Designer{game.designers.length > 1 ? 's' : ''}</h3>
                  <p className="text-gray-700">{game.designers.join(', ')}</p>
                </div>
              )}

              {game.artists.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">🖼️ Artiste{game.artists.length > 1 ? 's' : ''}</h3>
                  <p className="text-gray-700">{game.artists.join(', ')}</p>
                </div>
              )}
            </div>

            {/* Éditeurs */}
            {game.publishers.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🏢 Éditeur{game.publishers.length > 1 ? 's' : ''}</h3>
                <p className="text-gray-700">{game.publishers.join(', ')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">📝 Description</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-wrap">{game.description}</p>
          </div>
        </div>

        {/* Catégories et mécaniques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Catégories */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🏷️ Catégories</h3>
            <div className="flex flex-wrap gap-2">
              {game.categories.map((category, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>

          {/* Mécaniques */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">⚙️ Mécaniques de jeu</h3>
            <div className="flex flex-wrap gap-2">
              {game.mechanics.map((mechanic, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                >
                  {mechanic}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Fermer
          </Button>
          <Button onClick={() => {
            // TODO: Implémenter l'ajout à la wishlist
            alert('Fonctionnalité de wishlist à venir !');
          }}>
            Ajouter à ma wishlist
          </Button>
        </div>
      </div>
    </Modal>
  );
}
