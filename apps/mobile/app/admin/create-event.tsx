'use client'

import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../../lib'
import { PageLayout } from '../../components/layout'

export default function AdminCreateEventPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const createEvent = async () => {
    setLoading(true);
    setResult('');

    try {
      const eventData = {
        title: 'Soirée Jeux de Société - Test',
        description: 'Événement de test créé depuis l\'admin mobile',
        event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 jours
        location: 'Café des Jeux, Paris',
        max_participants: 12,
        current_participants: 0,
        status: 'active',
        image_url: null
      };

      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select();

      if (error) {
        const message = `❌ Erreur: ${error.message}`;
        setResult(message);
        if (Platform.OS !== 'web') {
          Alert.alert('Erreur', error.message);
        }
      } else {
        const successMessage = `✅ Événement créé avec succès !
        
🆔 ID: ${data[0].id}
📝 Titre: ${data[0].title}
📅 Date: ${new Date(data[0].event_date).toLocaleString('fr-FR')}
📍 Lieu: ${data[0].location}
👥 Participants max: ${data[0].max_participants}`;
        
        setResult(successMessage);
        if (Platform.OS !== 'web') {
          Alert.alert('Succès', 'Événement créé !', [
            { text: 'Voir', onPress: () => router.push(`/events/${data[0].id}`) },
            { text: 'OK' }
          ]);
        }
      }
    } catch (error: any) {
      const message = `❌ Erreur: ${error.message}`;
      setResult(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout showHeader={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>⚡ Admin - Créer événement</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Création rapide d'événement</Text>
          <Text style={styles.cardDescription}>
            Crée un événement de test pour développement
          </Text>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={createEvent}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Créer événement de test</Text>
            )}
          </TouchableOpacity>

          {result && (
            <View style={[styles.resultBox, result.includes('✅') && styles.resultBoxSuccess]}>
              <Text style={styles.resultText}>{result}</Text>
            </View>
          )}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoEmoji}>ℹ️</Text>
          <Text style={styles.infoText}>
            Cette page admin permet de créer rapidement des événements de test.
            En production, cette route devrait être protégée par un rôle admin.
          </Text>
        </View>
      </View>
    </PageLayout>
  )
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: Platform.select({ ios: 60, android: 20, web: 20 }),
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    fontSize: 16,
    color: '#3b82f6',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
  },
  resultBoxSuccess: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  resultText: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
  },
  infoEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
});

