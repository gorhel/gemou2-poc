'use client';

import { useState } from 'react';
import { createClientSupabaseClient } from '@/lib/supabase-client';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function AdminCreateEventPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const createEvent = async () => {
    setLoading(true);
    setResult('');

    try {
      const supabase = createClientSupabaseClient();

      const eventData = {
        title: 'Soirée Jeux de Société - Janvier 2025',
        description: 'Rejoignez-nous pour une soirée conviviale autour des jeux de société ! Nous aurons une sélection de jeux pour tous les niveaux : de Catan aux jeux d\'ambiance. Apportez vos jeux préférés et venez passer un moment agréable entre passionnés.',
        date_time: '2025-01-15T19:00:00.000Z',
        location: 'Café des Jeux, 123 Rue de la Paix, Paris 75001',
        max_participants: 12,
        current_participants: 0,
        status: 'active',
        image_url: null
      };

      console.log('🔄 Création de l\'événement...', eventData);

      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select();

      if (error) {
        console.error('❌ Erreur:', error);
        setResult(`❌ Erreur: ${error.message}`);
      } else {
        console.log('✅ Événement créé:', data[0]);
        setResult(`✅ Événement créé avec succès !
        
🆔 ID: ${data[0].id}
📝 Titre: ${data[0].title}
📅 Date: ${new Date(data[0].date_time).toLocaleString('fr-FR')}
📍 Lieu: ${data[0].location}
👥 Participants max: ${data[0].max_participants}
🔗 Lien: http://localhost:3000/events/${data[0].id}`);
      }
    } catch (err) {
      console.error('💥 Erreur inattendue:', err);
      setResult(`💥 Erreur inattendue: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">🎲 Création d'événement - Janvier 2025</CardTitle>
            <p className="text-gray-600">Interface d'administration pour créer un événement</p>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
              <h3 className="font-bold text-lg mb-4 text-gray-800">📋 Détails de l'événement :</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Titre :</span>
                  <p className="text-gray-900">Soirée Jeux de Société - Janvier 2025</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Date :</span>
                  <p className="text-gray-900">15 janvier 2025 à 20h</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Lieu :</span>
                  <p className="text-gray-900">Café des Jeux, Paris 75001</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Participants max :</span>
                  <p className="text-gray-900">12 personnes</p>
                </div>
                <div className="md:col-span-2">
                  <span className="font-semibold text-gray-700">Description :</span>
                  <p className="text-gray-900">Soirée conviviale autour des jeux de société avec une sélection de jeux pour tous les niveaux</p>
                </div>
              </div>
            </div>

            <Button 
              onClick={createEvent} 
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Création en cours...
                </span>
              ) : (
                '🎯 Créer l\'événement'
              )}
            </Button>

            {result && (
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h4 className="font-semibold mb-3 text-gray-800">📊 Résultat :</h4>
                <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded border font-mono">{result}</pre>
              </div>
            )}

            <div className="text-center">
              <a 
                href="/dashboard" 
                className="text-blue-600 hover:text-blue-800 underline"
              >
                ← Retour au dashboard
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
