'use client';

import React, { useState } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import AuthForm from '../components/auth/AuthForm';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  LoadingSpinner,
  Header,
  Sidebar,
  UserMenu,
  Breadcrumb,
  Modal,
  ConfirmModal,
  useModal
} from '../components/ui';

function LandingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const confirmModal = useModal();

  const navItems = [
    { label: 'Accueil', href: '#', active: true, icon: '🏠' },
    { label: 'Événements', href: '#events', icon: '📅' },
    { label: 'Communauté', href: '#community', icon: '💬' },
    { label: 'Marketplace', href: '#marketplace', icon: '🛒' },
  ];

  const userMenuItems = [
    { label: 'Mon Profil', href: '#profile', icon: '👤' },
    { label: 'Paramètres', href: '#settings', icon: '⚙️' },
    { label: 'Se déconnecter', onClick: () => confirmModal.open(), danger: true, icon: '🚪' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <Header
        logo={<span className="text-2xl font-bold text-primary-600">🎲 Gémou2</span>}
        navItems={navItems}
        userMenu={
          <UserMenu
            user={{
              name: 'Visiteur',
              email: 'guest@gemou2.com'
            }}
            menuItems={userMenuItems}
          />
        }
      />

      {/* Sidebar pour desktop */}
      <Sidebar
        navItems={navItems}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        className="hidden lg:block"
      />

      {/* Contenu principal */}
      <main className="lg:ml-64">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: 'Accueil' }
            ]}
            className="mb-8"
          />

          {/* Section Hero */}
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold text-gray-900 mb-6">
              Bienvenue sur <span className="text-primary-600">Gémou2</span> ! 🎲
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              L'application qui connecte les passionnés de jeux de société.
              Organisez des événements, rencontrez des joueurs et échangez vos jeux dans une communauté bienveillante.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" leftIcon="🚀">
                Commencer l'aventure
              </Button>
              <Button variant="outline" size="lg">
                En savoir plus
              </Button>
            </div>
          </div>

          {/* Section Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card hover className="text-center">
              <CardHeader>
                <div className="text-5xl mb-4">📅</div>
                <CardTitle>Événements</CardTitle>
                <CardDescription>
                  Créez et rejoignez des soirées jeux près de chez vous
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Organisez des événements, trouvez des partenaires de jeu et créez des souvenirs inoubliables.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Explorer les événements
                </Button>
              </CardFooter>
            </Card>

            <Card hover className="text-center">
              <CardHeader>
                <div className="text-5xl mb-4">💬</div>
                <CardTitle>Communauté</CardTitle>
                <CardDescription>
                  Échangez avec des passionnés et trouvez des partenaires de jeu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Rejoignez une communauté active de joueurs passionnés et partagez votre passion.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Rejoindre la communauté
                </Button>
              </CardFooter>
            </Card>

            <Card hover className="text-center">
              <CardHeader>
                <div className="text-5xl mb-4">🛒</div>
                <CardTitle>Marketplace</CardTitle>
                <CardDescription>
                  Vendez, achetez et échangez vos jeux de société
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Découvrez des trésors cachés et donnez une seconde vie à vos jeux préférés.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Explorer le marketplace
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Section Statistiques */}
          <Card className="mb-16">
            <CardHeader>
              <CardTitle className="text-center">Gémou2 en chiffres</CardTitle>
              <CardDescription className="text-center">
                Une communauté grandissante de passionnés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary-600 mb-2">2,500+</div>
                  <div className="text-gray-600">Joueurs actifs</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-secondary-600 mb-2">850+</div>
                  <div className="text-gray-600">Événements organisés</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent-600 mb-2">15,000+</div>
                  <div className="text-gray-600">Jeux en circulation</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-success-600 mb-2">98%</div>
                  <div className="text-gray-600">Satisfaction client</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section CTA */}
          <Card className="text-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white border-0">
            <CardContent className="py-12">
              <h2 className="text-3xl font-bold mb-4">
                Prêt à rejoindre l'aventure ?
              </h2>
              <p className="text-lg mb-8 opacity-90">
                Créez votre compte gratuitement et découvrez un monde de jeux passionnants.
              </p>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Créer mon compte
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Section Authentification */}
      <section id="auth-section" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Rejoignez Gémou2</CardTitle>
                <CardDescription className="text-center">
                  Connectez-vous ou créez votre compte pour commencer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AuthForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Modal de confirmation */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={confirmModal.close}
        onConfirm={() => {
          // Logique de déconnexion
          confirmModal.close();
        }}
        title="Confirmer la déconnexion"
        description="Êtes-vous sûr de vouloir vous déconnecter ?"
        confirmText="Se déconnecter"
        cancelText="Annuler"
      />
    </div>
  );
}

