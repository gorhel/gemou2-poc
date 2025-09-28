'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientSupabaseClient } from '../../lib/supabase-client';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  LoadingSpinner
} from '../../components/ui';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClientSupabaseClient();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

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
    setFormData(prev => ({ ...prev, email: value }));
    setErrors(prev => ({ ...prev, email: '' }));
    setGeneralError(null);
    
    if (value && !validateEmail(value)) {
      setErrors(prev => ({ ...prev, email: 'Format email invalide' }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setFormData(prev => ({ ...prev, password: value }));
    setErrors(prev => ({ ...prev, password: '' }));
    setGeneralError(null);
    
    if (value && !validatePassword(value)) {
      setErrors(prev => ({ ...prev, password: 'Le mot de passe doit contenir au moins 6 caractères' }));
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
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email requis';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Format email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Mot de passe requis';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setErrors({});

    // Validation côté client
    if (!validateForm()) {
      return;
    }

    // État de chargement avec feedback visuel
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (error) {
        setGeneralError(getErrorMessage(error));
        return;
      }

      // Redirection vers dashboard après connexion réussie
      router.push('/dashboard');
    } catch (error: any) {
      setGeneralError(getErrorMessage(error));
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Navigation vers autres pages
  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  const handleCreateAccount = () => {
    router.push('/register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Connexion à <span className="text-primary-600">Gémou2</span>
          </h1>
          <p className="text-gray-600">
            Connectez-vous avec votre email et mot de passe
          </p>
        </div>

        {/* Formulaire de connexion */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Se connecter</CardTitle>
            <CardDescription className="text-center">
              Entrez vos identifiants pour accéder à votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <Input
                  label="Adresse email"
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  error={errors.email}
                  leftIcon="📧"
                  required
                  disabled={loading}
                />
              </div>

              {/* Mot de passe */}
              <div>
                <Input
                  label="Mot de passe"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  error={errors.password}
                  leftIcon="🔒"
                  required
                  disabled={loading}
                />
              </div>

              {/* Erreur générale */}
              {generalError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-red-400">⚠️</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{generalError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bouton de connexion avec état de chargement */}
              <Button
                type="submit"
                size="lg"
                fullWidth
                loading={loading}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    Connexion en cours...
                  </div>
                ) : (
                  'Se connecter'
                )}
              </Button>
            </form>

            {/* Liens d'action */}
            <div className="mt-6 space-y-4">
              {/* Mot de passe oublié */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                  disabled={loading}
                >
                  Mot de passe oublié ?
                </button>
              </div>

              {/* Créer un compte */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Pas encore de compte ?{' '}
                  <button
                    type="button"
                    onClick={handleCreateAccount}
                    className="font-medium text-primary-600 hover:text-primary-800"
                    disabled={loading}
                  >
                    Créer un compte
                  </button>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}