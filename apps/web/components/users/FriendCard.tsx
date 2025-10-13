'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '../ui/Card';

interface Friend {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  city?: string;
  created_at: string;
}

interface FriendCardProps {
  friend: Friend;
  onViewProfile?: (friend: Friend) => void;
}

export default function FriendCard({ friend, onViewProfile }: FriendCardProps) {
  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile(friend);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short'
    });
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <div className="p-4 h-full flex flex-col">
        {/* Avatar et informations principales */}
        <div className="flex items-center space-x-3 mb-3">
          <div className="relative">
            {friend.avatar_url ? (
              <img
                src={friend.avatar_url}
                alt={friend.full_name || friend.username}
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center border-2 border-gray-200">
                <span className="text-white font-semibold text-lg">
                  {(friend.full_name || friend.username || '?').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            {/* Indicateur en ligne */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {friend.full_name || friend.username}
            </h3>
            <p className="text-sm text-gray-600 truncate">
              @{friend.username}
            </p>
          </div>
        </div>

        {/* Bio */}
        {friend.bio && (
          <div className="mb-3">
            <p className="text-sm text-gray-700 line-clamp-2">
              {friend.bio}
            </p>
          </div>
        )}

        {/* Informations supplémentaires */}
        <div className="mt-auto space-y-2">
          {friend.city && (
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {friend.city}
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Membre depuis {formatDate(friend.created_at)}</span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
              Actif
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <Link 
            href={`/profile/${friend.username}`}
            className="block w-full"
          >
            <button
              onClick={handleViewProfile}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200"
            >
              Voir le profil
            </button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
