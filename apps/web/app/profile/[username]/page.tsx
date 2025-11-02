'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClientSupabaseClient } from '../../../lib/supabase-client';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { LoadingSpinner } from '../../../components/ui/Loading';
import { ResponsiveLayout, PageHeader, PageFooter } from '../../../components/layout';
import { FriendsSlider } from '../../../components/users';

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  bio: string;
  avatar_url?: string;
  email?: string;
  location?: string;
  created_at: string;
  updated_at: string;
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

interface UserEvent {
  id: string;
  title: string;
  date_time: string;
  location: string;
  status: string;
  role: 'organizer' | 'participant';
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClientSupabaseClient();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userGames, setUserGames] = useState<UserGame[]>([]);
  const [userEvents, setUserEvents] = useState<UserEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFriend, setIsFriend] = useState(false);
  const [isLoadingAction, setIsLoadingAction] = useState(false);

  const username = params.username as string;

  useEffect(() => {
    if (username) {
      fetchUserProfile();
    }
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer le profil utilisateur
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (profileError) {
        throw profileError;
      }

      if (!profileData) {
        throw new Error('Utilisateur non trouvé');
      }

      setProfile(profileData);

      // Vérifier le statut d'amitié
      const { data: currentUser } = await supabase.auth.getUser();
      let friendshipData = null;
      
      if (currentUser.user) {
        const { data: friendship, error: friendshipError } = await supabase
          .from('friends')
          .select('friendship_status')
          .or(`and(user_id.eq.${currentUser.user.id},friend_id.eq.${profileData.id}),and(user_id.eq.${profileData.id},friend_id.eq.${currentUser.user.id})`)
          .eq('friendship_status', 'accepted')
          .single();

        if (friendshipError && friendshipError.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error checking friendship status:', friendshipError);
        } else {
          friendshipData = friendship;
          setIsFriend(!!friendship);
        }
      }

      // Récupérer les jeux de l'utilisateur depuis la base de données
      const { data: gamesData, error: gamesError } = await supabase
        .from('user_games')
        .select('*')
        .eq('user_id', profileData.id)
        .order('added_at', { ascending: false });

      if (gamesError) {
        console.error('Error fetching user games:', gamesError);
        setUserGames([]);
      } else {
        const formattedGames: UserGame[] = (gamesData || []).map(game => ({
          id: game.game_id,
          name: game.game_name,
          thumbnail: game.game_thumbnail,
          image: game.game_image,
          year_published: game.year_published,
          min_players: game.min_players,
          max_players: game.max_players
        }));
        setUserGames(formattedGames);
      }

      // Récupérer les événements de l'utilisateur (seulement si ami)
      if (currentUser.user && (currentUser.user.id === profileData.id || !!friendshipData)) {
        // Récupérer les événements organisés
        const { data: organizedEvents, error: organizedError } = await supabase
          .from('events')
          .select('id, title, description, date_time, location')
          .eq('creator_id', profileData.id)
          .order('date_time', { ascending: false });

        if (organizedError) {
          console.error('Error fetching organized events:', organizedError);
        }

        // Récupérer les événements participés
        const { data: participatedEvents, error: participatedError } = await supabase
          .from('event_participants')
          .select(`
            id,
            events!inner(id, title, description, date_time, location)
          `)
          .eq('user_id', profileData.id)
          .eq('status', 'registered')
          .order('joined_at', { ascending: false });

        if (participatedError) {
          console.error('Error fetching participated events:', participatedError);
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
      } else {
        // Pas ami ou pas connecté, ne pas charger les événements
        setUserEvents([]);
      }

    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      setError(error.message || 'Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    setIsLoadingAction(true);
    try {
      // TODO: Implémenter l'envoi de message
      console.log('Send message to:', profile?.username);
      alert('Fonctionnalité de messagerie à venir !');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleAddFriend = async () => {
    setIsLoadingAction(true);
    try {
      // TODO: Implémenter l'ajout d'ami
      console.log('Add friend:', profile?.username);
      setIsFriend(!isFriend);
      alert(isFriend ? 'Ami retiré !' : 'Ami ajouté !');
    } catch (error) {
      console.error('Error adding friend:', error);
    } finally {
      setIsLoadingAction(false);
    }
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="xl" className="mb-4" />
            <p className="text-gray-600 text-lg">Chargement du profil...</p>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (error || !profile) {
    return (
      <ResponsiveLayout>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <span className="text-4xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Profil non trouvé</h3>
            <p className="text-gray-600 mb-4">{error || 'Cet utilisateur n\'existe pas.'}</p>
            <Button onClick={() => router.back()} variant="outline">
              Retour
            </Button>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex flex-col">
        <PageHeader
          icon="👤"
          title={profile?.full_name || 'Profil utilisateur'}
          subtitle={profile?.username ? `@${profile.username}` : ''}
          showBackButton
        />
        
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex-1">
          {/* Header du profil */}
          <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full flex items-center justify-center text-white font-bold text-2xl ${profile.avatar_url ? 'hidden' : ''}`}
                       style={{ backgroundColor: `hsl(${profile.id.charCodeAt(0) * 137.5 % 360}, 70%, 50%)` }}>
                    {getInitials(profile.full_name)}
                  </div>
                </div>
              </div>

              {/* Informations du profil */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {profile.full_name}
                </h1>
                <p className="text-lg text-gray-600 mb-1">
                  @{profile.username}
                </p>
                {profile.location && (
                  <p className="text-gray-500 mb-4">
                    📍 {profile.location}
                  </p>
                )}
                {profile.bio && (
                  <p className="text-gray-700 max-w-2xl">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section KPI */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-blue-600">
                  {userGames.length}
                </CardTitle>
                <p className="text-gray-600">Jeux possédés</p>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-green-600">
                  {Math.floor(Math.random() * 50) + 10}
                </CardTitle>
                <p className="text-gray-600">Amis</p>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-purple-600">
                  {userGames.length > 20 ? 'Expert' : userGames.length > 10 ? 'Avancé' : userGames.length > 5 ? 'Intermédiaire' : 'Débutant'}
                </CardTitle>
                <p className="text-gray-600">Niveau</p>
              </CardHeader>
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

          {/* Section Mes événements */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                📅 Événements de {profile?.full_name || profile?.username}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isFriend ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <span className="text-4xl">🔒</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Vous devez être ami avec {profile?.full_name || profile?.username} pour voir ses événements
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push('/community')}
                  >
                    Ajouter comme ami
                  </Button>
                </div>
              ) : userEvents.length === 0 ? (
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
                          <h3 className="font-semibold text-gray-900">{event.title}</h3>
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section Amis de cet utilisateur */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">👥 Amis de {profile?.full_name || profile?.username}</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/community')}
              >
                Voir tous les amis
              </Button>
            </div>
            <FriendsSlider userId={profile?.id} />
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleSendMessage}
              disabled={isLoadingAction}
              className="flex-1 sm:flex-none sm:px-8"
            >
              {isLoadingAction ? 'Envoi...' : '💬 Envoyer message'}
            </Button>
            <Button
              onClick={handleAddFriend}
              disabled={isLoadingAction}
              variant={isFriend ? "outline" : "default"}
              className="flex-1 sm:flex-none sm:px-8"
            >
              {isLoadingAction ? 'Ajout...' : isFriend ? '👥 Ami retiré' : '👥 Ajouter en ami'}
            </Button>
          </div>
        </div>

        <PageFooter />
      </div>
    </ResponsiveLayout>
  );
}
