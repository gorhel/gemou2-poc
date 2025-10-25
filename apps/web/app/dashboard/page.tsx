'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientSupabaseClient } from '../../lib/supabase-client';
import { Button, Card, CardHeader, CardTitle, CardContent, LoadingSpinner } from '../../components/ui';
import { EventsSlider } from '../../components/events';
import { GamesRecommendations } from '../../components/games';
import { UsersRecommendations } from '../../components/users';
import { MarketplaceListings } from '../../components/marketplace';
import { ResponsiveLayout, PageHeader, PageFooter } from '../../components/layout';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClientSupabaseClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Error getting user:', error);
          router.push('/login');
          return;
        }

        if (!user) {
          router.push('/login');
          return;
        }

        setUser(user);
      } catch (error) {
        console.error('Error:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [router, supabase.auth]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" className="mb-4" />
          <p className="text-gray-600 text-lg">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <ResponsiveLayout>
      <div className="bg-gradient-to-br from-primary-50 to-secondary-50 min-h-screen flex flex-col">
        <PageHeader
          title="Tableau de bord"
          subtitle={`Bienvenue, ${user.email}`}
          actions={
            <Button onClick={handleLogout} variant="outline">
              Se déconnecter
            </Button>
          }
        />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0 space-y-12">
            {/* Welcome Section - Compact */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">🎲 Bienvenue sur Gémou2 !</h2>
                  <p className="text-gray-600">
                    Découvrez les événements, rencontrez des joueurs et explorez de nouveaux jeux.
                  </p>
                </div>
                <div className="hidden md:block">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-sm text-gray-600 mb-1">Connecté en tant que</div>
                    <div className="font-medium text-gray-900">{user.email}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Events Section - Slider horizontal */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">📅 Événements à venir</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/events')}
                >
                  Voir tous les événements
                </Button>
              </div>
              <EventsSlider />
            </div>

            {/* Users Recommendations Section - Format vertical compact */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">👥 Suggestions de joueurs</h2>
                  <Button variant="outline" size="sm">
                    Voir la communauté
                  </Button>
                </div>
                <UsersRecommendations />
              </div>

            {/* Marketplace Section - Annonces de vente et échange */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">🛒 Annonces de vente et d'échange</h2>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push('/create-trade')}
                  >
                    Créer une annonce
                  </Button>
                </div>
                <MarketplaceListings limit={6} />
              </div>

            {/* Games Recommendations Section - Format carré */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">🎮 Recommandations de jeux</h2>
                  <Button variant="outline" size="sm">
                    Explorer plus
                  </Button>
                </div>
                <GamesRecommendations />
              </div>
          </div>
        </div>

        <PageFooter />
      </div>
    </ResponsiveLayout>
  );
}

