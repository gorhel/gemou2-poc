import { useState, useEffect } from 'react';

// Interface de validation des pseudonymes
export interface UsernameValidation {
  minLength: 3;
  maxLength: 20;
  allowedChars: RegExp; // /^[a-zA-Z0-9_-]+$/
  caseSensitive: false;
  uniqueCheck: true;
  reservedWords: string[];
}

// États du champ pseudo
export type UsernameState = 'idle' | 'typing' | 'validating' | 'valid' | 'invalid';

// Configuration de validation
export const USERNAME_CONFIG: UsernameValidation = {
  minLength: 3,
  maxLength: 20,
  allowedChars: /^[a-zA-Z0-9_-]+$/,
  caseSensitive: false,
  uniqueCheck: true,
  reservedWords: [
    'admin', 'administrator', 'moderator', 'mod',
    'support', 'help', 'assistance',
    'gémou', 'gemou', 'gemou2',
    'api', 'www', 'mail', 'email',
    'root', 'system', 'guest', 'anonymous',
    'test', 'demo', 'example', 'sample',
    'null', 'undefined', 'true', 'false'
  ]
};

// Messages d'erreur
export const USERNAME_ERRORS = {
  TOO_SHORT: `Trop court (min ${USERNAME_CONFIG.minLength} caractères)`,
  TOO_LONG: `Trop long (max ${USERNAME_CONFIG.maxLength} caractères)`,
  INVALID_CHARS: 'Caractères non autorisés (seuls a-z, 0-9, _, - sont acceptés)',
  ALREADY_TAKEN: 'Ce pseudo est déjà pris',
  RESERVED_WORD: 'Ce pseudo est réservé',
  REQUIRED: 'Le pseudo est obligatoire'
} as const;

// Fonction de validation locale (format)
export function validateUsernameFormat(username: string): { valid: boolean; error?: string } {
  if (!username) {
    return { valid: false, error: USERNAME_ERRORS.REQUIRED };
  }

  if (username.length < USERNAME_CONFIG.minLength) {
    return { valid: false, error: USERNAME_ERRORS.TOO_SHORT };
  }

  if (username.length > USERNAME_CONFIG.maxLength) {
    return { valid: false, error: USERNAME_ERRORS.TOO_LONG };
  }

  if (!USERNAME_CONFIG.allowedChars.test(username)) {
    return { valid: false, error: USERNAME_ERRORS.INVALID_CHARS };
  }

  const lowerUsername = username.toLowerCase();
  if (USERNAME_CONFIG.reservedWords.some(word => 
    lowerUsername === word.toLowerCase() || 
    lowerUsername.includes(word.toLowerCase())
  )) {
    return { valid: false, error: USERNAME_ERRORS.RESERVED_WORD };
  }

  return { valid: true };
}

// Fonction pour générer des suggestions
export function generateUsernameSuggestions(baseUsername: string): string[] {
  const suggestions: string[] = [];
  const cleanBase = baseUsername.toLowerCase().replace(/[^a-z0-9_-]/g, '');
  
  if (cleanBase.length < USERNAME_CONFIG.minLength) {
    return [];
  }

  // Ajouter des suffixes numériques
  for (let i = 1; i <= 999; i++) {
    if (suggestions.length >= 3) break;
    const suggestion = `${cleanBase}${i}`;
    if (suggestion.length <= USERNAME_CONFIG.maxLength) {
      suggestions.push(suggestion);
    }
  }

  // Ajouter des suffixes avec underscore
  for (let i = 1; i <= 99; i++) {
    if (suggestions.length >= 3) break;
    const suggestion = `${cleanBase}_${i}`;
    if (suggestion.length <= USERNAME_CONFIG.maxLength) {
      suggestions.push(suggestion);
    }
  }

  // Ajouter des suffixes avec tiret
  for (let i = 1; i <= 99; i++) {
    if (suggestions.length >= 3) break;
    const suggestion = `${cleanBase}-${i}`;
    if (suggestion.length <= USERNAME_CONFIG.maxLength) {
      suggestions.push(suggestion);
    }
  }

  return suggestions.slice(0, 3);
}

// Hook de debounce
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

