import { useState, useEffect, useCallback } from 'react';
import { 
  validateUsernameFormat, 
  generateUsernameSuggestions,
  UsernameState 
} from '@gemou2/database/username-validation';

interface UseUsernameValidationReturn {
  state: UsernameState;
  error?: string;
  suggestions?: string[];
  isValid: boolean;
  isChecking: boolean;
}

export function useUsernameValidation(username: string): UseUsernameValidationReturn {
  const [state, setState] = useState<UsernameState>('idle');
  const [error, setError] = useState<string | undefined>();
  const [suggestions, setSuggestions] = useState<string[] | undefined>();
  const [isChecking, setIsChecking] = useState(false);

  const checkAvailability = useCallback(async (username: string) => {
    if (!username || username.length < 3) return;

    setIsChecking(true);
    setState('validating');

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
        setState('valid');
        setError(undefined);
        setSuggestions(undefined);
      } else {
        setState('invalid');
        setError(result.error);
        setSuggestions(generateUsernameSuggestions(username));
      }
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      setState('invalid');
      setError('Erreur de connexion');
      setSuggestions(undefined);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    if (!username) {
      setState('idle');
      setError(undefined);
      setSuggestions(undefined);
      return;
    }

    // Validation locale d'abord
    const formatValidation = validateUsernameFormat(username);
    if (!formatValidation.valid) {
      setState('invalid');
      setError(formatValidation.error);
      setSuggestions(undefined);
      return;
    }

    // Debounce pour éviter trop d'appels API
    const timer = setTimeout(() => {
      checkAvailability(username);
    }, 500);

    return () => clearTimeout(timer);
  }, [username, checkAvailability]);

  return {
    state,
    error,
    suggestions,
    isValid: state === 'valid',
    isChecking
  };
}

