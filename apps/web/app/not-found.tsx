import Link from 'next/link';
import { Button, Card, CardContent, CardHeader, CardTitle } from '../components/ui';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="text-8xl mb-4">😵</div>
          <CardTitle className="text-4xl font-bold text-gray-900 mb-2">
            404
          </CardTitle>
          <p className="text-xl text-gray-600 mb-4">
            Oups ! Cette page n'existe pas
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 mb-6">
            Il semble que la page que vous cherchez ait disparu ou n'ait jamais existé.
            Pas de panique, retournons à un endroit plus sûr !
          </p>

          <div className="space-y-3">
            <Link href="/" className="block">
              <Button fullWidth size="lg" leftIcon="🏠">
                Retour à l'accueil
              </Button>
            </Link>

            <Link href="/style-guide" className="block">
              <Button variant="outline" fullWidth leftIcon="📖">
                Consulter le guide de style
              </Button>
            </Link>

            <Link href="/components-demo" className="block">
              <Button variant="outline" fullWidth leftIcon="🧩">
                Voir les composants
              </Button>
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">
              Vous pouvez aussi :
            </p>
            <div className="flex justify-center space-x-4 text-sm">
              <button
                onClick={() => window.history.back()}
                className="text-primary-600 hover:text-primary-800 underline"
              >
                ← Retour en arrière
              </button>
              <span className="text-gray-400">•</span>
              <Link
                href="/contact"
                className="text-primary-600 hover:text-primary-800 underline"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}