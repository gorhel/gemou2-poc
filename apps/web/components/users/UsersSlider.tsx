'use client';

import React, { useState, useRef } from 'react';
import { Button } from '../ui/Button';
import UserCard from './UserCard';

interface User {
  id: string;
  username: string;
  full_name: string;
  bio: string;
  avatar_url: string;
  email: string;
  created_at: string;
  updated_at: string;
}

interface UsersSliderProps {
  users: User[];
  onViewProfile?: (user: User) => void;
  onSendMessage?: (userId: string) => void;
  className?: string;
}

export default function UsersSlider({ 
  users, 
  onViewProfile, 
  onSendMessage, 
  className = '' 
}: UsersSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  const itemsPerView = 4; // Nombre d'éléments visibles
  const maxIndex = Math.max(0, users.length - itemsPerView);

  const nextSlide = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, maxIndex)));
  };

  if (users.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-gray-400 mb-4">
          <span className="text-4xl">👥</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun joueur trouvé</h3>
        <p className="text-gray-600">
          Aucun joueur à recommander pour le moment.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Navigation buttons - Compact */}
      <div className="flex justify-end items-center mb-3">
        <div className="flex items-center space-x-1">
          <Button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            variant="outline"
            size="sm"
            className="w-7 h-7 p-0 rounded-full text-xs"
          >
            ‹
          </Button>
          <Button
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
            variant="outline"
            size="sm"
            className="w-7 h-7 p-0 rounded-full text-xs"
          >
            ›
          </Button>
        </div>
      </div>

      {/* Slider container - Format vertical compact */}
      <div className="relative overflow-hidden">
        <div
          ref={sliderRef}
          className="flex transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            width: `${(users.length / itemsPerView) * 100}%`
          }}
        >
          {users.map((user) => (
            <div
              key={user.id}
              className="flex-shrink-0 px-1"
              style={{ width: `${100 / users.length}%` }}
            >
              <UserCard
                user={user}
                onViewProfile={onViewProfile}
                onSendMessage={onSendMessage}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dots indicator - Compact */}
      {users.length > itemsPerView && (
        <div className="flex justify-center space-x-1 mt-3">
          {Array.from({ length: maxIndex + 1 }, (_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                index === currentIndex
                  ? 'bg-blue-500'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
