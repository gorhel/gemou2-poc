'use client';

import { useEffect } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '../components/ui';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log l'erreur pour le debugging
    console.error('Erreur dans l\'application:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="text-8xl mb-4">⚠️</div>
          <CardTitle className="text-4xl font-bold text-gray-900 mb-2">
            Oups ! Une erreur est survenue
          </CardTitle>
          <p className="text-xl text-gray-600 mb-4">
            Quelque chose s'est mal passé
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 mb-6">
            Ne vous inquiétez pas, ce n'est probablement pas de votre faute.
            Essayons de corriger cela.
          </p>

          <div className="space-y-3">
            <Button onClick={reset} fullWidth size="lg" leftIcon="🔄">
              Réessayer
            </Button>

            <Button
              variant="outline"
              fullWidth
              onClick={() => window.location.href = '/'}
              leftIcon="🏠"
            >
              Retour à l'accueil
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <details className="text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
                Détails techniques (pour les développeurs)
              </summary>
              <div className="bg-gray-100 p-3 rounded text-xs font-mono text-gray-800 overflow-x-auto">
                <div className="mb-2">
                  <strong>Erreur:</strong> {error.message}
                </div>
                {error.digest && (
                  <div className="mb-2">
                    <strong>Digest:</strong> {error.digest}
                  </div>
                )}
                <div>
                  <strong>Stack:</strong>
                  <pre className="mt-1 whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                </div>
              </div>
            </details>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}