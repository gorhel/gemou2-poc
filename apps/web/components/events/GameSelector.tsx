'use client';

import React, { useState, useEffect } from 'react';
import { createClientSupabaseClient } from '../../lib/supabase-client';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { LoadingSpinner } from '../ui/Loading';

interface BoardGame {
  id: string;
  name: string;
  yearPublished: string;
  minPlayers: number;
  maxPlayers: number;
  playingTime: number;
  complexity: number;
  image: string;
  thumbnail: string;
  categories: string[];
  mechanics: string[];
  designers: string[];
  artists: string[];
  publishers: string[];
  averageRating: number;
  usersRated: number;
  rank: number;
}

interface EventGame {
  id?: string;
  game_id?: string;
  game_name: string;
  game_thumbnail?: string;
  game_image?: string;
  year_published?: number;
  min_players?: number;
  max_players?: number;
  playing_time?: number;
  complexity?: number;
  is_custom: boolean;
  is_optional: boolean;
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimated_duration?: number;
  brought_by_user_id?: string;
  notes?: string;
}

interface GameSelectorProps {
  eventId?: string;
  onGamesChange: (games: EventGame[]) => void;
  initialGames?: EventGame[];
}

export default function GameSelector({ eventId, onGamesChange, initialGames = [] }: GameSelectorProps) {
  const supabase = createClientSupabaseClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BoardGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGames, setSelectedGames] = useState<EventGame[]>(initialGames);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customGameName, setCustomGameName] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    onGamesChange(selectedGames);
  }, [selectedGames, onGamesChange]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const searchGames = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/games/search?q=${encodeURIComponent(query)}&limit=10`);
      const data = await response.json();
      setSearchResults(data.games || []);
    } catch (error) {
      console.error('Error searching games:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchGames(query);
  };

  const addGame = (game: BoardGame) => {
    const eventGame: EventGame = {
      game_id: game.id,
      game_name: game.name,
      game_thumbnail: game.thumbnail,
      game_image: game.image,
      year_published: parseInt(game.yearPublished),
      min_players: game.minPlayers,
      max_players: game.maxPlayers,
      playing_time: game.playingTime,
      complexity: game.complexity,
      is_custom: false,
      is_optional: false,
      experience_level: 'beginner',
      estimated_duration: game.playingTime,
      brought_by_user_id: currentUser?.id,
      notes: ''
    };

    setSelectedGames(prev => [...prev, eventGame]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const addCustomGame = () => {
    if (!customGameName.trim()) return;

    const customGame: EventGame = {
      game_name: customGameName.trim(),
      is_custom: true,
      is_optional: false,
      experience_level: 'beginner',
      estimated_duration: 60,
      brought_by_user_id: currentUser?.id,
      notes: ''
    };

    setSelectedGames(prev => [...prev, customGame]);
    setCustomGameName('');
    setShowAddCustom(false);
  };

  const removeGame = (index: number) => {
    setSelectedGames(prev => prev.filter((_, i) => i !== index));
  };

  const updateGame = (index: number, field: keyof EventGame, value: any) => {
    setSelectedGames(prev => prev.map((game, i) => 
      i === index ? { ...game, [field]: value } : game
    ));
  };

  const getExperienceLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getExperienceLevelText = (level: string) => {
    switch (level) {
      case 'beginner': return 'Débutant';
      case 'intermediate': return 'Intermédiaire';
      case 'advanced': return 'Avancé';
      case 'expert': return 'Expert';
      default: return level;
    }
  };

  return (
    <div className="space-y-6">
      {/* Recherche de jeux */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">🎲 Ajouter des jeux</CardTitle>
          <p className="text-gray-600">Recherchez des jeux dans la base de données ou ajoutez des jeux personnalisés</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barre de recherche */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Rechercher un jeu (ex: Catan, Wingspan...)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {loading && (
              <div className="absolute right-3 top-3">
                <LoadingSpinner size="sm" />
              </div>
            )}
          </div>

          {/* Résultats de recherche */}
          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {searchResults.map((game) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    {game.thumbnail && (
                      <img
                        src={game.thumbnail}
                        alt={game.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div>
                      <h4 className="font-medium text-gray-900">{game.name}</h4>
                      <p className="text-sm text-gray-600">
                        {game.minPlayers}-{game.maxPlayers} joueurs • {game.playingTime} min • {game.complexity.toFixed(1)}/5
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => addGame(game)}
                    size="sm"
                    variant="outline"
                  >
                    Ajouter
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Ajouter un jeu personnalisé */}
          <div className="border-t pt-4">
            {!showAddCustom ? (
              <Button
                onClick={() => setShowAddCustom(true)}
                variant="outline"
                className="w-full"
              >
                ➕ Ajouter un jeu personnalisé
              </Button>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={customGameName}
                  onChange={(e) => setCustomGameName(e.target.value)}
                  placeholder="Nom du jeu personnalisé"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="flex space-x-2">
                  <Button
                    onClick={addCustomGame}
                    disabled={!customGameName.trim()}
                    size="sm"
                  >
                    Ajouter
                  </Button>
                  <Button
                    onClick={() => {
                      setShowAddCustom(false);
                      setCustomGameName('');
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Jeux sélectionnés */}
      {selectedGames.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">🎮 Jeux sélectionnés ({selectedGames.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedGames.map((game, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {game.game_thumbnail && (
                        <img
                          src={game.game_thumbnail}
                          alt={game.game_name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <h4 className="font-medium text-gray-900">{game.game_name}</h4>
                        {game.year_published && (
                          <p className="text-sm text-gray-600">({game.year_published})</p>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => removeGame(index)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      ✕
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Niveau d'expérience */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Niveau d'expérience
                      </label>
                      <select
                        value={game.experience_level}
                        onChange={(e) => updateGame(index, 'experience_level', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="beginner">Débutant</option>
                        <option value="intermediate">Intermédiaire</option>
                        <option value="advanced">Avancé</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>

                    {/* Durée estimée */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Durée estimée (minutes)
                      </label>
                      <input
                        type="number"
                        value={game.estimated_duration || ''}
                        onChange={(e) => updateGame(index, 'estimated_duration', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="15"
                        max="480"
                      />
                    </div>

                    {/* Qui apporte le jeu */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Qui apporte le jeu ?
                      </label>
                      <select
                        value={game.brought_by_user_id || ''}
                        onChange={(e) => updateGame(index, 'brought_by_user_id', e.target.value || null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Je l'apporte</option>
                        <option value="participants">Les participants</option>
                        <option value="organizer">L'organisateur</option>
                      </select>
                    </div>

                    {/* Jeu optionnel */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`optional-${index}`}
                        checked={game.is_optional}
                        onChange={(e) => updateGame(index, 'is_optional', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`optional-${index}`} className="text-sm font-medium text-gray-700">
                        Jeu optionnel
                      </label>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (optionnel)
                    </label>
                    <textarea
                      value={game.notes || ''}
                      onChange={(e) => updateGame(index, 'notes', e.target.value)}
                      placeholder="Ajoutez des notes sur ce jeu..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                    />
                  </div>

                  {/* Indicateurs visuels */}
                  <div className="flex items-center space-x-2 mt-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExperienceLevelColor(game.experience_level)}`}>
                      {getExperienceLevelText(game.experience_level)}
                    </span>
                    {game.is_optional && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Optionnel
                      </span>
                    )}
                    {game.is_custom && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Personnalisé
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
