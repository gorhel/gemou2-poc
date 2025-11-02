'use client';

import React, { useState } from 'react';
import { createClientSupabaseClient } from '@/lib/supabase-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

export default function TestRegistrationPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClientSupabaseClient();

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, first_name, last_name, email, avatar_url, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        throw error;
      }

      setProfiles(data || []);
    } catch (err: any) {
      console.error('Erreur lors de la récupération des profils:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearProfiles = () => {
    setProfiles([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              🧪 Test de la sauvegarde des profils
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Vérifiez que les données de création de compte sont correctement sauvegardées
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">📋 Instructions :</h3>
              <ol className="list-decimal list-inside space-y-1 text-blue-700 text-sm">
                <li>Créez un nouveau compte via <a href="/register" className="underline font-medium">/register</a></li>
                <li>Remplissez tous les champs (prénom, nom, username, email, mot de passe)</li>
                <li>Vérifiez que la validation d'username fonctionne</li>
                <li>Validez l'inscription</li>
                <li>Revenez ici et cliquez sur "Récupérer les profils"</li>
                <li>Vérifiez que tous les champs sont bien sauvegardés</li>
              </ol>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={fetchProfiles}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Récupération...' : '📊 Récupérer les profils'}
              </button>
              <button
                onClick={clearProfiles}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                🗑️ Effacer
              </button>
              <a
                href="/register"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center"
              >
                ➕ Créer un compte
              </a>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">❌ Erreur :</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {profiles.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4">
                  📊 Profils trouvés ({profiles.length})
                </h3>
                <div className="space-y-4">
                  {profiles.map((profile, index) => (
                    <div key={profile.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">Profil #{index + 1}</h4>
                        <span className="text-xs text-gray-500">
                          {new Date(profile.created_at).toLocaleString('fr-FR')}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium text-gray-700">ID:</span>
                            <span className="ml-2 font-mono text-xs bg-gray-200 px-2 py-1 rounded">
                              {profile.id.slice(0, 8)}...
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Username:</span>
                            <span className={`ml-2 ${profile.username ? 'text-green-600' : 'text-red-600'}`}>
                              {profile.username || '❌ Non défini'}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Full Name:</span>
                            <span className={`ml-2 ${profile.full_name ? 'text-green-600' : 'text-red-600'}`}>
                              {profile.full_name || '❌ Non défini'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium text-gray-700">Prénom:</span>
                            <span className={`ml-2 ${profile.first_name ? 'text-green-600' : 'text-red-600'}`}>
                              {profile.first_name || '❌ Non défini'}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Nom:</span>
                            <span className={`ml-2 ${profile.last_name ? 'text-green-600' : 'text-red-600'}`}>
                              {profile.last_name || '❌ Non défini'}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Email:</span>
                            <span className={`ml-2 ${profile.email ? 'text-green-600' : 'text-red-600'}`}>
                              {profile.email || '❌ Non défini'}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Avatar:</span>
                            <span className={`ml-2 ${profile.avatar_url ? 'text-green-600' : 'text-gray-600'}`}>
                              {profile.avatar_url ? '✅ Défini' : 'Non défini'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Vérification de cohérence */}
                      <div className="mt-3 pt-3 border-t border-gray-300">
                        <div className="text-xs">
                          <span className="font-medium text-gray-700">Vérification:</span>
                          {profile.full_name === `${profile.first_name} ${profile.last_name}` ? (
                            <span className="ml-2 text-green-600">✅ Full name cohérent</span>
                          ) : (
                            <span className="ml-2 text-red-600">
                              ❌ Incohérence: "{profile.full_name}" ≠ "{profile.first_name} {profile.last_name}"
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center">
              <a
                href="/dashboard"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                ← Retour au Dashboard
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
