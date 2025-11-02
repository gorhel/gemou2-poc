'use client'

import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../lib'
import { PageLayout } from '../components/layout'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  // Validation du username en temps réel
  const checkUsername = async (username: string) => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setUsernameChecking(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();

      setUsernameAvailable(!data);
    } catch (error) {
      setUsernameAvailable(true);
    } finally {
      setUsernameChecking(false);
    }
  };

  // Validation des champs
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Le nom d\'utilisateur est requis';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username = 'Lettres, chiffres, tirets et underscores uniquement';
    } else if (usernameAvailable === false) {
      newErrors.username = 'Ce nom d\'utilisateur est déjà pris';
    }

    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    } else {
      // Vérifier les domaines invalides
      const invalidDomains = ['example.com', 'test.com', 'localhost'];
      const domain = formData.email.split('@')[1];
      if (invalidDomains.includes(domain)) {
        newErrors.email = 'Veuillez utiliser une adresse email valide (Gmail, Yahoo, etc.)';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setGeneralError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: `${formData.firstName} ${formData.lastName}`,
            first_name: formData.firstName,
            last_name: formData.lastName,
            username: formData.username,
          },
        },
      });

      if (error) {
        if (error.message.includes('Email address') && error.message.includes('invalid')) {
          setGeneralError('Veuillez utiliser une adresse email valide (Gmail, Yahoo, etc.)');
        } else if (error.message.includes('User already registered')) {
          setGeneralError('Un compte existe déjà avec cet email');
        } else if (error.message.includes('Password should be at least')) {
          setGeneralError('Le mot de passe doit contenir au moins 6 caractères');
        } else {
          setGeneralError(error.message);
        }
        return;
      }

      // Inscription réussie
      if (Platform.OS === 'web') {
        router.push('/login?message=check-email');
      } else {
        Alert.alert(
          'Inscription réussie !',
          'Vérifiez votre email pour confirmer votre compte.',
          [{ text: 'OK', onPress: () => router.push('/login') }]
        );
      }
    } catch (error: any) {
      setGeneralError('Une erreur inattendue s\'est produite');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameChange = (username: string) => {
    setFormData(prev => ({ ...prev, username }));
    // Debounce la vérification
    if (username.length >= 3) {
      setTimeout(() => checkUsername(username), 500);
    }
  };

  return (
    <PageLayout showHeader={false} scrollEnabled={true} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Créer un compte <Text style={styles.titleAccent}>Gémou2</Text>
        </Text>
        <Text style={styles.subtitle}>
          Rejoignez la communauté des passionnés de jeux de société
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>S'inscrire</Text>
        <Text style={styles.cardDescription}>
          Créez votre compte pour accéder à toutes les fonctionnalités
        </Text>

        <View style={styles.form}>
          {/* Prénom et Nom */}
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Prénom</Text>
              <TextInput
                style={[styles.input, errors.firstName && styles.inputError]}
                placeholder="Jean"
                value={formData.firstName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
                autoCapitalize="words"
              />
              {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
            </View>

            <View style={styles.halfInput}>
              <Text style={styles.label}>Nom</Text>
              <TextInput
                style={[styles.input, errors.lastName && styles.inputError]}
                placeholder="Dupont"
                value={formData.lastName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
                autoCapitalize="words"
              />
              {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
            </View>
          </View>

          {/* Username */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nom d'utilisateur</Text>
            <TextInput
              style={[styles.input, errors.username && styles.inputError]}
              placeholder="jean_dupont"
              value={formData.username}
              onChangeText={handleUsernameChange}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
            {usernameChecking && (
              <Text style={styles.infoText}>⏳ Vérification...</Text>
            )}
            {!usernameChecking && usernameAvailable === true && formData.username.length >= 3 && (
              <Text style={styles.successText}>✅ {formData.username} est disponible</Text>
            )}
            {!usernameChecking && usernameAvailable === false && (
              <Text style={styles.errorText}>❌ Ce nom d'utilisateur est déjà pris</Text>
            )}
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Adresse email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="votre@email.com"
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mot de passe</Text>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="••••••••"
              value={formData.password}
              onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
              secureTextEntry
              autoCapitalize="none"
            />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirmer le mot de passe</Text>
            <TextInput
              style={[styles.input, errors.confirmPassword && styles.inputError]}
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
              secureTextEntry
              autoCapitalize="none"
            />
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
          </View>

          {/* General Error */}
          {generalError && (
            <View style={styles.errorBox}>
              <Text style={styles.errorBoxText}>⚠️ {generalError}</Text>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Créer mon compte</Text>
            )}
          </TouchableOpacity>

          {/* Link to Login */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Déjà un compte ?</Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.footerLink}> Se connecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </PageLayout>
  )
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: 20,
    paddingTop: Platform.select({ web: 60, default: 40 }),
    paddingBottom: 40,
    ...Platform.select({
      web: {
        alignItems: 'center',
      },
    }),
  },
  header: {
    marginBottom: 30,
    ...Platform.select({
      web: {
        maxWidth: 480,
        width: '100%',
      },
    }),
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 10,
  },
  titleAccent: {
    color: '#3b82f6',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    ...Platform.select({
      web: {
        maxWidth: 480,
        width: '100%',
      },
    }),
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
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
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#3b82f6',
    marginTop: 4,
  },
  successText: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 4,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  errorBoxText: {
    fontSize: 14,
    color: '#991b1b',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  footerLink: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
});

