'use client';

import React, { useState, useEffect } from 'react';
import { createClientSupabaseClient } from '../../lib/supabase-client';
import { LoadingSpinner } from '../ui/Loading';
import { Button } from '../ui/Button';
import UsersSlider from './UsersSlider';

interface User {
  id: string;
  username: string;
  full_name: string;
  bio: string;
  avatar_url: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export default function UsersRecommendations() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClientSupabaseClient();

  useEffect(() => {
    fetchRecommendedUsers();
  }, []);

  const fetchRecommendedUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les 10 utilisateurs les plus récents (classés par date de création)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .not('username', 'is', null) // Exclure les profils sans username
        .not('full_name', 'is', null) // Exclure les profils sans nom
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        throw error;
      }

      // Filtrer les données pour s'assurer qu'elles sont valides
      const validUsers = (data || []).filter(user => 
        user && 
        user.id && 
        user.username && 
        user.full_name
      );

      setUsers(validUsers);
    } catch (error: any) {
      console.error('Error fetching recommended users:', error);
      setError('Erreur lors du chargement des joueurs recommandés');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (user: User) => {
    // Navigation vers le profil utilisateur
    console.log('View profile:', user);
    window.location.href = `/profile/${user.username}`;
  };

  const handleSendMessage = (userId: string) => {
    // TODO: Implémenter l'envoi de message
    console.log('Send message to:', userId);
    alert('Fonctionnalité de messagerie à venir !');
  };

  const handleRefresh = () => {
    fetchRecommendedUsers();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">👥 Joueurs recommandés</h2>
            <p className="text-gray-600">Découvrez les nouveaux joueurs de la communauté</p>
          </div>
        </div>
        
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <LoadingSpinner size="xl" className="mb-4" />
            <p className="text-gray-600">Chargement des joueurs...</p>
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
            <h2 className="text-2xl font-bold text-gray-900">👥 Joueurs recommandés</h2>
            <p className="text-gray-600">Découvrez les nouveaux joueurs de la communauté</p>
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
      {/* Users Slider - Format vertical compact */}
      <UsersSlider
        users={users}
        onViewProfile={handleViewProfile}
        onSendMessage={handleSendMessage}
      />

      {/* Additional info */}
      {users.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          <p>
            {users.length} joueur{users.length > 1 ? 's' : ''} trouvé{users.length > 1 ? 's' : ''} • 
            Classés par date d'inscription
          </p>
        </div>
      )}
    </div>
  );
}
