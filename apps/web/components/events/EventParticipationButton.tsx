'use client';

import React from 'react';
import { Button, ButtonProps } from '../ui/Button';
import { useEventParticipation } from '../../hooks/useEventParticipation';

interface EventParticipationButtonProps {
  eventId: string;
  eventStatus: string;
  isFull: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  size?: ButtonProps['size'];
  variant?: ButtonProps['variant'];
  className?: string;
}

export default function EventParticipationButton({
  eventId,
  eventStatus,
  isFull,
  onSuccess,
  onError,
  size = 'sm',
  variant = 'default',
  className = ''
}: EventParticipationButtonProps) {
  const { isParticipating, isLoading, toggleParticipation } = useEventParticipation({
    eventId,
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    }
  });

  const handleClick = async () => {
    await toggleParticipation();
  };

  // Ne pas afficher le bouton si l'événement n'est pas actif
  if (eventStatus !== 'active') {
    return null;
  }

  // Si l'événement est complet et que l'utilisateur ne participe pas
  if (isFull && !isParticipating) {
    return (
      <Button
        disabled
        size={size}
        variant="outline"
        className={`text-gray-500 cursor-not-allowed ${className}`}
      >
        Complet
      </Button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      size={size}
      variant={variant}
      className={className}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Chargement...</span>
        </div>
      ) : isParticipating ? (
        'Quitter'
      ) : (
        'Rejoindre'
      )}
    </Button>
  );
}
