'use client';

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../lib';

export default function CreateTradePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: 'sale' as 'sale' | 'exchange' | 'donation',
    title: '',
    description: '',
    condition: 'good' as 'new' | 'excellent' | 'good' | 'acceptable',
    price: '',
    location_city: '',
    wanted_game: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est obligatoire';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est obligatoire';
    }

    if (!formData.location_city.trim()) {
      newErrors.location_city = 'La ville est obligatoire';
    }

    if (formData.type === 'sale' && !formData.price) {
      newErrors.price = 'Le prix est obligatoire pour une vente';
    }

    if (formData.type === 'exchange' && !formData.wanted_game.trim()) {
      newErrors.wanted_game = 'Indiquez le jeu souhaité en échange';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !user) return;

    setSubmitting(true);
    try {
      const itemData = {
        user_id: user.id,
        type: formData.type,
        title: formData.title,
        description: formData.description,
        condition: formData.condition,
        price: formData.type === 'sale' ? parseFloat(formData.price) : null,
        location_city: formData.location_city,
        wanted_game: formData.type === 'exchange' ? formData.wanted_game : null,
        status: 'active',
        images: []
      };

      const { data, error } = await supabase
        .from('marketplace_items')
        .insert([itemData])
        .select()
        .single();

      if (error) throw error;

      if (Platform.OS === 'web') {
        router.push(`/trade/${data.id}`);
      } else {
        Alert.alert(
          'Succès !',
          'Votre annonce a été publiée',
          [{ text: 'OK', onPress: () => router.push('/marketplace') }]
        );
      }
    } catch (error: any) {
      const message = error.message || 'Une erreur est survenue';
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert('Erreur', message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Créer une annonce</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Nouvelle annonce 🛒</Text>

        {/* Type */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Type d'annonce *</Text>
          <View style={styles.typeButtons}>
            <TouchableOpacity
              style={[styles.typeButton, formData.type === 'sale' && styles.typeButtonActive]}
              onPress={() => setFormData(prev => ({ ...prev, type: 'sale' }))}
            >
              <Text style={styles.typeButtonText}>💰 Vente</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeButton, formData.type === 'exchange' && styles.typeButtonActive]}
              onPress={() => setFormData(prev => ({ ...prev, type: 'exchange' }))}
            >
              <Text style={styles.typeButtonText}>🔄 Échange</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeButton, formData.type === 'donation' && styles.typeButtonActive]}
              onPress={() => setFormData(prev => ({ ...prev, type: 'donation' }))}
            >
              <Text style={styles.typeButtonText}>🎁 Don</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Title */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Titre *</Text>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            placeholder="Ex: Catan en excellent état"
            value={formData.title}
            onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
        </View>

        {/* Description */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.textArea, errors.description && styles.inputError]}
            placeholder="Décrivez votre jeu..."
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
        </View>

        {/* Price (si vente) */}
        {formData.type === 'sale' && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Prix (€) *</Text>
            <TextInput
              style={[styles.input, errors.price && styles.inputError]}
              placeholder="25"
              value={formData.price}
              onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
              keyboardType="decimal-pad"
            />
            {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
          </View>
        )}

        {/* Wanted game (si échange) */}
        {formData.type === 'exchange' && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Jeu souhaité en échange *</Text>
            <TextInput
              style={[styles.input, errors.wanted_game && styles.inputError]}
              placeholder="Ex: 7 Wonders, Splendor..."
              value={formData.wanted_game}
              onChangeText={(text) => setFormData(prev => ({ ...prev, wanted_game: text }))}
            />
            {errors.wanted_game && <Text style={styles.errorText}>{errors.wanted_game}</Text>}
          </View>
        )}

        {/* Location */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Ville *</Text>
          <TextInput
            style={[styles.input, errors.location_city && styles.inputError]}
            placeholder="Paris"
            value={formData.location_city}
            onChangeText={(text) => setFormData(prev => ({ ...prev, location_city: text }))}
          />
          {errors.location_city && <Text style={styles.errorText}>{errors.location_city}</Text>}
        </View>

        {/* Condition */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>État</Text>
          <View style={styles.conditionButtons}>
            {['new', 'excellent', 'good', 'acceptable'].map((cond) => (
              <TouchableOpacity
                key={cond}
                style={[styles.conditionButton, formData.condition === cond && styles.conditionButtonActive]}
                onPress={() => setFormData(prev => ({ ...prev, condition: cond as any }))}
              >
                <Text style={[styles.conditionText, formData.condition === cond && styles.conditionTextActive]}>
                  {cond === 'new' ? 'Neuf' : cond === 'excellent' ? 'Excellent' : cond === 'good' ? 'Bon' : 'Acceptable'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.push('/marketplace')}
            disabled={submitting}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Publier</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  contentContainer: {
    paddingBottom: 40,
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
  header: {
    backgroundColor: 'white',
    padding: 16,
    paddingTop: Platform.select({ ios: 60, android: 16, web: 16 }),
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backBtn: {
    marginBottom: 12,
  },
  backBtnText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  card: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    minHeight: 100,
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  conditionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  conditionButton: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  conditionButtonActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  conditionText: {
    fontSize: 13,
    color: '#6b7280',
  },
  conditionTextActive: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

