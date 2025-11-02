'use client';

import React from 'react';
import { OnboardingSlideData } from '../../lib/onboarding-data';

interface OnboardingSlideProps {
  slide: OnboardingSlideData;
  isActive: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
  onComplete?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export function OnboardingSlide({
  slide,
  isActive,
  onNext,
  onPrevious,
  onComplete,
  isFirst = false,
  isLast = false
}: OnboardingSlideProps) {
  const handleAction = () => {
    if (isLast && onComplete) {
      onComplete();
    } else if (onNext) {
      onNext();
    }
  };

  return (
    <div className={`
      absolute inset-0 w-full h-full flex flex-col items-center justify-center p-8
      transition-all duration-500 ease-in-out
      ${isActive ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-8 pointer-events-none'}
    `}>
      {/* Image/Icon Section */}
      <div className="flex-1 flex items-center justify-center mb-8">
        <div className="relative w-full max-w-md">
          {slide.image ? (
            <img 
              src={slide.image} 
              alt={slide.title}
              className="w-full h-auto"
            />
          ) : (
            <div className="w-64 h-64 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center shadow-soft mx-auto">
              <span className="text-8xl">{slide.icon}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {slide.title}
        </h2>
        
        <p className="text-xl md:text-2xl text-primary-600 mb-6 font-medium">
          {slide.subtitle}
        </p>
        
        {slide.description && (
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            {slide.description}
          </p>
        )}
      </div>

      {/* Navigation Arrows - Desktop Only */}
      {!isFirst && (
        <button
          onClick={onPrevious}
          className="
            absolute left-4 top-1/2 transform -translate-y-1/2
            w-12 h-12 bg-white rounded-full shadow-medium
            flex items-center justify-center text-gray-600
            hover:bg-gray-50 transition-all duration-200
            focus:outline-none focus:ring-4 focus:ring-primary-200
            hidden lg:flex
          "
          aria-label="Slide précédent"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {!isLast && (
        <button
          onClick={onNext}
          className="
            absolute right-4 top-1/2 transform -translate-y-1/2
            w-12 h-12 bg-white rounded-full shadow-medium
            flex items-center justify-center text-gray-600
            hover:bg-gray-50 transition-all duration-200
            focus:outline-none focus:ring-4 focus:ring-primary-200
            hidden lg:flex
          "
          aria-label="Slide suivant"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
