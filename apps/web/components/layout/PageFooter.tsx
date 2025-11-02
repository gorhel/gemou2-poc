'use client';

import React from 'react';
import Link from 'next/link';

interface PageFooterProps {
  className?: string;
}

/**
 * Composant Footer centralisé pour toutes les pages
 * 
 * Affiche les informations de l'application et les liens utiles
 */
export default function PageFooter({ className = '' }: PageFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-white border-t border-gray-200 mt-auto ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* À propos */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🎲</span>
              <h3 className="text-lg font-bold text-gray-900">Gémou2</h3>
            </div>
            <p className="text-sm text-gray-600">
              L'application qui connecte les passionnés de jeux de société
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Liens rapides</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/events" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Événements
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Communauté
                </Link>
              </li>
              <li>
                <Link href="/games" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Jeux
                </Link>
              </li>
            </ul>
          </div>

          {/* Informations */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Informations</h4>
            <ul className="space-y-2">
              <li className="text-sm text-gray-600">
                Version 1.0.0
              </li>
              <li className="text-sm text-gray-600">
                © {currentYear} Gémou2
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-xs text-gray-500">
            Fait avec ❤️ pour les passionnés de jeux de société
          </p>
        </div>
      </div>
    </footer>
  );
}





