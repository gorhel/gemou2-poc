import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../components/auth/AuthProvider';
import AuthForm from '../components/auth/AuthForm';

function LandingPage() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Bienvenue sur Gémou2 ! 🎲</Text>
        <Text style={styles.subtitle}>
          L'application qui connecte les passionnés de jeux de société.
          Organisez des événements, rencontrez des joueurs et échangez vos jeux.
        </Text>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.emoji}>📅</Text>
            <Text style={styles.featureTitle}>Événements</Text>
            <Text style={styles.featureText}>
              Créez et rejoignez des soirées jeux près de chez vous
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.emoji}>💬</Text>
            <Text style={styles.featureTitle}>Communauté</Text>
            <Text style={styles.featureText}>
              Échangez avec des passionnés et trouvez des partenaires de jeu
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.emoji}>🛒</Text>
            <Text style={styles.featureTitle}>Marketplace</Text>
            <Text style={styles.featureText}>
              Vendez, achetez et échangez vos jeux de société
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.welcomeTitle}>
            Bonjour {user?.user_metadata?.full_name || user?.email} ! 🎲
          </Text>
          <Text style={styles.welcomeSubtitle}>
            Bienvenue dans votre espace Gémou2
          </Text>
          <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
            <Text style={styles.signOutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dashboardGrid}>
          <TouchableOpacity style={styles.dashboardCard}>
            <Text style={styles.cardEmoji}>📅</Text>
            <Text style={styles.cardTitle}>Mes Événements</Text>
            <Text style={styles.cardText}>
              Gérez vos événements et participations
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dashboardCard}>
            <Text style={styles.cardEmoji}>💬</Text>
            <Text style={styles.cardTitle}>Messages</Text>
            <Text style={styles.cardText}>
              Discutez avec la communauté
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dashboardCard}>
            <Text style={styles.cardEmoji}>🛒</Text>
            <Text style={styles.cardTitle}>Marketplace</Text>
            <Text style={styles.cardText}>
              Achetez et vendez des jeux
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (user) {
    return <Dashboard />;
  }

  return (
    <ScrollView style={styles.container}>
      <AuthForm />
      <LandingPage />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  features: {
    marginTop: 20,
  },
  feature: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f2937',
  },
  featureText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f2937',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 15,
  },
  signOutButton: {
    backgroundColor: '#dc2626',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  signOutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dashboardGrid: {
    gap: 15,
  },
  dashboardCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardEmoji: {
    fontSize: 30,
    textAlign: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1f2937',
  },
  cardText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});