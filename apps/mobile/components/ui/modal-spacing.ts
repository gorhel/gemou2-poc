/**
 * Constantes d'espacement uniformes pour toutes les modales de l'application mobile
 * 
 * Ces constantes garantissent une cohérence visuelle entre toutes les modales :
 * - Header : padding uniforme pour l'en-tête (titre et bouton de fermeture)
 * - Content : padding uniforme pour le contenu principal (sans compter header/title/footer)
 * - Footer : padding uniforme pour la zone d'action avec les boutons
 * - ButtonSpacing : espacement uniforme entre les boutons dans le footer
 */

// Valeurs numériques pour React Native (en pixels)
export const MODAL_SPACING_VALUES = {
  header: 24, // Équivalent à p-6 en Tailwind
  content: 24, // Équivalent à p-6 en Tailwind
  footer: 24, // Équivalent à p-6 en Tailwind
  buttonSpacing: 12, // Équivalent à space-x-3 en Tailwind
} as const

