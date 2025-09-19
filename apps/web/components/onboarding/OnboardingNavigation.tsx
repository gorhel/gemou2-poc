'use client';

import React from 'react';

interface OnboardingNavigationProps {
  currentSlide: number;
  totalSlides: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onComplete: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function OnboardingNavigation({
  currentSlide,
  totalSlides,
  onNext,
  onPrevious,
  onSkip,
  onComplete,
  isFirst,
  isLast
}: OnboardingNavigationProps) {
  const progress = ((currentSlide + 1) / totalSlides) * 100;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              {currentSlide + 1} sur {totalSlides}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between">
          {/* Skip Button */}
          <button
            onClick={onSkip}
            className="
              text-gray-500 hover:text-gray-700 text-sm font-medium
              transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-200
              px-3 py-2 rounded-lg hover:bg-gray-100
            "
          >
            Passer l'introduction
          </button>

          {/* Slide Indicators */}
          <div className="flex space-x-2">
            {Array.from({ length: totalSlides }, (_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (index < currentSlide) onPrevious();
                  else if (index > currentSlide) onNext();
                }}
                className={`
                  w-3 h-3 rounded-full transition-all duration-200
                  ${index === currentSlide 
                    ? 'bg-primary-600 scale-125' 
                    : index < currentSlide 
                      ? 'bg-primary-300 hover:bg-primary-400' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }
                  focus:outline-none focus:ring-2 focus:ring-primary-200
                `}
                aria-label={`Aller au slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {!isFirst && (
              <button
                onClick={onPrevious}
                className="
                  px-4 py-2 text-gray-600 hover:text-gray-800
                  border border-gray-300 rounded-lg hover:bg-gray-50
                  transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-200
                  flex items-center space-x-2
                "
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Précédent</span>
              </button>
            )}

            {isLast ? (
              <button
                onClick={onComplete}
                className="
                  px-6 py-2 bg-primary-600 text-white font-semibold
                  rounded-lg hover:bg-primary-700 shadow-medium
                  transition-all duration-200 transform hover:scale-105
                  focus:outline-none focus:ring-4 focus:ring-primary-200
                  flex items-center space-x-2
                "
              >
                <span>Commencer l'aventure</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            ) : (
              <button
                onClick={onNext}
                className="
                  px-6 py-2 bg-primary-600 text-white font-semibold
                  rounded-lg hover:bg-primary-700 shadow-medium
                  transition-all duration-200 transform hover:scale-105
                  focus:outline-none focus:ring-4 focus:ring-primary-200
                  flex items-center space-x-2
                "
              >
                <span>Suivant</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
