'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '../ui/Card';

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

  const handleClick = () => {
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

  // Extraire les préférences de jeu de la bio
  const getGamePreferences = (bio: string) => {
    if (!bio) return 'Aucune préférence';
    
    // Mots-clés liés aux jeux
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

  return (
    <Card 
      className="h-full duration-200 cursor-pointer group w-64"
      onClick={handleClick}
    >
      <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
        {/* Photo de profil circulaire */}
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name || 'Utilisateur sans nom'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-full h-full flex items-center justify-center text-white text-lg font-bold text-gray-900 mb-1 ${user.avatar_url ? 'hidden' : ''}`}
                 style={{ backgroundColor: `hsl(${user.id.charCodeAt(0) * 137.5 % 360}, 70%, 50%)` }}>
              {getInitials(user.full_name || 'Utilisateur sans nom')}
            </div>
          </div>
          
          {/* Badge business */}
          {isBusiness && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">🏢</span>
            </div>
          )}
        </div>

        {/* Nom centré */}
        <div className="space-y-1">

          {isBusiness &&(
            <h3 className="font-semibold text-lg font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {user.full_name || 'Utilisateur sans nom'}
            </h3>
          )}
          {!isBusiness && (
            <h3 className="font-semibold text-lg font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
              @{user.username || 'Utilisateur sans nom'}
            </h3>
          )}
          
          {isBusiness && (
            <p className="text-xs text-gray-500">
              📍{user.city || 'pas_de_ville'}
            </p>
          )}
          
          {!isBusiness && (
            <p className="text-xs text-gray-500">
              📍{user.city || 'pas_de_ville'}
            </p>
          )}
        </div>

        {/* Préférences de jeu en petite police grise */}
        <div className="text-xs text-gray-400 line-clamp-2">
          {getGamePreferences(user.bio || '')}
        </div>

        {/* Date d'inscription */}
        <div className="text-xs text-gray-400">
          {formatJoinDate(user.created_at)}
        </div>
      </CardContent>
    </Card>
  );
}