'use client';

import React, { useState, useEffect } from 'react';
import { createClientSupabaseClient } from '../../lib/supabase-client';
import { LoadingSpinner } from '../ui/Loading';
import { Button } from '../ui/Button';
import FriendCard from './FriendCard';

interface Friend {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  city?: string;
  created_at: string;
}

interface FriendsSliderProps {
  userId?: string; // ID de l'utilisateur dont on veut voir les amis
  showAllProfiles?: boolean; // Si true, affiche tous les profils (pour compatibilité)
}

export default function FriendsSlider({ userId, showAllProfiles = false }: FriendsSliderProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const supabase = createClientSupabaseClient();

  useEffect(() => {
    fetchFriends();
  }, [userId]);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      setError(null);

      let data, error;

      if (showAllProfiles) {
        // Mode compatibilité : afficher tous les profils (sauf l'utilisateur actuel)
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          throw new Error('Utilisateur non connecté');
        }

        const result = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url, bio, city, created_at')
          .neq('id', user.id) // Exclure l'utilisateur actuel
          .not('username', 'is', null) // Seulement les profils avec username
          .order('created_at', { ascending: false })
          .limit(10);

        data = result.data;
        error = result.error;
      } else if (userId) {
        // Mode spécifique : récupérer les amis d'un utilisateur donné
        // Utilise la vraie table friends avec les relations bidirectionnelles
        
        // Étape 1: Récupérer les IDs des amis
        const { data: friendIds, error: friendError } = await supabase
          .from('friends')
          .select('friend_id, user_id')
          .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
          .eq('friendship_status', 'accepted');

        if (friendError) {
          throw friendError;
        }

        if (!friendIds || friendIds.length === 0) {
          data = [];
          error = null;
        } else {
          // Étape 2: Extraire les IDs uniques des amis (pas l'utilisateur lui-même)
          const uniqueFriendIds = [...new Set(
            friendIds
              .map(f => f.user_id === userId ? f.friend_id : f.user_id)
              .filter(id => id !== userId)
          )];

          // Étape 3: Récupérer les profils des amis
          const result = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url, bio, city, created_at')
            .in('id', uniqueFriendIds)
            .not('username', 'is', null)
            .order('created_at', { ascending: false })
            .limit(6);

          data = result.data;
          error = result.error;
        }
      } else {
        throw new Error('Paramètres manquants pour récupérer les amis');
      }

      if (error) {
        throw error;
      }

      setFriends(data || []);
    } catch (error: any) {
      console.error('Error fetching friends:', error);
      setError('Erreur lors du chargement des amis: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (friend: Friend) => {
    // Navigation vers le profil sera gérée par le Link dans FriendCard
    console.log('Viewing profile:', friend.username);
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex >= friends.length - 3 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex <= 0 ? Math.max(0, friends.length - 3) : prevIndex - 1
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <LoadingSpinner size="xl" className="mb-4" />
          <p className="text-gray-600">Chargement de vos amis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <span className="text-4xl">⚠️</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchFriends} variant="outline">
          Réessayer
        </Button>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <span className="text-6xl">👥</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun ami trouvé</h3>
        <p className="text-gray-600 mb-4">
          Vous n'avez pas encore d'amis. Explorez la communauté pour rencontrer d'autres joueurs !
        </p>
        <Button variant="outline" onClick={() => window.location.href = '/community'}>
          Découvrir la communauté
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Conteneur du slider */}
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{ 
            transform: `translateX(-${currentIndex * (100 / Math.min(3, friends.length))}%)`,
            width: `${(friends.length / Math.min(3, friends.length)) * 100}%`
          }}
        >
          {friends.map((friend) => (
            <div 
              key={friend.id}
              className="flex-shrink-0 px-2"
              style={{ width: `${100 / friends.length}%` }}
            >
              <div className="h-80">
                <FriendCard
                  friend={friend}
                  onViewProfile={handleViewProfile}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Boutons de navigation */}
      {friends.length > 3 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow z-10"
            aria-label="Ami précédent"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow z-10"
            aria-label="Ami suivant"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Indicateurs de pagination */}
      {friends.length > 3 && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: Math.ceil(friends.length / 3) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                Math.floor(currentIndex / 3) === index ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              aria-label={`Page ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
