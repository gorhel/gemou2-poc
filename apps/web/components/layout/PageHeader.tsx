'use client';

import React, { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  actions?: ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
  className?: string;
}

/**
 * Composant Header centralisé pour toutes les pages
 * 
 * @param title - Titre de la page (obligatoire)
 * @param subtitle - Sous-titre ou description
 * @param icon - Emoji ou icône à afficher avant le titre
 * @param actions - Boutons ou actions à afficher à droite
 * @param showBackButton - Afficher le bouton retour (pour les pages de détail)
 * @param onBack - Fonction personnalisée pour le retour (sinon router.back())
 */
export default function PageHeader({
  title,
  subtitle,
  icon,
  actions,
  showBackButton = false,
  onBack,
  className = ''
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };
  const pathname = usePathname();
  const pageIcons = {
    '/home': '/icons/home.svg',
    '/profile': '/icons/profile.svg',
    '/settings': '/icons/settings.svg',
    // etc.
  };
  

  return (
    <div className={`bg-white shadow-sm border-b ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6 gap-4">
          {/* Partie gauche : Bouton retour + Titre */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {showBackButton && (
              <Button 
                onClick={handleBack} 
                variant="outline" 
                size="sm"
                className="flex-shrink-0"
                aria-label="Retour"
              >
                <span className="hidden sm:inline">← Retour jjkk</span>
                <span className="sm:hidden">←</span>
                <span className="sm:hidden">
                  {pageIcons[pathname] ? (
                    <Image 
                      src={pageIcons[pathname]} 
                      alt={pathname.slice(1)}
                      width={20}
                      height={20}
                    />
                  ) : (
                    '←'
                  )}
                </span>

              </Button>
            )}
            
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 truncate">
                {icon && <span className="flex-shrink-0">{icon}</span>}
                <span className="truncate">{title}ddddd</span>
              </h1>
              {subtitle && (
                <p className="text-sm sm:text-base text-gray-600 mt-1 line-clamp-2">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Partie droite : Actions */}
          {actions && (
            <div className="flex gap-2 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



