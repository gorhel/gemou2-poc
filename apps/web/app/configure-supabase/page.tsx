'use client';

import { useState } from 'react';

export default function ConfigureSupabasePage() {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [instructions, setInstructions] = useState('');

  const generateEnvFile = () => {
    const envContent = `# Supabase Cloud Configuration
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseKey}

# Note: Remplacez les valeurs ci-dessus par vos vraies clés Supabase Cloud
# Vous pouvez les trouver dans votre dashboard Supabase > Settings > API`;

    const blob = new Blob([envContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.env.local';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setInstructions(`✅ Fichier .env.local généré !
    
📁 Placez ce fichier dans : /Users/essykouame/Downloads/gemou2-poc/apps/web/.env.local

🔄 Redémarrez le serveur Next.js après avoir placé le fichier.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
            ⚙️ Configuration Supabase Cloud
          </h1>
          
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">📋 Étapes pour obtenir vos clés Supabase :</h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-700 text-sm">
                <li>Connectez-vous à <a href="https://supabase.com" target="_blank" className="underline">supabase.com</a></li>
                <li>Allez dans votre projet (ou créez-en un nouveau)</li>
                <li>Cliquez sur <strong>Settings</strong> dans la sidebar</li>
                <li>Cliquez sur <strong>API</strong></li>
                <li>Copiez <strong>Project URL</strong> et <strong>anon public key</strong></li>
              </ol>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🌐 Supabase URL
                </label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://your-project-ref.supabase.co"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🔑 Supabase Anon Key
                </label>
                <textarea
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              onClick={generateEnvFile}
              disabled={!supabaseUrl || !supabaseKey}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              📥 Générer le fichier .env.local
            </button>

            {instructions && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-sm text-green-800">{instructions}</pre>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Important :</h3>
              <ul className="list-disc list-inside space-y-1 text-yellow-700 text-sm">
                <li>Gardez vos clés privées et ne les commitez jamais dans Git</li>
                <li>Le fichier .env.local est automatiquement ignoré par Git</li>
                <li>Redémarrez le serveur après avoir configuré les variables</li>
              </ul>
            </div>

            <div className="text-center">
              <a
                href="/test-supabase"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                → Tester la connexion Supabase
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



