'use client';

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert,
  RefreshControl
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../../lib';
import { TopHeader } from '../../components/TopHeader';

export default function TradeDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);

  const loadTrade = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }
      setUser(user);

      const { data: itemData, error: itemError } = await supabase
        .from('marketplace_items')
        .select('*')
        .eq('id', id)
        .single();

      if (itemError) throw itemError;
      setItem(itemData);

      const { data: sellerData } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, city')
        .eq('id', itemData.user_id)
        .single();

      setSeller(sellerData);

    } catch (error) {
      console.error('Error loading trade:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadTrade();
    }
  }, [id]);

  const handleContact = () => {
    if (Platform.OS === 'web') {
      alert(`Contacter ${seller?.username || 'le vendeur'}`);
    } else {
      Alert.alert(
        'Contacter le vendeur',
        `Souhaitez-vous contacter ${seller?.username || 'ce vendeur'} ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Contacter', onPress: () => {} }
        ]
      );
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTrade();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>😕</Text>
        <Text style={styles.errorTitle}>Annonce introuvable</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'sale': return '💰';
      case 'exchange': return '🔄';
      case 'donation': return '🎁';
      default: return '📦';
    }
  };

  const isOwner = user?.id === item.user_id;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <TopHeader />  {/* Auto-configuration ! */}
        <ScrollView>
          {/* Contenu */}
        </ScrollView>
      </View>
      

      <View style={styles.content}>
        <View style={styles.typeContainer}>
          <Text style={styles.typeEmoji}>{getTypeEmoji(item.type)}</Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>
              {item.type === 'sale' ? 'Vente' : item.type === 'exchange' ? 'Échange' : 'Don'}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>{item.title}</Text>

        {item.price && (
          <Text style={styles.price}>{item.price}€</Text>
        )}

        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>État :</Text>
            <Text style={styles.metaValue}>
              {item.condition === 'new' ? 'Neuf' : item.condition === 'excellent' ? 'Excellent' : item.condition === 'good' ? 'Bon' : 'Acceptable'}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Lieu :</Text>
            <Text style={styles.metaValue}>📍 {item.location_city}</Text>
          </View>

          {seller && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Vendeur :</Text>
              <TouchableOpacity onPress={() => router.push(`/profile/${seller.username}`)}>
                <Text style={styles.metaLink}>@{seller.username}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>

        {item.wanted_game && (
          <View style={styles.wantedContainer}>
            <Text style={styles.wantedTitle}>Jeu souhaité en échange</Text>
            <Text style={styles.wantedText}>{item.wanted_game}</Text>
          </View>
        )}

        {!isOwner && (
          <TouchableOpacity
            style={styles.contactButton}
            onPress={handleContact}
          >
            <Text style={styles.contactButtonText}>💬 Contacter le vendeur</Text>
          </TouchableOpacity>
        )}

        {isOwner && (
          <View style={styles.ownerBadge}>
            <Text style={styles.ownerBadgeText}>⭐ Votre annonce</Text>
          </View>
        )}
      </View>
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
    padding: 40,
  },
  errorEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
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
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    paddingTop: Platform.select({ ios: 60, android: 16, web: 16 }),
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flex: 1,
  },
  backBtn: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  content: {
    padding: 20,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  typeEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  typeBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 20,
  },
  metaContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginRight: 8,
  },
  metaValue: {
    fontSize: 14,
    color: '#1f2937',
  },
  metaLink: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  descriptionContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
  },
  wantedContainer: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  wantedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  wantedText: {
    fontSize: 14,
    color: '#78350f',
  },
  contactButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ownerBadge: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  ownerBadgeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
  },
});