function Dashboard() {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const confirmModal = useModal();

  const navItems = [
    { label: 'Tableau de bord', href: '#', active: true, icon: '📊' },
    { label: 'Mes Événements', href: '#events', icon: '📅' },
    { label: 'Messages', href: '#messages', icon: '💬' },
    { label: 'Marketplace', href: '#marketplace', icon: '🛒' },
    { label: 'Profil', href: '#profile', icon: '👤' },
  ];

  const userMenuItems = [
    { label: 'Mon Profil', href: '#profile', icon: '👤' },
    { label: 'Paramètres', href: '#settings', icon: '⚙️' },
    { label: 'Se déconnecter', onClick: () => confirmModal.open(), danger: true, icon: '🚪' },
  ];

  const stats = [
    { title: 'Événements créés', value: '12', icon: '📅', color: 'text-primary-600' },
    { title: 'Participations', value: '28', icon: '🎯', color: 'text-secondary-600' },
    { title: 'Messages', value: '156', icon: '💬', color: 'text-accent-600' },
    { title: 'Jeux en vente', value: '5', icon: '🛒', color: 'text-success-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        logo={<span className="text-2xl font-bold text-primary-600">🎲 Gémou2</span>}
        navItems={navItems}
        userMenu={
          <UserMenu
            user={{
              name: user?.user_metadata?.full_name || 'Utilisateur',
              email: user?.email || '',
              avatar: user?.user_metadata?.avatar_url
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
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Tableau de bord' }
            ]}
            className="mb-8"
          />

          {/* Section de bienvenue */}
          <Card className="mb-8">
            <CardContent className="py-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Bonjour {user?.user_metadata?.full_name || user?.email} ! 🎲
                  </h1>
                  <p className="text-gray-600">
                    Bienvenue dans votre espace Gémou2. Voici un aperçu de votre activité.
                  </p>
                </div>
                <div className="hidden md:block">
                  <Button leftIcon="➕">
                    Créer un événement
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} hover>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`text-3xl ${stat.color}`}>
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Actions rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card hover>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">📅</div>
                <h3 className="text-lg font-semibold mb-2">Créer un événement</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Organisez une soirée jeux avec vos amis
                </p>
                <Button className="w-full">
                  Créer maintenant
                </Button>
              </CardContent>
            </Card>

            <Card hover>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold mb-2">Rechercher des jeux</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Trouvez de nouveaux jeux à découvrir
                </p>
                <Button variant="outline" className="w-full">
                  Explorer
                </Button>
              </CardContent>
            </Card>

            <Card hover>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-lg font-semibold mb-2">Contacter la communauté</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Discutez avec d'autres passionnés
                </p>
                <Button variant="outline" className="w-full">
                  Messages
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Événements récents */}
          <Card>
            <CardHeader>
              <CardTitle>Événements récents</CardTitle>
              <CardDescription>
                Vos dernières activités et participations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Soirée Catane</h4>
                    <p className="text-sm text-gray-600">Demain à 20h • Paris 15ème</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Voir détails
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Tournoi 7 Wonders</h4>
                    <p className="text-sm text-gray-600">Samedi 14h • Lyon</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Voir détails
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Voir tous mes événements
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>

      {/* Modal de confirmation */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={confirmModal.close}
        onConfirm={() => {
          signOut();
          confirmModal.close();
        }}
        title="Confirmer la déconnexion"
        description="Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à votre compte."
        confirmText="Se déconnecter"
        cancelText="Annuler"
      />
    </div>
  );
}

export default function Home() {
  const { user, loading, hasSeenOnboarding } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" className="mb-4" />
          <p className="text-gray-600 text-lg">Chargement de Gémou2...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Dashboard />;
  }

  // Si l'utilisateur n'a pas vu l'onboarding, rediriger vers la page d'onboarding
  if (!hasSeenOnboarding) {
    if (typeof window !== 'undefined') {
      window.location.href = '/onboarding';
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" className="mb-4" />
          <p className="text-gray-600 text-lg">Préparation de votre découverte...</p>
        </div>
      </div>
    );
  }

  return <LandingPage />;
}