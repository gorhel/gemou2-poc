'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  validateUsernameFormat, 
  generateUsernameSuggestions, 
  USERNAME_ERRORS,
  UsernameState 
} from '@gemou2/database/username-validation';

interface UsernameInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

interface ValidationResult {
  state: UsernameState;
  error?: string;
  suggestions?: string[];
}

export default function UsernameInput({
  value,
  onChange,
  onValidationChange,
  placeholder = "Choisissez votre pseudo",
  disabled = false,
  className = ""
}: UsernameInputProps) {
  const [validation, setValidation] = useState<ValidationResult>({
    state: 'idle'
  });
  const [isChecking, setIsChecking] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounce pour éviter trop d'appels API
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, 500);
    return () => clearTimeout(timer);
  }, [value]);

  // Fonction pour vérifier l'unicité du pseudo
  const checkUsernameAvailability = useCallback(async (username: string) => {
    if (!username || username.length < 3) return;

    setIsChecking(true);
    setValidation(prev => ({ ...prev, state: 'validating' }));

    try {
      const response = await fetch('/api/username/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      const result = await response.json();

      if (result.valid) {
        setValidation({
          state: 'valid',
          suggestions: []
        });
        onValidationChange?.(true);
      } else {
        const suggestions = generateUsernameSuggestions(username);
        setValidation({
          state: 'invalid',
          error: result.error,
          suggestions: suggestions.length > 0 ? suggestions : undefined
        });
        onValidationChange?.(false);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      setValidation({
        state: 'invalid',
        error: 'Erreur de connexion'
      });
      onValidationChange?.(false);
    } finally {
      setIsChecking(false);
    }
  }, [onValidationChange]);

  // Validation en temps réel
  useEffect(() => {
    if (!debouncedValue) {
      setValidation({ state: 'idle' });
      onValidationChange?.(false);
      return;
    }

    // Validation locale d'abord
    const formatValidation = validateUsernameFormat(debouncedValue);
    if (!formatValidation.valid) {
      setValidation({
        state: 'invalid',
        error: formatValidation.error
      });
      onValidationChange?.(false);
      return;
    }

    // Si le format est valide, vérifier l'unicité
    checkUsernameAvailability(debouncedValue);
  }, [debouncedValue, checkUsernameAvailability, onValidationChange]);

  // Gestion du changement de valeur
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (newValue) {
      setValidation(prev => ({ ...prev, state: 'typing' }));
    } else {
      setValidation({ state: 'idle' });
      onValidationChange?.(false);
    }
  };

  // Gestion de la sélection d'une suggestion
  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  // Icônes et couleurs selon l'état
  const getInputStyles = () => {
    const baseStyles = "w-full px-4 py-3 pr-12 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    switch (validation.state) {
      case 'valid':
        return `${baseStyles} border-green-300 bg-green-50 focus:border-green-500 focus:ring-green-500`;
      case 'invalid':
        return `${baseStyles} border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500`;
      case 'validating':
        return `${baseStyles} border-yellow-300 bg-yellow-50 focus:border-yellow-500 focus:ring-yellow-500`;
      default:
        return `${baseStyles} border-gray-300 focus:border-blue-500 focus:ring-blue-500`;
    }
  };

  const getIcon = () => {
    if (isChecking || validation.state === 'validating') {
      return (
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-600"></div>
      );
    }
    
    if (validation.state === 'valid') {
      return <span className="text-green-500 text-xl">✓</span>;
    }
    
    if (validation.state === 'invalid') {
      return <span className="text-red-500 text-xl">✗</span>;
    }
    
    return <span className="text-gray-400 text-xl">👤</span>;
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          disabled={disabled}
          className={getInputStyles()}
          autoComplete="username"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          {getIcon()}
        </div>
      </div>

      {/* Message d'erreur ou de succès */}
      {validation.error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <span className="mr-1">⚠️</span>
          {validation.error}
        </p>
      )}

      {validation.state === 'valid' && (
        <p className="mt-2 text-sm text-green-600 flex items-center">
          <span className="mr-1">✅</span>
          Pseudo disponible !
        </p>
      )}

      {/* Suggestions */}
      {showSuggestions && validation.suggestions && validation.suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="p-2">
            <p className="text-xs text-gray-500 mb-2">Suggestions :</p>
            {validation.suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center"
              >
                <span className="mr-2">💡</span>
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

