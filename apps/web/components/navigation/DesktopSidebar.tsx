'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';

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

interface DesktopSidebarProps {
  className?: string;
}

export default function DesktopSidebar({ className = '' }: DesktopSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const getActiveItem = () => {
    return navigationItems.find(item => pathname.startsWith(item.path));
  };

  const activeItem = getActiveItem();

  return (
    <div className={`hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 bg-white border-r border-gray-200 shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-center p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">🎲</div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Gémou2</h1>
            <p className="text-sm text-gray-500">Jeux de société</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6">
        <div className="space-y-2 px-4">
          {navigationItems.map((item) => {
            const isActive = pathname.startsWith(item.path);
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center space-x-4 p-4 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 border-2 border-blue-200 shadow-sm'
                    : 'hover:bg-gray-50 border-2 border-transparent hover:border-gray-200'
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
        </div>
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200">
        <div className="text-center">
          <div className="text-sm text-gray-500 mb-2">
            <div className="font-medium text-gray-700">Gémou2</div>
            <div>Version 1.0.0</div>
          </div>
          <div className="text-xs text-gray-400">
            Connectez les passionnés de jeux de société
          </div>
        </div>
      </div>
    </div>
  );
}

