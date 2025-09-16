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
  LoadingPage,
  LoadingCard,
  Skeleton,
  SkeletonCard,
  Header,
  Sidebar,
  Breadcrumb,
  UserMenu,
  Modal,
  ConfirmModal,
  useModal,
  Table,
  TableCard
} from '../../components/ui';

export default function StyleGuide() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [loading, setLoading] = useState(false);
  const modal = useModal();
  const confirmModal = useModal();

  const navItems = [
    { label: 'Accueil', href: '#', active: true, icon: '🏠' },
    { label: 'Guide de style', href: '#style-guide', icon: '📖' },
    { label: 'Composants', href: '#components', icon: '🧩' },
  ];

  const userMenuItems = [
    { label: 'Mon Profil', href: '#profile', icon: '👤' },
    { label: 'Paramètres', href: '#settings', icon: '⚙️' },
    { label: 'Se déconnecter', onClick: () => confirmModal.open(), danger: true, icon: '🚪' },
  ];

  // Données d'exemple pour les tableaux
  const tableData = [
    { id: 1, name: 'Alice Dupont', email: 'alice@example.com', role: 'Admin', status: 'Actif' },
    { id: 2, name: 'Bob Martin', email: 'bob@example.com', role: 'Utilisateur', status: 'Actif' },
    { id: 3, name: 'Claire Bernard', email: 'claire@example.com', role: 'Modérateur', status: 'Inactif' },
    { id: 4, name: 'David Petit', email: 'david@example.com', role: 'Utilisateur', status: 'Actif' },
  ];

  const tableColumns = [
    { key: 'name', header: 'Nom', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'role', header: 'Rôle' },
    {
      key: 'status',
      header: 'Statut',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Actif'
            ? 'bg-success-100 text-success-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    },
  ];

  const handleButtonClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        logo={<span className="text-2xl font-bold text-primary-600">🎨 Guide de Style</span>}
        navItems={navItems}
        userMenu={
          <UserMenu
            user={{
              name: 'Développeur',
              email: 'dev@gemou2.com'
            }}
            menuItems={userMenuItems}
          />
        }
      />

      {/* Sidebar */}
      <Sidebar
        navItems={navItems}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Contenu principal */}
      <main className="lg:ml-64">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Guide de style' }
            ]}
            className="mb-8"
          />

          {/* Section Introduction */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-3xl">🎨 Guide de Style - Gémou2</CardTitle>
              <CardDescription className="text-lg">
                Bibliothèque complète de composants UI utilisant Tailwind CSS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-4xl mb-2">🎯</div>
                  <h3 className="font-semibold mb-1">Design System</h3>
                  <p className="text-sm text-gray-600">Palette de couleurs cohérente et composants réutilisables</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">📱</div>
                  <h3 className="font-semibold mb-1">Responsive</h3>
                  <p className="text-sm text-gray-600">Interface adaptée à tous les appareils</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">♿</div>
                  <h3 className="font-semibold mb-1">Accessibilité</h3>
                  <p className="text-sm text-gray-600">Conforme aux standards WCAG 2.1</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section Palette de Couleurs */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🎨 Palette de Couleurs</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {/* Couleurs primaires */}
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="w-full h-16 bg-primary-500 rounded-lg mb-3"></div>
                  <p className="font-medium text-sm">Primary</p>
                  <p className="text-xs text-gray-500">primary-500</p>
                  <p className="text-xs text-gray-400 mt-1">#3b82f6</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="w-full h-16 bg-secondary-500 rounded-lg mb-3"></div>
                  <p className="font-medium text-sm">Secondary</p>
                  <p className="text-xs text-gray-500">secondary-500</p>
                  <p className="text-xs text-gray-400 mt-1">#a855f7</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="w-full h-16 bg-accent-500 rounded-lg mb-3"></div>
                  <p className="font-medium text-sm">Accent</p>
                  <p className="text-xs text-gray-500">accent-500</p>
                  <p className="text-xs text-gray-400 mt-1">#22c55e</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="w-full h-16 bg-success-500 rounded-lg mb-3"></div>
                  <p className="font-medium text-sm">Success</p>
                  <p className="text-xs text-gray-500">success-500</p>
                  <p className="text-xs text-gray-400 mt-1">#22c55e</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="w-full h-16 bg-warning-500 rounded-lg mb-3"></div>
                  <p className="font-medium text-sm">Warning</p>
                  <p className="text-xs text-gray-500">warning-500</p>
                  <p className="text-xs text-gray-400 mt-1">#f59e0b</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="w-full h-16 bg-error-500 rounded-lg mb-3"></div>
                  <p className="font-medium text-sm">Error</p>
                  <p className="text-xs text-gray-500">error-500</p>
                  <p className="text-xs text-gray-400 mt-1">#ef4444</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section Boutons */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🔘 Composant Button</h2>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Variantes de Boutons</CardTitle>
                <CardDescription>
                  Différentes variantes pour s'adapter à tous les contextes d'utilisation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <Button variant="default">Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="success">Success</Button>
                  <Button variant="warning">Warning</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Button size="sm">Small Button</Button>
                  <Button size="default">Default Button</Button>
                  <Button size="lg">Large Button</Button>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Button leftIcon="🚀">Avec icône gauche</Button>
                  <Button rightIcon="→">Avec icône droite</Button>
                  <Button fullWidth className="max-w-xs">Bouton pleine largeur</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>États de Chargement</CardTitle>
                <CardDescription>
                  Gestion des états de chargement avec spinners intégrés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button
                    loading={loading}
                    onClick={handleButtonClick}
                    leftIcon="⚡"
                  >
                    {loading ? 'Chargement...' : 'Action avec loading'}
                  </Button>
                  <Button variant="outline" loading>
                    Bouton en chargement
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Section Cartes */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Composant Card</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Carte Simple</CardTitle>
                  <CardDescription>
                    Structure de base avec en-tête, contenu et pied de page
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Contenu de la carte avec du texte descriptif.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Action</Button>
                </CardFooter>
              </Card>

              <Card shadow="large" hover>
                <CardHeader>
                  <CardTitle>Carte Interactive</CardTitle>
                  <CardDescription>
                    Avec effets de survol et ombre accentuée
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Cette carte réagit au survol de la souris.
                  </p>
                </CardContent>
              </Card>

              <Card border padding="lg">
                <CardHeader>
                  <CardTitle>Carte avec Bordure</CardTitle>
                  <CardDescription>
                    Avec bordure et padding personnalisé
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📝 Composants de Formulaire</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Champs de Saisie</CardTitle>
                  <CardDescription>
                    Input et Textarea avec validation et états d'erreur
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label="Nom complet"
                    placeholder="Entrez votre nom"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    leftIcon="👤"
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
                    Différentes tailles pour s'adapter aux contextes
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">⏳ États de Chargement</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

            <Card>
              <CardHeader>
                <CardTitle>Page de Chargement</CardTitle>
                <CardDescription>
                  Utilisez LoadingPage pour les chargements de page complets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={modal.open}>
                  Voir l'exemple de page de chargement
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* Section Navigation */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🧭 Composants de Navigation</h2>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Fil d'Ariane (Breadcrumb)</CardTitle>
                <CardDescription>
                  Navigation hiérarchique pour indiquer la position actuelle
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Breadcrumb
                  items={[
                    { label: 'Accueil', href: '/' },
                    { label: 'Guide de style', href: '/style-guide' },
                    { label: 'Composants' }
                  ]}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Menu Utilisateur</CardTitle>
                <CardDescription>
                  Dropdown menu avec avatar et actions utilisateur
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <UserMenu
                    user={{
                      name: 'Jean Dupont',
                      email: 'jean@example.com',
                      avatar: undefined
                    }}
                    menuItems={[
                      { label: 'Mon Profil', href: '#profile', icon: '👤' },
                      { label: 'Paramètres', href: '#settings', icon: '⚙️' },
                      { label: 'Se déconnecter', onClick: () => {}, danger: true, icon: '🚪' },
                    ]}
                  />
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Section Modales */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📱 Modales et Overlays</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Modale Simple</CardTitle>
                  <CardDescription>
                    Fenêtre modale avec contenu personnalisable
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={modal.open}>
                    Ouvrir une modale
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Modale de Confirmation</CardTitle>
                  <CardDescription>
                    Pour les actions nécessitant une confirmation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive" onClick={confirmModal.open}>
                    Supprimer un élément
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section Tableaux */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Tableaux Responsives</h2>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Tableau Desktop</CardTitle>
                <CardDescription>
                  Tableau traditionnel avec tri et sélection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table
                  data={tableData}
                  columns={tableColumns}
                  selectable
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tableau Mobile (Cards)</CardTitle>
                <CardDescription>
                  Version adaptée mobile avec layout en cartes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TableCard
                  data={tableData}
                  columns={tableColumns}
                  titleKey="name"
                  subtitleKey="email"
                />
              </CardContent>
            </Card>
          </section>

          {/* Section Breakpoints */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📐 Breakpoints Responsives</h2>

            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  <div className="bg-primary-100 p-4 rounded text-center border-2 border-primary-200">
                    <span className="block font-bold text-primary-800">xs</span>
                    <span className="text-sm text-primary-600">475px+</span>
                  </div>
                  <div className="bg-secondary-100 p-4 rounded text-center border-2 border-secondary-200">
                    <span className="block font-bold text-secondary-800">sm</span>
                    <span className="text-sm text-secondary-600">640px+</span>
                  </div>
                  <div className="bg-accent-100 p-4 rounded text-center border-2 border-accent-200">
                    <span className="block font-bold text-accent-800">md</span>
                    <span className="text-sm text-accent-600">768px+</span>
                  </div>
                  <div className="bg-success-100 p-4 rounded text-center border-2 border-success-200">
                    <span className="block font-bold text-success-800">lg</span>
                    <span className="text-sm text-success-600">1024px+</span>
                  </div>
                  <div className="bg-warning-100 p-4 rounded text-center border-2 border-warning-200">
                    <span className="block font-bold text-warning-800">xl</span>
                    <span className="text-sm text-warning-600">1280px+</span>
                  </div>
                  <div className="bg-error-100 p-4 rounded text-center border-2 border-error-200">
                    <span className="block font-bold text-error-800">2xl</span>
                    <span className="text-sm text-error-600">1536px+</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Section Documentation */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📚 Documentation et Utilisation</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Installation</CardTitle>
                  <CardDescription>
                    Comment intégrer les composants dans votre projet
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`import { Button, Card, Input } from '@/components/ui';

// Utilisation simple
<Button variant="primary">Cliquez-moi</Button>

// Avec toutes les options
<Button
  variant="success"
  size="lg"
  loading={isLoading}
  leftIcon="🚀"
  onClick={handleClick}
>
  Action complexe
</Button>`}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bonnes Pratiques</CardTitle>
                  <CardDescription>
                    Recommandations pour une utilisation optimale
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 mt-1">✅</span>
                    <div>
                      <p className="font-medium">Utilisez la palette de couleurs</p>
                      <p className="text-sm text-gray-600">Respectez les couleurs définies pour la cohérence</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 mt-1">✅</span>
                    <div>
                      <p className="font-medium">Mobile-first</p>
                      <p className="text-sm text-gray-600">Concevez d'abord pour mobile, puis desktop</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-red-500 mt-1">❌</span>
                    <div>
                      <p className="font-medium">Évitez les styles inline</p>
                      <p className="text-sm text-gray-600">Utilisez les classes Tailwind prédéfinies</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </main>

      {/* Modales */}
      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title="Exemple de Page de Chargement"
        size="lg"
      >
        <div className="text-center py-8">
          <LoadingSpinner size="xl" className="mb-4" />
          <h3 className="text-lg font-semibold mb-2">Chargement en cours...</h3>
          <p className="text-gray-600">
            Cette modale montre comment utiliser le composant LoadingPage
            pour les chargements de contenu importants.
          </p>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={confirmModal.close}
        onConfirm={() => {
          alert('Action confirmée !');
          confirmModal.close();
        }}
        title="Confirmer l'action"
        description="Êtes-vous sûr de vouloir effectuer cette action ? Cette action est irréversible."
        confirmText="Confirmer"
        cancelText="Annuler"
      />
    </div>
  );
}