'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClientSupabaseClient } from '../../lib/supabase-client';

interface Game {
  id: string;
  name: string;
  photo_url: string | null;
}

export interface GameSelectProps {
  value: string | null;
  customGameName: string;
  onGameSelect: (gameId: string | null, customGameName: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
}

export const GameSelect: React.FC<GameSelectProps> = ({
  value,
  customGameName,
  onGameSelect,
  label = 'Jeu',
  error,
  required = false,
}) => {
  const [search, setSearch] = useState('');
  const [games, setGames] = useState<Game[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const supabase = createClientSupabaseClient();

  // Charger le jeu sélectionné si on a un ID
  useEffect(() => {
    if (value && !selectedGame) {
      const loadGame = async () => {
        const { data } = await supabase
          .from('games')
          .select('id, name, photo_url')
          .eq('id', value)
          .single();
        
        if (data) {
          setSelectedGame(data);
          setSearch(data.name);
        }
      };
      loadGame();
    }
  }, [value]);

  // Rechercher des jeux
  useEffect(() => {
    if (search && !showCustomInput) {
      const searchGames = async () => {
        setLoading(true);
        const { data } = await supabase
          .from('games')
          .select('id, name, photo_url')
          .ilike('name', `%${search}%`)
          .limit(10);

        setGames(data || []);
        setShowDropdown(true);
        setLoading(false);
      };

      const debounce = setTimeout(searchGames, 300);
      return () => clearTimeout(debounce);
    } else {
      setGames([]);
      setShowDropdown(false);
    }
  }, [search, showCustomInput]);

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGameSelect = (game: Game) => {
    setSelectedGame(game);
    setSearch(game.name);
    onGameSelect(game.id, '');
    setShowDropdown(false);
  };

  const handleCustomGame = () => {
    setShowCustomInput(true);
    setSelectedGame(null);
    setSearch('');
    setShowDropdown(false);
    onGameSelect(null, customGameName);
  };

  const handleCustomGameNameChange = (name: string) => {
    onGameSelect(null, name);
  };

  const clearSelection = () => {
    setSelectedGame(null);
    setSearch('');
    setShowCustomInput(false);
    onGameSelect(null, '');
  };

  return (
    <div ref={wrapperRef} className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input de recherche ou affichage du jeu sélectionné */}
      {!showCustomInput ? (
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => search && setShowDropdown(games.length > 0)}
            placeholder="Rechercher un jeu..."
            className={`
              w-full px-4 py-3 border rounded-lg transition-colors pr-10
              focus:outline-none focus:ring-2 focus:ring-offset-2
              ${error ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'}
            `}
          />

          {/* Icône de jeu */}
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>

          {/* Bouton pour effacer */}
          {selectedGame && (
            <button
              type="button"
              onClick={clearSelection}
              className="absolute inset-y-0 right-10 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Dropdown avec résultats */}
          {showDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-auto">
              {games.map((game) => (
                <button
                  key={game.id}
                  type="button"
                  onClick={() => handleGameSelect(game)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors flex items-center gap-3"
                >
                  {game.photo_url ? (
                    <img
                      src={game.photo_url}
                      alt={game.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-gray-400 text-xs">🎲</span>
                    </div>
                  )}
                  <span className="text-sm text-gray-700">{game.name}</span>
                </button>
              ))}

              {/* Option "Mon jeu n'est pas dans la liste" */}
              <button
                type="button"
                onClick={handleCustomGame}
                className="w-full text-left px-4 py-3 hover:bg-primary-50 transition-colors border-t border-gray-200 text-primary-600 font-medium"
              >
                ➕ Mon jeu n'est pas dans la liste
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Input pour jeu personnalisé */
        <div className="space-y-2">
          <input
            type="text"
            value={customGameName}
            onChange={(e) => handleCustomGameNameChange(e.target.value)}
            placeholder="Nom du jeu personnalisé"
            className={`
              w-full px-4 py-3 border rounded-lg transition-colors
              focus:outline-none focus:ring-2 focus:ring-offset-2
              ${error ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'}
            `}
          />
          <button
            type="button"
            onClick={() => {
              setShowCustomInput(false);
              setSearch('');
            }}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            ← Retour à la recherche
          </button>
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-error-600">
          {error}
        </p>
      )}
    </div>
  );
};

