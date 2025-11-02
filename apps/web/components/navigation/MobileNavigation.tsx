'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '../ui/Button';

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  color: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'search',
    label: 'Rechercher',
    icon: '🔍',
    path: '/search',
    color: 'text-blue-600'
  },
  {
    id: 'events',
    label: 'Événements',
    icon: '🎲',
    path: '/events',
    color: 'text-green-600'
  },
  {
    id: 'create',
    label: 'Créer',
    icon: '➕',
    path: '/create',
    color: 'text-purple-600'
  },
  {
    id: 'community',
    label: 'Communauté',
    icon: '👥',
    path: '/community',
    color: 'text-orange-600'
  },
  {
    id: 'profile',
    label: 'Profil',
    icon: '👤',
    path: '/profile',
    color: 'text-gray-600'
  }
];

interface MobileNavigationProps {
  className?: string;
}

export default function MobileNavigation({ className = '' }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const getActiveItem = () => {
    return navigationItems.find(item => pathname.startsWith(item.path));
  };

  const activeItem = getActiveItem();

  return (
    <>
      {/* Bouton hamburger mobile */}
      <div className={`lg:hidden ${className}`}>
        <Button
          onClick={toggleMenu}
          variant="outline"
          size="sm"
          className="fixed bottom-4 right-4 z-50 bg-white shadow-lg border-2 border-gray-200 hover:border-blue-500 rounded-full w-14 h-14 flex items-center justify-center"
        >
          <div className="flex flex-col items-center justify-center space-y-1">
            <div className={`w-5 h-0.5 bg-gray-600 transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <div className={`w-5 h-0.5 bg-gray-600 transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
            <div className={`w-5 h-0.5 bg-gray-600 transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </div>
        </Button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menu mobile */}
      <div className={`fixed inset-y-0 right-0 w-80 max-w-[90vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Menu</h2>
            <Button
              onClick={() => setIsOpen(false)}
              variant="outline"
              size="sm"
              className="w-8 h-8 p-0 rounded-full"
            >
              ✕
            </Button>
          </div>

          {/* Navigation items */}
          <div className="flex-1 py-6">
            <nav className="space-y-2 px-6">
              {navigationItems.map((item) => {
                const isActive = pathname.startsWith(item.path);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center space-x-4 p-4 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 border-2 border-blue-200 shadow-sm'
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <div className={`text-2xl ${isActive ? item.color : 'text-gray-500'}`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`font-medium ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                        {item.label}
                      </div>
                      {isActive && (
                        <div className="text-sm text-blue-600 mt-1">
                          Page actuelle
                        </div>
                      )}
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-500">
              <a 
                href="/dashboard" 
                className="mb-2 block text-primary-600 hover:text-primary-700 transition-colors cursor-pointer"
              >
                🎲 Gémou2
              </a>
              <div>Version 1.0.0</div>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de navigation mobile fixe en bas */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="flex justify-around py-2">
          {navigationItems.map((item) => {
            const isActive = pathname.startsWith(item.path);
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-all duration-200 ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <div className="text-lg">{item.icon}</div>
                <div className="text-xs font-medium">{item.label}</div>
                {isActive && (
                  <div className="w-1 h-1 bg-blue-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

