import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Linking,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../../lib';

// Type pour les jeux de la base de données
interface Game {
  id: string;
  bgg_id: string | null;
  name: string;
  description: string | null;
  min_players: number | null;
  max_players: number | null;
  duration_min: number | null;
  photo_url: string | null;
  data: any;
}

export default function GameDetailsPage() {
  const params = useLocalSearchParams();
  const gameId = params.id as string;
  
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (gameId) {
      fetchGameDetails();
    }
  }, [gameId]);

  const fetchGameDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      if (!data) {
        setError('Jeu non trouvé');
        return;
      }

      setGame(data);
    } catch (error: any) {
      console.error('Error fetching game details:', error);
      setError('Erreur lors du chargement des détails du jeu');
    } finally {
      setLoading(false);
    }
  };

  const getPlayerCount = () => {
    if (!game) return 'Non spécifié';
    
    if (game.min_players && game.max_players) {
      if (game.min_players === game.max_players) {
        return `${game.min_players} joueur${game.min_players > 1 ? 's' : ''}`;
      }
      return `${game.min_players} - ${game.max_players} joueurs`;
    }
    return 'Non spécifié';
  };

  const getDuration = () => {
    if (!game || !game.duration_min) return 'Non spécifiée';
    return `${game.duration_min} minutes`;
  };

  const openBGG = () => {
    if (game?.bgg_id) {
      Linking.openURL(`https://boardgamegeek.com/boardgame/${game.bgg_id}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Chargement des détails du jeu...</Text>
      </View>
    );
  }

  if (error || !game) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorTitle}>Erreur</Text>
        <Text style={styles.errorText}>{error || 'Jeu non trouvé'}</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header avec bouton retour */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButtonHeader} 
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonHeaderText}>← Retour</Text>
        </TouchableOpacity>
      </View>

      {/* Image du jeu */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: game.photo_url || 'https://via.placeholder.com/300' }}
          style={styles.gameImage}
          resizeMode="cover"
        />
      </View>

      {/* Informations principales */}
      <View style={styles.mainInfo}>
        <Text style={styles.gameName}>{game.name}</Text>
        {game.data?.yearPublished && (
          <Text style={styles.yearPublished}>
            Publié en {game.data.yearPublished}
          </Text>
        )}
      </View>

      {/* Informations rapides */}
      <View style={styles.quickInfo}>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Joueurs</Text>
          <Text style={styles.infoValue}>{getPlayerCount()}</Text>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Durée</Text>
          <Text style={styles.infoValue}>{getDuration()}</Text>
        </View>

        {game.data?.minAge && (
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Âge</Text>
            <Text style={styles.infoValue}>{game.data.minAge}+ ans</Text>
          </View>
        )}

        {game.data?.complexity && (
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Complexité</Text>
            <Text style={styles.infoValue}>{game.data.complexity}/5</Text>
          </View>
        )}
      </View>

      {game.data?.averageRating && (
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingLabel}>Note moyenne</Text>
          <Text style={styles.ratingValue}>
            ⭐ {game.data.averageRating.toFixed(1)}/10
          </Text>
        </View>
      )}

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          {game.description || 'Aucune description disponible pour ce jeu.'}
        </Text>
      </View>

      {/* Catégories */}
      {game.data?.categories && game.data.categories.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Catégories</Text>
          <View style={styles.tagsContainer}>
            {game.data.categories.map((category: string, index: number) => (
              <View key={index} style={[styles.tag, styles.categoryTag]}>
                <Text style={styles.tagText}>{category}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Mécaniques */}
      {game.data?.mechanics && game.data.mechanics.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mécaniques de jeu</Text>
          <View style={styles.tagsContainer}>
            {game.data.mechanics.map((mechanic: string, index: number) => (
              <View key={index} style={[styles.tag, styles.mechanicTag]}>
                <Text style={styles.tagText}>{mechanic}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Créateurs */}
      {game.data?.designers && game.data.designers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Concepteurs</Text>
          <Text style={styles.listText}>
            {game.data.designers.join(', ')}
          </Text>
        </View>
      )}

      {/* Artistes */}
      {game.data?.artists && game.data.artists.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Artistes</Text>
          <Text style={styles.listText}>
            {game.data.artists.join(', ')}
          </Text>
        </View>
      )}

      {/* Éditeurs */}
      {game.data?.publishers && game.data.publishers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Éditeurs</Text>
          <Text style={styles.listText}>
            {game.data.publishers.join(', ')}
          </Text>
        </View>
      )}

      {/* Lien BoardGameGeek */}
      {game.bgg_id && (
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.bggButton} 
            onPress={openBGG}
          >
            <Text style={styles.bggButtonText}>
              Voir sur BoardGameGeek →
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Spacer */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
    padding: 20,
  },
  errorEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    paddingTop: Platform.select({ ios: 60, android: 20, web: 20 }),
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButtonHeader: {
    paddingVertical: 8,
  },
  backButtonHeaderText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  imageContainer: {
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
  },
  gameImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
  },
  mainInfo: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 16,
  },
  gameName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  yearPublished: {
    fontSize: 16,
    color: '#6b7280',
  },
  quickInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'white',
    padding: 16,
    marginTop: 16,
    gap: 12,
  },
  infoCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginTop: 16,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryTag: {
    backgroundColor: '#dbeafe',
  },
  mechanicTag: {
    backgroundColor: '#f3e8ff',
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  listText: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  bggButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  bggButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

