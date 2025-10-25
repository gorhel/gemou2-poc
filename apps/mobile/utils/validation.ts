/**
 * Utilitaires de validation pour les formulaires
 */

/**
 * Valide un email
 * @param email - L'email à valider
 * @returns true si l'email est valide, false sinon
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valide un mot de passe
 * @param password - Le mot de passe à valider
 * @returns Un objet avec isValid et la liste des erreurs
 */
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valide un nom d'utilisateur
 * @param username - Le nom d'utilisateur à valider
 * @returns true si le nom d'utilisateur est valide, false sinon
 */
export const validateUsername = (username: string): boolean => {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
};

/**
 * Valide un numéro de téléphone français
 * @param phone - Le numéro de téléphone à valider
 * @returns true si le numéro est valide, false sinon
 */
export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  return phoneRegex.test(phone);
};

/**
 * Valide une URL
 * @param url - L'URL à valider
 * @returns true si l'URL est valide, false sinon
 */
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Valide un prix (montant positif)
 * @param price - Le prix à valider
 * @returns true si le prix est valide, false sinon
 */
export const validatePrice = (price: number | string): boolean => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return !isNaN(numPrice) && numPrice >= 0;
};

/**
 * Valide une date future
 * @param date - La date à valider
 * @returns true si la date est dans le futur, false sinon
 */
export const validateFutureDate = (date: string | Date): boolean => {
  const inputDate = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  return inputDate > now;
};

/**
 * Valide un code postal français
 * @param postalCode - Le code postal à valider
 * @returns true si le code postal est valide, false sinon
 */
export const validatePostalCode = (postalCode: string): boolean => {
  return /^[0-9]{5}$/.test(postalCode);
};




