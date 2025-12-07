/**
 * Constantes d'espacement uniformes pour toutes les modales de l'application
 * 
 * Ces constantes garantissent une cohérence visuelle entre toutes les modales :
 * - Header : padding uniforme pour l'en-tête (titre et bouton de fermeture)
 * - Content : padding uniforme pour le contenu principal (sans compter header/title/footer)
 * - Footer : padding uniforme pour la zone d'action avec les boutons
 * - ButtonSpacing : espacement uniforme entre les boutons dans le footer
 */

// Padding du header de la modale (en-tête avec titre et bouton de fermeture)
export const MODAL_HEADER_PADDING = 'p-6'

// Padding du contenu de la modale (zone principale sans header/title/footer)
export const MODAL_CONTENT_PADDING = 'p-6'

// Padding du footer de la modale (zone d'action avec les boutons)
export const MODAL_FOOTER_PADDING = 'p-6'

// Espacement horizontal entre les boutons dans le footer
export const MODAL_FOOTER_BUTTON_SPACING = 'space-x-3'

// Classes Tailwind complètes pour faciliter l'utilisation
export const MODAL_SPACING_CLASSES = {
  header: MODAL_HEADER_PADDING,
  content: MODAL_CONTENT_PADDING,
  footer: MODAL_FOOTER_PADDING,
  buttonSpacing: MODAL_FOOTER_BUTTON_SPACING,
} as const

// Valeurs numériques équivalentes pour React Native
export const MODAL_SPACING_VALUES = {
  header: 24, // p-6 = 24px
  content: 24, // p-6 = 24px
  footer: 24, // p-6 = 24px
  buttonSpacing: 12, // space-x-3 = 12px
} as const

