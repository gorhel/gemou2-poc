import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Error getting user:', error);
          router.replace('/login');
          return;
        }

        if (!user) {
          router.replace('/login');
          return;
        }

        setUser(user);
      } catch (error) {
        console.error('Error:', error);
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Erreur', 'Impossible de se déconnecter');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Chargement du tableau de bord...</Text>
      </View>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🎲 Tableau de bord Gémou2</Text>
        <Text style={styles.subtitle}>Bienvenue, {user.email}</Text>
      </View>

      {/* Welcome Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Félicitations !</Text>
        <Text style={styles.cardText}>
          Vous êtes maintenant connecté à votre compte Gémou2.
          Votre authentification avec email + mot de passe fonctionne parfaitement.
        </Text>
        <View style={styles.successBadge}>
          <Text style={styles.successText}>✅ Connexion réussie</Text>
        </View>
      </View>

      {/* User Info Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>👤 Informations du compte</Text>
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email :</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID utilisateur :</Text>
            <Text style={styles.infoValue}>{user.id.substring(0, 8)}...</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Dernière connexion :</Text>
            <Text style={styles.infoValue}>
              {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('fr-FR') : 'Maintenant'}
            </Text>
          </View>
        </View>
      </View>

      {/* Features Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🚀 Fonctionnalités disponibles</Text>
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✅</Text>
            <Text style={styles.featureText}>Authentification email + mot de passe</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✅</Text>
            <Text style={styles.featureText}>Validation côté client</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✅</Text>
            <Text style={styles.featureText}>Gestion d'erreurs explicites</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✅</Text>
            <Text style={styles.featureText}>États de chargement</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✅</Text>
            <Text style={styles.featureText}>Redirection vers dashboard</Text>
          </View>
        </View>
      </View>

      {/* Next Steps Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📋 Spécifications OUT-132-2</Text>
        <Text style={styles.cardText}>
          Toutes les spécifications fonctionnelles sont implémentées :
        </Text>
        <View style={styles.specsList}>
          <Text style={styles.specItem}>• Méthode unique : Email + Mot de passe</Text>
          <Text style={styles.specItem}>• Validation côté client</Text>
          <Text style={styles.specItem}>• Gestion d'erreurs explicites</Text>
          <Text style={styles.specItem}>• États de chargement</Text>
          <Text style={styles.specItem}>• Redirection vers dashboard</Text>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  card: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  successBadge: {
    backgroundColor: '#dcfce7',
    padding: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  successText: {
    color: '#166534',
    fontSize: 14,
    fontWeight: '600',
  },
  infoContainer: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  infoValue: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
    textAlign: 'right',
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    marginRight: 8,
    fontSize: 14,
  },
  featureText: {
    fontSize: 14,
    color: '#6b7280',
  },
  specsList: {
    marginTop: 8,
    gap: 4,
  },
  specItem: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    margin: 16,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

