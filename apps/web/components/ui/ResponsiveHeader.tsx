'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export interface ResponsiveHeaderProps {
  /** Titre principal à afficher */
  title: string;
  /** Fonction appelée quand on clique sur le bouton retour (mobile uniquement) */
  onBack?: () => void;
  /** URL pour le lien d'accueil (desktop) */
  homeUrl?: string;
  /** État des favoris */
  isFavorite?: boolean;
  /** Fonction appelée quand on clique sur favoris */
  onToggleFavorite?: () => void;
  /** Fonction appelée quand on clique sur partager */
  onShare?: () => void;
  /** Fonction appelée quand on clique sur paramètres */
  onSettings?: () => void;
  /** URL du profil utilisateur pour le lien "Mon compte" */
  profileUrl?: string;
  /** Classe CSS supplémentaire */
  className?: string;
}

export default function ResponsiveHeader({
  title,
  onBack,
  homeUrl = '/dashboard',
  isFavorite = false,
  onToggleFavorite,
  onShare,
  onSettings,
  profileUrl = '/profile',
  className = ''
}: ResponsiveHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleHome = () => {
    router.push(homeUrl);
  };

  const handleFavorite = () => {
    if (onToggleFavorite) {
      onToggleFavorite();
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    }
  };

  const handleSettings = () => {
    if (onSettings) {
      onSettings();
    } else {
      router.push(profileUrl);
    }
  };

  // Tronquer le titre sur mobile s'il est trop long
  const getTruncatedTitle = (text: string) => {
    if (text.length > 20) {
      return text.substring(0, 17) + '...';
    }
    return text;
  };

  return (
    <header className={`sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200 ${className}`}>
      {/* Mobile Layout (< 768px) */}
      <div className="md:hidden h-14 px-4 flex items-center justify-between">
        {/* Bouton retour */}
        <button
          onClick={handleBack}
          className="flex items-center justify-center w-10 h-10 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          aria-label="Retour"
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Titre centré (tronqué) */}
        <h1 className="flex-1 text-center text-lg font-semibold text-gray-900 px-4 truncate">
          {getTruncatedTitle(title)}
        </h1>

        {/* Actions à droite */}
        <div className="flex items-center space-x-1">
          {/* Favoris */}
          <button
            onClick={handleFavorite}
            className="flex items-center justify-center w-10 h-10 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            aria-label="Ajouter aux favoris"
          >
            <span className={`text-xl ${isFavorite ? 'text-red-500' : 'text-gray-500'}`}>
              ❤️
            </span>
          </button>

          {/* Partager */}
          <button
            onClick={handleShare}
            className="flex items-center justify-center w-10 h-10 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            aria-label="Partager"
          >
            <svg
              className="w-5 h-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
              />
            </svg>
          </button>

          {/* Paramètres */}
          <button
            onClick={handleSettings}
            className="flex items-center justify-center w-10 h-10 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            aria-label="Paramètres"
          >
            <svg
              className="w-5 h-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Desktop Layout (≥ 768px) */}
      <div className="hidden md:flex h-16 px-6 items-center justify-between">
        {/* Gauche : Logo + Titre */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleHome}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors duration-200"
          >
            <span className="text-2xl">🎲</span>
            <span className="font-bold text-lg">Gémou2</span>
          </button>
          
          <div className="w-px h-6 bg-gray-300" />
          
          <h1 className="text-xl font-semibold text-gray-900">
            {title}
          </h1>
        </div>

        {/* Droite : Actions avec labels */}
        <div className="flex items-center space-x-4">
          {/* Favoris */}
          <button
            onClick={handleFavorite}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            aria-label="Ajouter aux favoris"
          >
            <span className={`text-lg ${isFavorite ? 'text-red-500' : 'text-gray-500'}`}>
              ❤️
            </span>
            <span className="text-sm font-medium text-gray-700">Favoris</span>
          </button>

          {/* Partager */}
          <button
            onClick={handleShare}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            aria-label="Partager"
          >
            <svg
              className="w-4 h-4 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
              />
            </svg>
            <span className="text-sm font-medium text-gray-700">Partager</span>
          </button>

          {/* Mon compte */}
          <button
            onClick={handleSettings}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            aria-label="Mon compte"
          >
            <svg
              className="w-4 h-4 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="text-sm font-medium text-gray-700">Mon compte</span>
          </button>
        </div>
      </div>
    </header>
  );
}


