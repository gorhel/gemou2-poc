'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientSupabaseClient } from '../../lib/supabase-client';
import { useUsernameValidation } from '../../hooks/useUsernameValidation';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input
} from '../../components/ui';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClientSupabaseClient();
  
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

  // Validation du username en temps réel
  const usernameValidation = useUsernameValidation(formData.username);

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
      newErrors.username = 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores';
    } else if (!usernameValidation.isValid && usernameValidation.error) {
      newErrors.username = usernameValidation.error;
    }

    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        if (error.message.includes('User already registered')) {
          setGeneralError('Un compte existe déjà avec cet email');
        } else {
          setGeneralError(error.message);
        }
        return;
      }

      // Inscription réussie
      router.push('/login?message=check-email');
    } catch (error: any) {
      setGeneralError('Une erreur inattendue s\'est produite');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Créer un compte <span className="text-primary-600">Gémou2</span>
          </h1>
          <p className="text-gray-600">
            Rejoignez la communauté des passionnés de jeux de société
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">S'inscrire</CardTitle>
            <CardDescription className="text-center">
              Créez votre compte pour accéder à toutes les fonctionnalités
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Prénom"
                  type="text"
                  placeholder="Jean"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  error={errors.firstName}
                  leftIcon="👤"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">

                <Input
                  label="Nom"
                  type="text"
                  placeholder="Dupont"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  error={errors.lastName}
                  leftIcon="👤"
                  required
                />
              </div>

              <div>
                <Input
                  label="Nom d'utilisateur"
                  type="text"
                  placeholder="jean_dupont"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  error={errors.username || usernameValidation.error}
                  leftIcon="🏷️"
                  required
                />
                {/* Indicateur de validation en temps réel */}
                {formData.username.length >= 3 && (
                  <div className="mt-1 text-sm">
                    {usernameValidation.isChecking && (
                      <span className="text-blue-600 flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Vérification...
                      </span>
                    )}
                    {!usernameValidation.isChecking && usernameValidation.isValid && (
                      <span className="text-green-600 flex items-center">
                        ✅ {formData.username} est disponible
                      </span>
                    )}
                    {!usernameValidation.isChecking && !usernameValidation.isValid && usernameValidation.error && (
                      <span className="text-red-600 flex items-center">
                        ❌ {usernameValidation.error}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <Input
                label="Adresse email"
                type="email"
                placeholder="votre@email.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                error={errors.email}
                leftIcon="📧"
                required
              />

              <Input
                label="Mot de passe"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                error={errors.password}
                leftIcon="🔒"
                required
              />

              <Input
                label="Confirmer le mot de passe"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                error={errors.confirmPassword}
                leftIcon="🔒"
                required
              />

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

              <Button
                type="submit"
                size="lg"
                fullWidth
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Création...' : 'Créer mon compte'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Déjà un compte ?{' '}
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="font-medium text-primary-600 hover:text-primary-800"
                >
                  Se connecter
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

