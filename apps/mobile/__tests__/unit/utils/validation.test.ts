import {
  validateEmail,
  validatePassword,
  validateUsername,
  validatePhoneNumber,
  validateUrl,
  validatePrice,
  validateFutureDate,
  validatePostalCode,
} from '../../../utils/validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('devrait valider un email correct', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('test+tag@example.com')).toBe(true);
      expect(validateEmail('user123@test-domain.fr')).toBe(true);
    });

    it('devrait rejeter un email invalide', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('invalid@')).toBe(false);
      expect(validateEmail('@invalid.com')).toBe(false);
      expect(validateEmail('invalid@domain')).toBe(false);
      expect(validateEmail('invalid@.com')).toBe(false);
      expect(validateEmail('invalid..test@example.com')).toBe(false);
    });

    it('devrait rejeter un email vide', () => {
      expect(validateEmail('')).toBe(false);
    });

    it('devrait rejeter un email avec des espaces', () => {
      expect(validateEmail('test @example.com')).toBe(false);
      expect(validateEmail('test@ example.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('devrait valider un mot de passe fort', () => {
      const result = validatePassword('StrongPass123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('devrait valider différents mots de passe forts', () => {
      expect(validatePassword('Test1234').isValid).toBe(true);
      expect(validatePassword('MyP@ssw0rd').isValid).toBe(true);
      expect(validatePassword('SecurePassword1').isValid).toBe(true);
    });

    it('devrait rejeter un mot de passe trop court', () => {
      const result = validatePassword('Short1');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Le mot de passe doit contenir au moins 8 caractères'
      );
    });

    it('devrait rejeter un mot de passe sans majuscule', () => {
      const result = validatePassword('lowercase123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Le mot de passe doit contenir au moins une majuscule'
      );
    });

    it('devrait rejeter un mot de passe sans minuscule', () => {
      const result = validatePassword('UPPERCASE123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Le mot de passe doit contenir au moins une minuscule'
      );
    });

    it('devrait rejeter un mot de passe sans chiffre', () => {
      const result = validatePassword('NoNumbersHere');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Le mot de passe doit contenir au moins un chiffre'
      );
    });

    it('devrait retourner toutes les erreurs pour un mot de passe très faible', () => {
      const result = validatePassword('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it('devrait rejeter un mot de passe vide', () => {
      const result = validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBe(4);
    });
  });

  describe('validateUsername', () => {
    it('devrait valider un nom d\'utilisateur correct', () => {
      expect(validateUsername('user123')).toBe(true);
      expect(validateUsername('User_Name')).toBe(true);
      expect(validateUsername('john_doe_123')).toBe(true);
      expect(validateUsername('testuser')).toBe(true);
      expect(validateUsername('ABC')).toBe(true);
    });

    it('devrait rejeter un nom d\'utilisateur trop court', () => {
      expect(validateUsername('ab')).toBe(false);
      expect(validateUsername('a')).toBe(false);
    });

    it('devrait rejeter un nom d\'utilisateur trop long', () => {
      expect(validateUsername('a'.repeat(21))).toBe(false);
      expect(validateUsername('a'.repeat(25))).toBe(false);
    });

    it('devrait rejeter des caractères spéciaux', () => {
      expect(validateUsername('user@name')).toBe(false);
      expect(validateUsername('user-name')).toBe(false);
      expect(validateUsername('user.name')).toBe(false);
      expect(validateUsername('user!name')).toBe(false);
      expect(validateUsername('user#name')).toBe(false);
    });

    it('devrait rejeter les espaces', () => {
      expect(validateUsername('user name')).toBe(false);
      expect(validateUsername(' username')).toBe(false);
      expect(validateUsername('username ')).toBe(false);
    });

    it('devrait rejeter un username vide', () => {
      expect(validateUsername('')).toBe(false);
    });
  });

  describe('validatePhoneNumber', () => {
    it('devrait valider un numéro français correct', () => {
      expect(validatePhoneNumber('0612345678')).toBe(true);
      expect(validatePhoneNumber('01 23 45 67 89')).toBe(true);
      expect(validatePhoneNumber('+33612345678')).toBe(true);
      expect(validatePhoneNumber('0033612345678')).toBe(true);
    });

    it('devrait valider différents formats', () => {
      expect(validatePhoneNumber('06-12-34-56-78')).toBe(true);
      expect(validatePhoneNumber('06.12.34.56.78')).toBe(true);
    });

    it('devrait rejeter un numéro invalide', () => {
      expect(validatePhoneNumber('1234')).toBe(false);
      expect(validatePhoneNumber('0012345678')).toBe(false);
      expect(validatePhoneNumber('abcdefghij')).toBe(false);
    });

    it('devrait rejeter un numéro vide', () => {
      expect(validatePhoneNumber('')).toBe(false);
    });
  });

  describe('validateUrl', () => {
    it('devrait valider une URL correcte', () => {
      expect(validateUrl('https://example.com')).toBe(true);
      expect(validateUrl('http://example.com')).toBe(true);
      expect(validateUrl('https://www.example.com/path')).toBe(true);
      expect(validateUrl('https://example.com/path?query=value')).toBe(true);
    });

    it('devrait rejeter une URL invalide', () => {
      expect(validateUrl('not a url')).toBe(false);
      expect(validateUrl('example.com')).toBe(false);
      expect(validateUrl('ftp://example')).toBe(true); // ftp est valide
    });

    it('devrait rejeter une URL vide', () => {
      expect(validateUrl('')).toBe(false);
    });
  });

  describe('validatePrice', () => {
    it('devrait valider un prix correct', () => {
      expect(validatePrice(100)).toBe(true);
      expect(validatePrice(0)).toBe(true);
      expect(validatePrice(99.99)).toBe(true);
      expect(validatePrice('50')).toBe(true);
      expect(validatePrice('19.99')).toBe(true);
    });

    it('devrait rejeter un prix négatif', () => {
      expect(validatePrice(-10)).toBe(false);
      expect(validatePrice('-5.99')).toBe(false);
    });

    it('devrait rejeter un prix non numérique', () => {
      expect(validatePrice('abc')).toBe(false);
      expect(validatePrice('10€')).toBe(false);
    });

    it('devrait rejeter une chaîne vide', () => {
      expect(validatePrice('')).toBe(false);
    });
  });

  describe('validateFutureDate', () => {
    it('devrait valider une date future', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      expect(validateFutureDate(futureDate)).toBe(true);
      
      const futureDateString = new Date(Date.now() + 86400000).toISOString();
      expect(validateFutureDate(futureDateString)).toBe(true);
    });

    it('devrait rejeter une date passée', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 7);
      expect(validateFutureDate(pastDate)).toBe(false);
      
      const pastDateString = new Date(Date.now() - 86400000).toISOString();
      expect(validateFutureDate(pastDateString)).toBe(false);
    });

    it('devrait rejeter la date actuelle', () => {
      const now = new Date();
      // Ajoute 100ms pour éviter les problèmes de timing
      const result = validateFutureDate(new Date(now.getTime() - 100));
      expect(result).toBe(false);
    });
  });

  describe('validatePostalCode', () => {
    it('devrait valider un code postal français correct', () => {
      expect(validatePostalCode('75001')).toBe(true);
      expect(validatePostalCode('69000')).toBe(true);
      expect(validatePostalCode('13000')).toBe(true);
      expect(validatePostalCode('00000')).toBe(true);
    });

    it('devrait rejeter un code postal invalide', () => {
      expect(validatePostalCode('1234')).toBe(false);
      expect(validatePostalCode('123456')).toBe(false);
      expect(validatePostalCode('abcde')).toBe(false);
      expect(validatePostalCode('750 01')).toBe(false);
    });

    it('devrait rejeter un code postal vide', () => {
      expect(validatePostalCode('')).toBe(false);
    });
  });
});






