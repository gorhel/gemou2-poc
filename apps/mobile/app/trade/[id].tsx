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
  RefreshControl,
  Image
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../../lib';
import { PageLayout } from '../../components/layout'
import { TopHeader } from '../../components/TopHeader';
import {  ConfirmationModal, ModalVariant, ConfirmModal, SuccessModal } from '../../components/ui';

export default function TradeDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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

      // Support pour les deux noms de colonnes (migration en cours)
      const sellerId = itemData.seller_id || itemData.user_id;

      const { data: sellerData } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, city')
        .eq('id', sellerId)
        .single();

      setSeller(sellerData);

    } catch (error) {
      console.error('Error loading trade:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const formatDate = (dateTime: string) => {
    if (!dateTime) return 'Date non définie';
    
    const d = new Date(dateTime);
    
    // Vérifier si la date est valide
    if (isNaN(d.getTime())) {
      return 'Date invalide';
    }
    
    const dayOfWeek = d.toLocaleString('fr-FR', { weekday: 'long' });
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('fr-FR', { month: 'long' });
    // const hours = String(d.getHours()).padStart(2, '0');
    // const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${dayOfWeek} ${day} ${month}`;
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

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };


  const handleDeleteItem = async () => {
    if (!item || !user) return;

    setIsDeleting(true);

    try {
      // Appeler la fonction de soft delete
      const { error } = await supabase.rpc('soft_delete_marketplace_item', {
        item_id: item.id
      });

      if (error) {
        console.error('Error deleting item:', error);
        Alert.alert('Erreur', 'Impossible de supprimer l\'annonce');
        return;
      }

      // Fermer la modale de confirmation et afficher la modale de succès
      setShowConfirmDelete(false);
      setShowSuccess(true);

      // Rediriger après 2 secondes
      setTimeout(() => {
        router.push('/(tabs)/marketplace');
      }, 2000);
    } catch (err) {
      console.error('Error:', err);
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setIsDeleting(false);
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

  // Support pour les deux noms de colonnes (migration en cours)
  const sellerId = item?.seller_id || item?.user_id;
  const isOwner = user?.id === sellerId;

  return (
    <PageLayout showHeader={true} refreshing={refreshing} onRefresh={onRefresh} showFooter={false}>

      <View style={styles.content}>
      <View style={styles.eventImageContainer}>
          {item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              style={styles.eventImage}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.eventImagePlaceholder}>shop</Text>
          )}
        </View>
        
        
      <Text style={styles.title}>{item.title}</Text>

      <View style={styles.typeContainer}>
          <Text style={styles.typeEmoji}>{getTypeEmoji(item.type)}</Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>
              {item.type === 'sale' ? 'Vente' : item.type === 'exchange' ? 'Échange' : 'Don'}
            </Text>
          </View>
        </View>

        <View style={styles.metaContainer}>
          {isOwner &&(
            <View style={styles.metaItem}>
            <View style={styles.organizerContainer}>
              <View style={styles.organizerAvatar}>
                {seller.avatar_url ? (
                  <Image
                    source={{ uri: seller.avatar_url }}
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View 
                    style={[
                      styles.avatarFallback,
                      { backgroundColor: `hsl(${seller.id.charCodeAt(0) * 137.5 % 360}, 70%, 50%)` }
                    ]}
                  >
                    <Text style={styles.avatarInitials}>
                      {getInitials(seller.full_name || seller.username)}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.metaText}>
              <span style={{ fontWeight:700 }}>Vendeur</span> 
              <br /> 
              Organisé par {isOwner ? 'vous' : user.full_name || user.username}
              </Text>
            </View>
          </View>
          

          )}

           <View style={styles.metaItem}>
            <Text style={styles.metaEmoji}>📍</Text>
            <Text style={styles.metaText}>
              <span style={{ fontWeight:700 }}>Lieu :</span>
              <br />
              {item.location_city}
            </Text>
           </View>

           <View style={styles.metaItem}>
            <Text style={styles.metaEmoji}>
            {item.condition === 'new' ? '✨' : item.condition === 'excellent' ? '🎀​' : item.condition === 'good' ? '👍​' : '♻️'}
            </Text>
            <Text style={styles.metaText}>
              <span style={{ fontWeight:700 }}>Etat :</span>
              <br />
              {item.condition === 'new' ? 'Neuf' : item.condition === 'excellent' ? 'Excellent' : item.condition === 'good' ? 'Bon' : 'Acceptable'}
            </Text>
           </View>

           {item.price && (
            <View style={styles.metaItem}>
            <Text style={styles.metaEmoji}>💰</Text>
            <Text style={styles.metaText}>
              <span style={{ fontWeight:700 }}>Prix :</span>
              <br />
              {item.price}€
            </Text>
           </View>
           )}

           {item.wanted_game && (
            
          <View style={styles.metaItem}>
            <Text style={styles.metaEmoji}>🔄</Text>
            <Text style={styles.metaText}>
            <span style={{ fontWeight:700 }}> Jeu souhaité en échange :</span>
            <br />
            {item.wanted_game}
            </Text>
          </View>
          )}

          <View style={styles.metaItem}>
          <Text style={styles.metaEmoji}>📅</Text>
            <Text style={styles.metaText}>
            <span style={{ fontWeight:700 }}>Publié le :</span>
            <br />
            {formatDate(item.created_at)}
            </Text>
          </View>

        </View>

        <View style={styles.separator} />

        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Description de l'événement</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>

        {!isOwner && (
          <TouchableOpacity
            style={styles.contactButton}
            onPress={handleContact}
          >
            <Text style={styles.contactButtonText}>💬 Contacter le vendeur</Text>
          </TouchableOpacity>
        )}

        {isOwner && (
          <>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push(`/(tabs)/create-trade?id=${id}`)}
            >
              <Text style={styles.editButtonText}>✏️ Modifier l'annonce</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => setShowConfirmDelete(true)}
            >
              <Text style={styles.deleteButtonText}>🗑️ Supprimer l'annonce</Text>
            </TouchableOpacity>
            
            <View style={styles.ownerBadge}>
              <Text style={styles.ownerBadgeText}>⭐ Votre annonce</Text>
            </View>
          </>
        )}

      </View>

      <ConfirmModal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleDeleteItem}
        title="Supprimer l'annonce"
        description="Êtes-vous sûr de vouloir supprimer définitivement cette annonce ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        confirmVariant="destructive"
        loading={isDeleting}
      />

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          router.push('/(tabs)/marketplace');
        }}
        title="Annonce supprimée"
        description="Votre annonce a été supprimée avec succès. Vous allez être redirigé vers le marketplace."
        confirmText="OK"
      />
      

      
    </PageLayout>
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
  content: {
    padding: 0,
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
  editButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  editButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  deleteButtonText: {
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
  eventImageContainer: {
    width: '100%',
    height: 200,
    overflow: 'hidden',
    backgroundColor: '#E0E0E0'
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  eventImagePlaceholder: {
    fontSize: 124,
    color: '#6b7280',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
  },
  organizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  metaEmoji: {
    fontSize: 38,
    marginRight: 12,
    borderRadius:10,
    backgroundColor: '#F0F2F5',
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',

    display: 'flex',
  },
  metaText: {
    fontSize: 16,
    color: '#4b5563',
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 5,
  },
});

