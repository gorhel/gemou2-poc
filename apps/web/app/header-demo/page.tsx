'use client';

import React, { useState } from 'react';
import ResponsiveHeader from '@/components/ui/ResponsiveHeader';

export default function HeaderDemoPage() {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleShare = () => {
    alert('Fonctionnalité de partage - À implémenter');
  };

  const handleSettings = () => {
    alert('Fonctionnalité de paramètres - À implémenter');
  };

  const handleBack = () => {
    alert('Retour - À implémenter');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ResponsiveHeader
        title="Soirée Jeux de Société - Janvier 2025"
        onBack={handleBack}
        isFavorite={isFavorite}
        onToggleFavorite={handleToggleFavorite}
        onShare={handleShare}
        onSettings={handleSettings}
        homeUrl="/dashboard"
        profileUrl="/profile"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Démonstration du Header Responsive
            </h1>
            
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-blue-800 mb-4">
                  Version Mobile (moins de 768px)
                </h2>
                <ul className="space-y-2 text-blue-700">
                  <li>Hauteur : 56px (h-14)</li>
                  <li>Layout : Flexbox horizontal, space-between</li>
                  <li>Gauche : Bouton retour (flèche)</li>
                  <li>Centre : Titre tronqué si plus de 20 caractères</li>
                  <li>Droite : 3 icônes (Favoris, Partager, Paramètres)</li>
                  <li>Icônes : 24x24px avec padding 8px</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-green-800 mb-4">
                  Version Desktop (plus de 768px)
                </h2>
                <ul className="space-y-2 text-green-700">
                  <li>Hauteur : 64px (h-16)</li>
                  <li>Layout : Flexbox horizontal, space-between</li>
                  <li>Gauche : Logo Gémou2 + Titre complet</li>
                  <li>Droite : Boutons avec labels (Favoris, Partager, Mon compte)</li>
                  <li>Pas de bouton retour</li>
                  <li>Espacement : Plus généreux entre les éléments</li>
                </ul>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-purple-800 mb-4">
                  Fonctionnalités
                </h2>
                <ul className="space-y-2 text-purple-700">
                  <li>Sticky : Reste en haut lors du scroll (sticky top-0)</li>
                  <li>Z-index élevé : z-50 pour passer au-dessus du contenu</li>
                  <li>Transitions : Animations douces au hover</li>
                  <li>Accessibilité : Labels ARIA et navigation clavier</li>
                  <li>Thème : Couleurs cohérentes avec l'application</li>
                  <li>Responsive : Changement automatique au breakpoint 768px</li>
                </ul>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  État actuel des actions
                </h2>
                <div className="space-y-2 text-gray-700">
                  <div>Favoris : {isFavorite ? 'Actif (cœur rouge)' : 'Inactif (cœur gris)'}</div>
                  <div>Partage : Affiche une alerte</div>
                  <div>Paramètres : Affiche une alerte</div>
                  <div>Retour : Affiche une alerte</div>
                  <div>Logo/Accueil : Redirige vers /dashboard</div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <a
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retour au Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}