'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientSupabaseClient } from '../../lib/supabase-client';
import { Button, Card, CardHeader, CardTitle, CardContent, LoadingSpinner } from '../../components/ui';
import ResponsiveLayout from '../../components/layout/ResponsiveLayout';

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClientSupabaseClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
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
      <ResponsiveLayout>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="xl" className="mb-4" />
            <p className="text-gray-600 text-lg">Chargement...</p>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ResponsiveLayout>
      <div className="bg-gradient-to-br from-primary-50 to-secondary-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">👤 Profil</h1>
                <p className="text-gray-600">Gérez votre profil et vos préférences</p>
              </div>
              <Button onClick={handleLogout} variant="outline">
                Se déconnecter
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profil principal */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>👤 Informations du profil</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-2xl">👤</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Utilisateur</h3>
                        <p className="text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-gray-700">Email :</span>
                        <span className="ml-2 text-gray-600">{user.email}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">ID utilisateur :</span>
                        <span className="ml-2 text-gray-600 text-xs font-mono">{user.id}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Membre depuis :</span>
                        <span className="ml-2 text-gray-600">
                          {new Date(user.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Dernière connexion :</span>
                        <span className="ml-2 text-gray-600">
                          {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('fr-FR') : 'Maintenant'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>⚙️ Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full" variant="outline">
                      Modifier le profil
                    </Button>
                    <Button className="w-full" variant="outline">
                      Changer le mot de passe
                    </Button>
                    <Button className="w-full" variant="outline">
                      Préférences
                    </Button>
                    <Button className="w-full" variant="outline">
                      Notifications
                    </Button>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <span className="text-gray-400">ℹ️</span>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-gray-800">
                            Fonctionnalités à venir
                          </h3>
                          <p className="text-sm text-gray-700 mt-1">
                            La gestion complète du profil sera disponible prochainement.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
}

