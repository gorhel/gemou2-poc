import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, CardContent } from '../ui/Card';
import MachiColors from '../../theme/colors';

interface User {
  id: string;
  username: string;
  full_name: string;
  bio: string;
  avatar_url?: string;
  email?: string;
  created_at: string;
  city: string;
}

interface UserCardProps {
  user: User;
  onViewProfile?: (user: User) => void;
}

export default function UserCard({ user, onViewProfile }: UserCardProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onViewProfile) {
      onViewProfile(user);
    } else {
      // Navigation par défaut vers la page de profil
      router.push(`/profile/${user.username}`);
    }
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    if (diffDays < 30) return `Il y a ${Math.ceil(diffDays / 7)} semaines`;
    if (diffDays < 365) return `Il y a ${Math.ceil(diffDays / 30)} mois`;
    return `Il y a ${Math.ceil(diffDays / 365)} ans`;
  };

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isBusiness = user.email && user.email.includes('@') && (user.email.includes('.re') || user.email.includes('bar') || user.email.includes('cafe'));

  const getGamePreferences = (bio: string) => {
    if (!bio) return 'Aucune préférence';
    
    const gameKeywords = [
      'stratégie', 'coopération', 'famille', 'enfants', 'éducatif', 
      'allemand', 'wargame', 'narratif', 'escape', 'historique', 
      'simulation', 'deck-building', 'rapide', 'tournoi'
    ];
    
    const foundKeywords = gameKeywords.filter(keyword => 
      bio.toLowerCase().includes(keyword)
    );
    
    if (foundKeywords.length > 0) {
      return foundKeywords.slice(0, 2).join(', ');
    }
    
    return 'Joueur polyvalent';
  };

  // Utiliser la couleur primaire Machi pour les avatars (dégradé simulé)
  const getAvatarColor = () => {
    return MachiColors.primary;
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Card style={{ width: 256 }}>
        <CardContent>
          {/* Photo de profil circulaire */}
          <View className="relative">
            <View className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 items-center justify-center">
              {user.avatar_url ? (
                <Image
                  source={{ uri: user.avatar_url }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View 
                  className="w-full h-full items-center justify-center"
                  style={{ backgroundColor: getAvatarColor() }}
                >
                  <Text className="text-white text-lg font-bold">
                    {getInitials(user.full_name || 'Utilisateur sans nom')}
                  </Text>
                </View>
              )}
            </View>
            
            {/* Badge business */}
            {isBusiness && (
              <View 
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full items-center justify-center"
                style={{ backgroundColor: MachiColors.accent }}
              >
                <Text className="text-white text-xs">🏢</Text>
              </View>
            )}
          </View>

          {/* Nom centré */}
          <View className="items-center space-y-1">
            <Text className="text-lg font-bold text-gray-900 text-center" numberOfLines={1}>
              {isBusiness ? user.full_name : `@${user.username}`}
            </Text>
            
            <Text className="text-xs text-gray-500">
              📍{user.city || 'pas_de_ville'}
            </Text>
          </View>

          {/* Préférences de jeu */}
          <Text className="text-xs text-gray-400 text-center" numberOfLines={2}>
            {getGamePreferences(user.bio || '')}
          </Text>

          {/* Date d'inscription */}
          <Text className="text-xs text-gray-400">
            {formatJoinDate(user.created_at)}
          </Text>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );
}

