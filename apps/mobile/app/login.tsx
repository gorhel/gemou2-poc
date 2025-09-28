import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Validation côté client
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  // Validation en temps réel
  const handleEmailChange = (value: string) => {
    setEmail(value);
    setEmailError(null);
    
    if (value && !validateEmail(value)) {
      setEmailError('Format email invalide');
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordError(null);
    
    if (value && !validatePassword(value)) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
    }
  };

  // Messages d'erreur explicites
  const getErrorMessage = (error: any): string => {
    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('invalid login credentials') || message.includes('invalid email or password')) {
      return 'Email ou mot de passe incorrect';
    }
    if (message.includes('email not confirmed')) {
      return 'Veuillez confirmer votre email avant de vous connecter';
    }
    if (message.includes('too many requests')) {
      return 'Trop de tentatives de connexion. Veuillez réessayer plus tard';
    }
    if (message.includes('user not found')) {
      return 'Compte inexistant. Vérifiez votre email ou créez un compte';
    }
    if (message.includes('invalid email')) {
      return 'Format email invalide';
    }
    
    return 'Une erreur est survenue lors de la connexion';
  };

  // Validation complète du formulaire
  const validateForm = (): boolean => {
    let hasErrors = false;

    if (!email) {
      setEmailError('Email requis');
      hasErrors = true;
    } else if (!validateEmail(email)) {
      setEmailError('Format email invalide');
      hasErrors = true;
    }

    if (!password) {
      setPasswordError('Mot de passe requis');
      hasErrors = true;
    } else if (!validatePassword(password)) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
      hasErrors = true;
    }

    return !hasErrors;
  };

  // Gestion de la connexion
  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    // État de chargement avec feedback visuel
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        Alert.alert('Erreur de connexion', getErrorMessage(error));
        return;
      }

      // Redirection vers dashboard après connexion réussie
      router.replace('/dashboard');
    } catch (err: any) {
      Alert.alert('Erreur', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Navigation vers autres pages
  const handleForgotPassword = () => {
    Alert.alert('Mot de passe oublié', 'Fonctionnalité à implémenter.');
  };

  const handleCreateAccount = () => {
    router.push('/register');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Connexion à Gémou2</Text>
        <Text style={styles.subtitle}>Connectez-vous avec votre email et mot de passe</Text>
      </View>

      {/* Formulaire de connexion */}
      <View style={styles.form}>
        {/* Email */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Adresse email</Text>
          <TextInput
            style={[styles.input, emailError && styles.inputError]}
            placeholder="votre@email.com"
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
          {emailError && <Text style={styles.errorText}>{emailError}</Text>}
        </View>

        {/* Mot de passe */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Mot de passe</Text>
          <TextInput
            style={[styles.input, passwordError && styles.inputError]}
            placeholder="••••••••"
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
          {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
        </View>

        {/* Bouton de connexion */}
        <TouchableOpacity
          style={[styles.loginButton, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="white" size="small" />
              <Text style={styles.loginButtonText}>Connexion en cours...</Text>
            </View>
          ) : (
            <Text style={styles.loginButtonText}>Se connecter</Text>
          )}
        </TouchableOpacity>

        {/* Liens d'action */}
        <View style={styles.linksContainer}>
          <TouchableOpacity 
            style={styles.linkButton} 
            onPress={handleForgotPassword}
            disabled={loading}
          >
            <Text style={styles.linkButtonText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.linkButton} 
            onPress={handleCreateAccount}
            disabled={loading}
          >
            <Text style={styles.linkButtonText}>Pas encore de compte ? Créer un compte</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 5,
  },
  loginButton: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  linksContainer: {
    alignItems: 'center',
    gap: 15,
  },
  linkButton: {
    paddingVertical: 10,
  },
  linkButtonText: {
    color: '#3b82f6',
    fontSize: 15,
    textAlign: 'center',
  },
});