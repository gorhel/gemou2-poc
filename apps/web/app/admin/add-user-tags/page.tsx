'use client';

import { useState } from 'react';
import { createClientSupabaseClient } from '@/lib/supabase-client';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { SmallPill } from '@/components/ui';

export default function AddUserTagsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [availableTags, setAvailableTags] = useState<any[]>([]);

  const supabase = createClientSupabaseClient();

  const fetchAvailableTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name');

      if (error) {
        console.error('Erreur récupération tags:', error);
      } else {
        setAvailableTags(data || []);
      }
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const addSampleUserTags = async () => {
    setLoading(true);
    setResult('');

    try {
      // Récupérer les tags disponibles
      await fetchAvailableTags();

      if (availableTags.length === 0) {
        setResult('❌ Aucun tag disponible. Veuillez d\'abord créer des tags.');
        return;
      }

      // Utiliser le premier utilisateur trouvé (pour les tests)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username')
        .limit(1);

      if (!profiles || profiles.length === 0) {
        setResult('❌ Aucun utilisateur trouvé dans la base de données.');
        return;
      }

      const testUser = profiles[0];
      
      // Ajouter quelques tags aléatoires à cet utilisateur
      const tagsToAdd = availableTags.slice(0, 5); // Prendre les 5 premiers tags
      
      const insertData = tagsToAdd.map(tag => ({
        user_id: testUser.id,
        tag_id: tag.id
      }));

      const { error } = await supabase
        .from('user_tags')
        .insert(insertData);

      if (error) {
        console.error('Erreur ajout tags:', error);
        setResult(`❌ Erreur: ${error.message}`);
      } else {
        setResult(`✅ Tags ajoutés avec succès à l'utilisateur ${testUser.username} !
        
🏷️ Tags ajoutés:
${tagsToAdd.map(tag => `• ${tag.name}`).join('\n')}

🔗 Voir le profil: http://localhost:3001/profile/${testUser.username}`);
      }
    } catch (err) {
      console.error('Erreur inattendue:', err);
      setResult(`💥 Erreur inattendue: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const showAvailableTags = async () => {
    await fetchAvailableTags();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">🏷️ Gestion des tags utilisateur</CardTitle>
            <p className="text-gray-600">Ajouter des tags de test pour les préférences</p>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
              <h3 className="font-bold text-lg mb-4 text-gray-800">📋 Actions disponibles :</h3>
              <ul className="text-sm space-y-2">
                <li>• <strong>Voir les tags disponibles</strong> - Affiche tous les tags de la base</li>
                <li>• <strong>Ajouter des tags de test</strong> - Ajoute 5 tags au premier utilisateur</li>
                <li>• <strong>Tester l'affichage</strong> - Voir les préférences sur le profil</li>
              </ul>
            </div>

            <div className="flex space-x-4">
              <Button 
                onClick={showAvailableTags}
                className="flex-1"
              >
                📋 Voir les tags disponibles
              </Button>
              <Button 
                onClick={addSampleUserTags} 
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? 'Ajout...' : '🎯 Ajouter des tags de test'}
              </Button>
            </div>

            {availableTags.length > 0 && (
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-semibold mb-3">🏷️ Tags disponibles :</h4>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <SmallPill key={tag.id}>
                      {tag.name}
                    </SmallPill>
                  ))}
                </div>
              </div>
            )}

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


