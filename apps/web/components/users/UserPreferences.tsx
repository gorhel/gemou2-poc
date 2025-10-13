'use client';

import React, { useEffect, useState } from 'react';
import { createClientSupabaseClient } from '../../lib/supabase-client';
import { LoadingSpinner, Card, CardHeader, CardTitle, CardContent } from '../ui';
import SmallPill from '../ui/SmallPill';

interface UserTag {
  id: string;
  tag_id: string;
  tags: {
    id: string;
    name: string;
  };
}

interface UserPreferencesProps {
  userId: string;
  isOwnProfile?: boolean;
}

export default function UserPreferences({ userId, isOwnProfile = false }: UserPreferencesProps) {
  const [tags, setTags] = useState<UserTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientSupabaseClient();

  useEffect(() => {
    fetchUserTags();
  }, [userId]);

  const fetchUserTags = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les tags de l'utilisateur avec une jointure sur la table tags
      const { data, error: fetchError } = await supabase
        .from('user_tags')
        .select(`
          id,
          tag_id,
          tags:tag_id (
            id,
            name
          )
        `)
        .eq('user_id', userId);

      if (fetchError) {
        throw fetchError;
      }

      setTags(data || []);
    } catch (err: any) {
      console.error('Error fetching user tags:', err);
      setError('Erreur lors du chargement des préférences');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🎯 Mes préférences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🎯 Mes préférences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🎯 {isOwnProfile ? 'Mes préférences' : 'Préférences de jeu'}</CardTitle>
      </CardHeader>
      <CardContent>
        {tags.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <span className="text-4xl">🏷️</span>
            </div>
            <p className="text-gray-600">
              {isOwnProfile 
                ? 'Aucune préférence définie' 
                : 'Aucune préférence définie'}
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((userTag) => (
              <SmallPill key={userTag.id}>
                {userTag.tags?.name || 'Tag inconnu'}
              </SmallPill>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

