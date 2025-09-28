import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

function OnboardingSlide({ title, description, emoji }: { title: string; description: string; emoji: string }) {
  return (
    <View style={styles.slide}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

export default function OnboardingPage() {
  const handleComplete = async () => {
    // Marquer l'onboarding comme terminé
    await SecureStore.setItemAsync('gemou2-onboarding-completed', 'true');
    
    // Rediriger vers la page de connexion
    router.replace('/login');
  };

  const handleSkip = async () => {
    // Marquer l'onboarding comme terminé même si skip
    await SecureStore.setItemAsync('gemou2-onboarding-completed', 'true');
    
    // Rediriger vers la page de connexion
    router.replace('/login');
  };

  const slides = [
    {
      title: 'Bienvenue sur Gémou2 ! 🎲',
      description: 'L\'application qui connecte les passionnés de jeux de société. Organisez des événements, rencontrez des joueurs et échangez vos jeux.',
      emoji: '🎲'
    },
    {
      title: 'Organisez des Événements 📅',
      description: 'Créez et rejoignez des soirées jeux près de chez vous. Trouvez des partenaires de jeu et créez des souvenirs inoubliables.',
      emoji: '📅'
    },
    {
      title: 'Rejoignez la Communauté 💬',
      description: 'Échangez avec des passionnés et trouvez des partenaires de jeu. Rejoignez une communauté active de joueurs passionnés.',
      emoji: '💬'
    },
    {
      title: 'Marketplace des Jeux 🛒',
      description: 'Vendez, achetez et échangez vos jeux de société. Découvrez des trésors cachés et donnez une seconde vie à vos jeux préférés.',
      emoji: '🛒'
    }
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {slides.map((slide, index) => (
          <OnboardingSlide
            key={index}
            title={slide.title}
            description={slide.description}
            emoji={slide.emoji}
          />
        ))}
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Passer</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
          <Text style={styles.completeButtonText}>Commencer l'aventure</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
    minHeight: 500,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1f2937',
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginBottom: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
  },
  completeButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
