import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';

interface BoardGame {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  image?: string;
  minPlayers?: number;
  maxPlayers?: number;
  minPlaytime?: number;
  maxPlaytime?: number;
  complexity?: string;
  categories?: string[];
  mechanics?: string[];
}

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
    <TouchableOpacity
      onPress={() => onViewDetails(game)}
      activeOpacity={0.9}
      className="aspect-square rounded-lg overflow-hidden mb-4"
    >
      <ImageBackground
        source={{ uri: game.thumbnail || game.image || 'https://via.placeholder.com/300' }}
        className="flex-1"
        resizeMode="cover"
      >
        {/* Overlay sombre */}
        <View className="absolute inset-0 bg-black/30" />

        {/* Contenu en bas */}
        <View className="absolute bottom-0 left-0 right-0 p-3">
          {/* Nom du jeu */}
          <Text className="text-sm font-bold text-white mb-1" numberOfLines={2}>
            {game.name}
          </Text>
          
          {/* Catégorie */}
          <View className="space-y-1">
            <Text className="text-xs text-gray-300" numberOfLines={1}>
              {getMainCategory()}
            </Text>
            
            {/* Informations supplémentaires */}
            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-gray-400">{getPlayerCount()}</Text>
              {getPlaytime() && (
                <Text className="text-xs text-gray-400">• {getPlaytime()}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Indicateur de complexité */}
        {game.complexity && game.complexity !== 'N/A' && (
          <View className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded">
            <Text className="text-white text-xs">{game.complexity}/5</Text>
          </View>
        )}
      </ImageBackground>
    </TouchableOpacity>
  );
}







