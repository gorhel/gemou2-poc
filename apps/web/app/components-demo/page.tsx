'use client';

import React, { useState } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Textarea,
  LoadingSpinner,
  LoadingCard,
  SkeletonCard,
  SkeletonTable
} from '../../components/ui';

export default function ComponentsDemo() {
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleButtonClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bibliothèque de Composants UI - Gemou2
          </h1>
          <p className="text-lg text-gray-600">
            Démonstration de tous les composants Tailwind CSS créés pour l'application
          </p>
        </div>

        {/* Section Boutons */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Boutons</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="success">Success</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button size="sm">Small Button</Button>
            <Button size="default">Default Button</Button>
            <Button size="lg">Large Button</Button>
          </div>

          <div className="mt-6">
            <Button
              loading={loading}
              onClick={handleButtonClick}
              leftIcon={<span>🚀</span>}
            >
              {loading ? 'Chargement...' : 'Bouton avec icône'}
            </Button>
          </div>
        </section>

        {/* Section Cartes */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Cartes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Carte Simple</CardTitle>
                <CardDescription>
                  Une carte basique avec en-tête, contenu et pied de page.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Ceci est le contenu principal de la carte. Il peut contenir du texte,
                  des images, ou tout autre élément.
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm">Action</Button>
              </CardFooter>
            </Card>

            <Card shadow="large" hover>
              <CardHeader>
                <CardTitle>Carte avec Hover</CardTitle>
                <CardDescription>
                  Cette carte a un effet de survol et une ombre plus prononcée.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  L'effet hover améliore l'interactivité utilisateur.
                </p>
              </CardContent>
            </Card>

            <Card border padding="lg">
              <CardHeader>
                <CardTitle>Carte avec Bordure</CardTitle>
                <CardDescription>
                  Cette carte a une bordure et un padding plus important.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 p-4 rounded">
                  <p className="text-sm text-gray-600">
                    Zone de contenu mise en évidence
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section Formulaires */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Champs de Formulaire</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Champs de Saisie</CardTitle>
                <CardDescription>
                  Différents types de champs de formulaire avec validation.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Nom complet"
                  placeholder="Entrez votre nom"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  leftIcon={<span>👤</span>}
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="votre@email.com"
                  helperText="Nous ne partagerons jamais votre email"
                />

                <Input
                  label="Mot de passe"
                  type="password"
                  placeholder="••••••••"
                  error="Le mot de passe doit contenir au moins 8 caractères"
                />

                <Textarea
                  label="Message"
                  placeholder="Votre message ici..."
                  rows={4}
                  value={textareaValue}
                  onChange={(e) => setTextareaValue(e.target.value)}
                  helperText="Maximum 500 caractères"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tailles de Champs</CardTitle>
                <CardDescription>
                  Différentes tailles pour s'adapter à tous les contextes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input size="sm" placeholder="Petit champ" />
                <Input size="md" placeholder="Champ normal" />
                <Input size="lg" placeholder="Grand champ" />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section États de Chargement */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">États de Chargement</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Spinner</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <LoadingSpinner size="lg" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">Avec Texte</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <LoadingSpinner size="md" text="Chargement..." />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">Carte de Chargement</CardTitle>
              </CardHeader>
              <CardContent>
                <LoadingCard text="Chargement des données..." />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">Squelettes</CardTitle>
              </CardHeader>
              <CardContent>
                <SkeletonCard />
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Table avec Squelettes</CardTitle>
                <CardDescription>
                  Simulation de chargement d'un tableau de données.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SkeletonTable rows={4} columns={5} />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section Palette de Couleurs */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Palette de Couleurs</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Couleurs primaires */}
            <div className="text-center">
              <div className="w-full h-16 bg-primary-500 rounded-lg mb-2"></div>
              <p className="text-sm font-medium">Primary</p>
              <p className="text-xs text-gray-500">primary-500</p>
            </div>

            <div className="text-center">
              <div className="w-full h-16 bg-secondary-500 rounded-lg mb-2"></div>
              <p className="text-sm font-medium">Secondary</p>
              <p className="text-xs text-gray-500">secondary-500</p>
            </div>

            <div className="text-center">
              <div className="w-full h-16 bg-accent-500 rounded-lg mb-2"></div>
              <p className="text-sm font-medium">Accent</p>
              <p className="text-xs text-gray-500">accent-500</p>
            </div>

            <div className="text-center">
              <div className="w-full h-16 bg-success-500 rounded-lg mb-2"></div>
              <p className="text-sm font-medium">Success</p>
              <p className="text-xs text-gray-500">success-500</p>
            </div>

            <div className="text-center">
              <div className="w-full h-16 bg-warning-500 rounded-lg mb-2"></div>
              <p className="text-sm font-medium">Warning</p>
              <p className="text-xs text-gray-500">warning-500</p>
            </div>

            <div className="text-center">
              <div className="w-full h-16 bg-error-500 rounded-lg mb-2"></div>
              <p className="text-sm font-medium">Error</p>
              <p className="text-xs text-gray-500">error-500</p>
            </div>
          </div>
        </section>

        {/* Section Breakpoints */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Breakpoints Responsives</h2>
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                <div className="bg-blue-100 p-4 rounded text-center">
                  <span className="block font-bold">xs</span>
                  <span className="text-sm">475px+</span>
                </div>
                <div className="bg-blue-200 p-4 rounded text-center">
                  <span className="block font-bold">sm</span>
                  <span className="text-sm">640px+</span>
                </div>
                <div className="bg-blue-300 p-4 rounded text-center">
                  <span className="block font-bold">md</span>
                  <span className="text-sm">768px+</span>
                </div>
                <div className="bg-blue-400 p-4 rounded text-center">
                  <span className="block font-bold">lg</span>
                  <span className="text-sm">1024px+</span>
                </div>
                <div className="bg-blue-500 p-4 rounded text-center">
                  <span className="block font-bold">xl</span>
                  <span className="text-sm">1280px+</span>
                </div>
                <div className="bg-blue-600 p-4 rounded text-center text-white">
                  <span className="block font-bold">2xl</span>
                  <span className="text-sm">1536px+</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}