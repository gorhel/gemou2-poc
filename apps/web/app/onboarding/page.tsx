'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingCarousel } from '../../components/onboarding';

export default function OnboardingPage() {
  const router = useRouter();

  const handleComplete = () => {
    // Marquer l'onboarding comme terminé
    localStorage.setItem('gemou2-onboarding-completed', 'true');
    
    // Rediriger vers la page d'authentification
    router.push('/#auth-section');
  };

  const handleSkip = () => {
    // Marquer l'onboarding comme terminé même si skip
    localStorage.setItem('gemou2-onboarding-completed', 'true');
    
    // Rediriger vers la page d'authentification
    router.push('/#auth-section');
  };

  return (
    <OnboardingCarousel
      onComplete={handleComplete}
      onSkip={handleSkip}
    />
  );
}
