'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientSupabaseClient } from '../../lib/supabase-client';
import { Button, Card, CardHeader, CardTitle, CardContent, LoadingSpinner } from '../../components/ui';
import { FriendsSlider, UserPreferences } from '../../components/users';
import ResponsiveLayout from '../../components/layout/ResponsiveLayout';

// Types pour les événements utilisateur
interface UserEvent {
  id: string;
  title: string;
  description: string | null;
  date_time: string;
  location: string;
  status?: string;
  role: 'organizer' | 'participant';
}

interface UserGame {
  id: string;
  name: string;
  thumbnail?: string;
  image?: string;
  year_published?: number;
  min_players?: number;
  max_players?: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClientSupabaseClient();
  const [userGames, setUserGames] = useState<UserGame[]>([]);
  const [user, setUser] = useState<any>(null);
  const [userEvents, setUserEvents] = useState<UserEvent[]>([]);
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
        
        // Charger les événements de l'utilisateur connecté
        await fetchUserEvents(user.id);
      } catch (error) {
        console.error('Error:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [router, supabase.auth]);

  const fetchUserEvents = async (userId: string) => {
    try {
      // Récupérer les événements organisés
      const { data: organizedEvents, error: organizedError } = await supabase
        .from('events')
        .select('id, title, description, date_time, location')
        .eq('creator_id', userId)
        .order('date_time', { ascending: false });

      if (organizedError) {
        console.error('Error fetching organized events:', organizedError);
        return;
      }

      // Récupérer les événements participés
      const { data: participatedEvents, error: participatedError } = await supabase
        .from('event_participants')
        .select(`
          id,
          events!inner(id, title, description, date_time, location)
        `)
        .eq('user_id', userId)
        .eq('status', 'registered')
        .order('joined_at', { ascending: false });

      if (participatedError) {
        console.error('Error fetching participated events:', participatedError);
        return;
      }

        // Combiner et formater les événements
        const organizedFormatted: UserEvent[] = organizedEvents?.map(event => ({
          id: event.id,
          title: event.title,
          description: event.description,
          date_time: event.date_time,
          location: event.location,
          status: 'active',
          role: 'organizer' as const
        })) || [];

        const participatedFormatted: UserEvent[] = participatedEvents?.map(participant => ({
          id: (participant as any).events.id,
          title: (participant as any).events.title,
          description: (participant as any).events.description,
          date_time: (participant as any).events.date_time,
          location: (participant as any).events.location,
          status: 'registered',
          role: 'participant' as const
        })) || [];

        // Fusionner et trier par date
        const allEvents = [...organizedFormatted, ...participatedFormatted]
          .sort((a, b) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime());

      setUserEvents(allEvents);
    } catch (error) {
      console.error('Error fetching user events:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
          <div className="px-4 py-6 sm:px-0 space-y-8">
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
                      <div className="flex-1 text-center md:text-left">
                        <h3 className="text-3xl font-bold text-gray-900 mb-2">{user.email}</h3>
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
                      <div>
                        <span className="font-medium text-gray-700">Bio :</span>
                        <span className="ml-2 text-gray-600">
                          {user.bio}
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
            {/* Section Mes jeux */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl font-bold">🎮 Mes jeux</CardTitle>
              </CardHeader>
              <CardContent>
                {userGames.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                      <span className="text-4xl">🎲</span>
                    </div>
                    <p className="text-gray-600">Aucun jeu dans la collection</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {userGames.map((game) => (
                      <div key={game.id} className="text-center">
                        <div className="aspect-square w-full rounded-lg overflow-hidden bg-gray-200 mb-2">
                          <img
                            src={game.thumbnail || game.image || '/placeholder-game.svg'}
                            alt={game.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-game.svg';
                            }}
                          />
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {game.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Section Mes préférences */}
            <div className="mb-8">
              <UserPreferences userId={user.id} isOwnProfile={true} />
            </div>

            {/* Section Mes événements */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl font-bold">📅 Mes événements</CardTitle>
              </CardHeader>
              <CardContent>
                {userEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                      <span className="text-4xl">📅</span>
                    </div>
                    <p className="text-gray-600">Aucun événement participé</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userEvents.map((event, index) => (
                      <div key={event.id} className="flex items-start space-x-4">
                        {/* Timeline indicator */}
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-sm">📅</span>
                          </div>
                          {index < userEvents.length - 1 && (
                            <div className="w-0.5 h-8 bg-gray-200 mt-2"></div>
                          )}
                        </div>
                        
                        {/* Event content */}
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between">
                            <a href='/events/'>
                              <h3 className="font-semibold text-gray-900">{event.title}</h3>
                            </a>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              event.role === 'organizer' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {event.role === 'organizer' ? 'Organisateur' : 'Participant'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {formatDate(event.date_time)} • {event.location}
                          </p>
                          {event.description && (
                            <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Section Mes amis */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">👥 Mes amis</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/community')}
                >
                  Gérer mes amis
                </Button>
              </div>
              <FriendsSlider userId={user?.id} />
            </div>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
}

