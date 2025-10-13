/**
 * Hook partagé pour gérer l'onboarding
 * Fonctionne sur web (localStorage) et mobile (SecureStore via abstraction)
 */

export interface OnboardingStorage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
}

const ONBOARDING_KEY = 'gemou2-onboarding-completed';

export function useOnboardingLogic(storage: OnboardingStorage) {
  const checkOnboardingCompleted = async (): Promise<boolean> => {
    try {
      const value = await storage.getItem(ONBOARDING_KEY);
      return !!value;
    } catch (error) {
      console.error('Error checking onboarding:', error);
      return false;
    }
  };

  const markOnboardingCompleted = async (): Promise<void> => {
    try {
      await storage.setItem(ONBOARDING_KEY, 'true');
    } catch (error) {
      console.error('Error marking onboarding as completed:', error);
      throw error;
    }
  };

  const resetOnboarding = async (): Promise<void> => {
    try {
      await storage.setItem(ONBOARDING_KEY, '');
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      throw error;
    }
  };

  return {
    checkOnboardingCompleted,
    markOnboardingCompleted,
    resetOnboarding,
  };
}

