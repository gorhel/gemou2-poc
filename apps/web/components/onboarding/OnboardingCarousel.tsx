'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { OnboardingSlide } from './OnboardingSlide';
import { OnboardingNavigation } from './OnboardingNavigation';
import { onboardingSlides, onboardingConfig } from '../../lib/onboarding-data';

interface OnboardingCarouselProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingCarousel({ onComplete, onSkip }: OnboardingCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const totalSlides = onboardingSlides.length;
  const isFirst = currentSlide === 0;
  const isLast = currentSlide === totalSlides - 1;

  // Navigation functions
  const goToNext = useCallback(() => {
    if (currentSlide < totalSlides - 1 && !isTransitioning) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(prev => prev + 1);
        setIsTransitioning(false);
      }, 150);
    }
  }, [currentSlide, totalSlides, isTransitioning]);

  const goToPrevious = useCallback(() => {
    if (currentSlide > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(prev => prev - 1);
        setIsTransitioning(false);
      }, 150);
    }
  }, [currentSlide, isTransitioning]);

  const goToSlide = useCallback((index: number) => {
    if (index !== currentSlide && !isTransitioning) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(index);
        setIsTransitioning(false);
      }, 150);
    }
  }, [currentSlide, isTransitioning]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowRight':
        case ' ':
          event.preventDefault();
          goToNext();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          goToPrevious();
          break;
        case 'Escape':
          event.preventDefault();
          onSkip();
          break;
        case 'Enter':
          if (isLast) {
            event.preventDefault();
            onComplete();
          } else {
            event.preventDefault();
            goToNext();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious, onSkip, onComplete, isLast]);

  // Touch/Swipe navigation
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && !isLast) {
      goToNext();
    }
    if (isRightSwipe && !isFirst) {
      goToPrevious();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Header with Skip Button */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="flex justify-end">
          <button
            onClick={onSkip}
            className="
              text-gray-500 hover:text-gray-700 text-sm font-medium
              px-4 py-2 rounded-lg hover:bg-gray-100
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-200
            "
          >
            {onboardingConfig.skipText}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div 
        className="relative w-full h-full overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Slides Container */}
        <div className="relative w-full h-full">
          {onboardingSlides.map((slide, index) => (
            <OnboardingSlide
              key={slide.id}
              slide={slide}
              isActive={index === currentSlide}
              onNext={goToNext}
              onPrevious={goToPrevious}
              onComplete={onComplete}
              isFirst={index === 0}
              isLast={index === totalSlides - 1}
            />
          ))}
        </div>

        {/* Navigation */}
        <OnboardingNavigation
          currentSlide={currentSlide}
          totalSlides={totalSlides}
          onNext={goToNext}
          onPrevious={goToPrevious}
          onSkip={onSkip}
          onComplete={onComplete}
          isFirst={isFirst}
          isLast={isLast}
        />
      </div>

      {/* Mobile Swipe Indicator */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 lg:hidden">
        <div className="flex items-center space-x-2 text-gray-400 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
          <span>Glissez</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </div>
  );
}
