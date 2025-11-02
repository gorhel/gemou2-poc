'use client';

import { useState, useEffect } from 'react';
import { createClientSupabaseClient } from '@/lib/supabase-client';

export default function TestSupabasePage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testSupabaseConnection();
  }, []);

  const testSupabaseConnection = async () => {
    const testResults = {
      userTagsExists: false,
      tagsExists: false,
      profilesExists: false,
      userTagsStructure: null,
      tagsCount: 0,
      profilesCount: 0,
      tags: [],
      profiles: [],
      errors: []
    };

    try {
      const supabase = createClientSupabaseClient();

      // 1. Test table user_tags
      const { data: userTagsTest, error: userTagsError } = await supabase
        .from('user_tags')
        .select('*')
        .limit(1);

      if (userTagsError) {
        testResults.errors.push(`user_tags: ${userTagsError.message}`);
      } else {
        testResults.userTagsExists = true;
        testResults.userTagsStructure = userTagsTest;
      }

      // 2. Test table tags
      const { data: tagsTest, error: tagsError } = await supabase
        .from('tags')
        .select('*');

      if (tagsError) {
        testResults.errors.push(`tags: ${tagsError.message}`);
      } else {
        testResults.tagsExists = true;
        testResults.tagsCount = tagsTest?.length || 0;
        testResults.tags = tagsTest || [];
      }

      // 3. Test table profiles
      const { data: profilesTest, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username')
        .limit(5);

      if (profilesError) {
        testResults.errors.push(`profiles: ${profilesError.message}`);
      } else {
        testResults.profilesExists = true;
        testResults.profilesCount = profilesTest?.length || 0;
        testResults.profiles = profilesTest || [];
      }

    } catch (error: any) {
      testResults.errors.push(`Erreur de connexion Supabase: ${error.message}`);
    }

    setResults(testResults);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Test de la connexion Supabase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">🔍 Test de la connexion Supabase</h1>
          
          <div className="space-y-6">
            {/* Status des tables */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg ${results.userTagsExists ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <h3 className="font-semibold text-lg">user_tags</h3>
                <p className={results.userTagsExists ? 'text-green-600' : 'text-red-600'}>
                  {results.userTagsExists ? '✅ Accessible' : '❌ Inaccessible'}
                </p>
              </div>
              
              <div className={`p-4 rounded-lg ${results.tagsExists ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <h3 className="font-semibold text-lg">tags</h3>
                <p className={results.tagsExists ? 'text-green-600' : 'text-red-600'}>
                  {results.tagsExists ? `✅ Accessible (${results.tagsCount})` : '❌ Inaccessible'}
                </p>
              </div>
              
              <div className={`p-4 rounded-lg ${results.profilesExists ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <h3 className="font-semibold text-lg">profiles</h3>
                <p className={results.profilesExists ? 'text-green-600' : 'text-red-600'}>
                  {results.profilesExists ? `✅ Accessible (${results.profilesCount})` : '❌ Inaccessible'}
                </p>
              </div>
            </div>

            {/* Erreurs */}
            {results.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">❌ Erreurs détectées :</h3>
                <ul className="list-disc list-inside space-y-1">
                  {results.errors.map((error, index) => (
                    <li key={index} className="text-red-700 text-sm font-mono">{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tags disponibles */}
            {results.tags.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">🏷️ Tags disponibles :</h3>
                <div className="flex flex-wrap gap-2">
                  {results.tags.map((tag: any) => (
                    <span key={tag.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Profils disponibles */}
            {results.profiles.length > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-800 mb-2">👤 Profils disponibles :</h3>
                <div className="space-y-1">
                  {results.profiles.map((profile: any) => (
                    <div key={profile.id} className="text-purple-700 text-sm">
                      • {profile.username} (ID: {profile.id.slice(0, 8)}...)
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Structure user_tags */}
            {results.userTagsStructure && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">📊 Structure user_tags :</h3>
                <pre className="text-sm bg-white p-3 rounded border overflow-auto">
                  {JSON.stringify(results.userTagsStructure, null, 2)}
                </pre>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-4">
              <button
                onClick={testSupabaseConnection}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                🔄 Retester
              </button>
              <a
                href="/dashboard"
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                ← Retour au Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}