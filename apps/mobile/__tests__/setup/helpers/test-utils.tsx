/**
 * Utilitaires de test réutilisables
 */

/**
 * Attend un délai spécifique
 * @param ms - Nombre de millisecondes à attendre
 */
export const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Crée un mock d'event pour les tests
 */
export const createMockEvent = (value: string) => ({
  nativeEvent: { text: value },
  target: { value },
});

/**
 * Génère un ID UUID fictif pour les tests
 */
export const generateTestId = (): string => {
  return `test-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Crée une date relative pour les tests
 */
export const createTestDate = (daysFromNow: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString();
};

/**
 * Simule un délai réseau pour les appels API mockés
 */
export const simulateNetworkDelay = async (ms: number = 100): Promise<void> => {
  await wait(ms);
};

/**
 * Vérifie si un élément est visible dans le DOM
 */
export const isElementVisible = (element: any): boolean => {
  return element && element.props && element.props.style && 
         element.props.style.display !== 'none';
};


