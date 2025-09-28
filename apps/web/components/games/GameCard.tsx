'use client';

import React from 'react';
import { BoardGame } from '../../lib/types/games';

interface GameCardProps {
  game: BoardGame;
  onViewDetails: (game: BoardGame) => void;
}

export default function GameCard({ game, onViewDetails }: GameCardProps) {
  const getMainCategory = () => {
    if (game.categories && game.categories.length > 0) {
      return game.categories[0];
    }
    return 'Jeu de société';
  };

  const getPlayerCount = () => {
    if (game.minPlayers && game.maxPlayers) {
      if (game.minPlayers === game.maxPlayers) {
        return `${game.minPlayers} joueur${game.minPlayers > 1 ? 's' : ''}`;
      }
      return `${game.minPlayers}-${game.maxPlayers} joueurs`;
    }
    return 'Joueurs non spécifiés';
  };

  const getPlaytime = () => {
    if (game.minPlaytime && game.maxPlaytime) {
      if (game.minPlaytime === game.maxPlaytime) {
        return `${game.minPlaytime} min`;
      }
      return `${game.minPlaytime}-${game.maxPlaytime} min`;
    }
    return '';
  };

  return (
    <div 
      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group hover:scale-105 transition-transform duration-200"
      onClick={() => onViewDetails(game)}
    >
      {/* Image du plateau/jeu */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-gray-300"
        style={{
          backgroundImage: `url(${game.thumbnail || game.image || '/placeholder-game.svg'})`
        }}
      >
        {/* Overlay sombre pour la lisibilité */}
        <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-opacity duration-200" />
      </div>

      {/* Contenu en bas */}
      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
        {/* Nom du jeu en bas à gauche */}
        <h3 className="text-sm font-bold mb-1 line-clamp-2">
          {game.name}
        </h3>
        
        {/* Catégorie en petite police grise */}
        <div className="space-y-1">
          <p className="text-xs text-gray-300 line-clamp-1">
            {getMainCategory()}
          </p>
          
          {/* Informations supplémentaires */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{getPlayerCount()}</span>
            {getPlaytime() && (
              <span>• {getPlaytime()}</span>
            )}
          </div>
        </div>
      </div>

      {/* Indicateur de complexité */}
      {game.complexity && game.complexity !== 'N/A' && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          {game.complexity}/5
        </div>
      )}

      {/* Actions au hover */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(game);
          }}
          className="bg-white text-gray-900 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          Voir détails
        </button>
      </div>
    </div>
  );
}