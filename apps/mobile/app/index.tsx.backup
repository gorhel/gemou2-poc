import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native'
import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { useAuth } from '../components/auth/AuthProvider'
import AuthForm from '../components/auth/AuthForm'
import { PageLayout } from '../components/layout'

// Fonction helper pour gérer le storage cross-platform
const getStorageItem = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
};

function LandingPage() {
  return (
    <>
      <AuthForm />
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
    </>
  )
}

function Dashboard() {
  // Rediriger directement vers le dashboard avec tabs
  React.useEffect(() => {
    router.replace('/(tabs)/dashboard');
  }, []);

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text style={styles.loadingText}>Redirection...</Text>
    </View>
  );
}

export default function Home() {
  const { user, loading } = useAuth();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur a vu l'onboarding
    const checkOnboarding = async () => {
      try {
        const onboardingCompleted = await getStorageItem('gemou2-onboarding-completed');
        setHasSeenOnboarding(!!onboardingCompleted);
        
        // Si l'onboarding n'a pas été vu, rediriger
        if (!onboardingCompleted) {
          router.replace('/onboarding');
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'onboarding:', error);
        // En cas d'erreur, considérer que l'onboarding n'a pas été vu
        router.replace('/onboarding');
      } finally {
        setCheckingOnboarding(false);
      }
    };

    checkOnboarding();
  }, []);

  if (loading || checkingOnboarding) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>
          {checkingOnboarding ? 'Vérification...' : 'Chargement...'}
        </Text>
      </View>
    );
  }

  // Si l'onboarding n'a pas été vu, ne rien afficher (redirection en cours)
  if (!hasSeenOnboarding) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Redirection vers l'onboarding...</Text>
      </View>
    );
  }

  if (user) {
    return <Dashboard />
  }

  return (
    <PageLayout showHeader={false}>
      <LandingPage />
    </PageLayout>
  )
}

const styles = StyleSheet.create({
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