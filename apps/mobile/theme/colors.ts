/**
 * Palette de couleurs Machi
 * 
 * Couleurs principales de la marque Machi utilisées dans toute l'application mobile.
 * Toutes les couleurs doivent être importées depuis ce fichier pour garantir la cohérence.
 */

export const MachiColors = {
  // Couleurs principales
  primary: '#6366F1',      // Indigo - Éléments principaux, liens, accents
  secondary: '#8B5CF6',    // Violet - Dégradés, éléments secondaires
  accent: '#F59E0B',       // Ambre - Badges, indicateurs, call-to-action
  
  // Couleurs neutres
  neutral: '#F0F2F5',     // Gris clair - Fonds de cartes, zones de contenu
  text: '#1F2937',        // Gris foncé - Textes principaux
  textSecondary: '#6B7280', // Gris moyen - Textes secondaires
  border: '#E5E7EB',      // Gris très clair - Bordures
  background: '#FFFFFF',  // Blanc - Fond principal
  
  // Couleurs de statut
  success: '#10B981',     // Vert - Succès
  error: '#EF4444',       // Rouge - Erreurs
  warning: '#F59E0B',     // Ambre - Avertissements (identique à accent)
  info: '#6366F1',        // Indigo - Informations (identique à primary)
  
  // Overlays pour images
  overlayPrimary: 'rgba(99, 102, 241, 0.3)',    // 30% Indigo
  overlaySecondary: 'rgba(139, 92, 246, 0.3)',  // 30% Violet
  overlayDark: 'rgba(0, 0, 0, 0.3)',            // 30% Noir
  overlayLight: 'rgba(0, 0, 0, 0.4)',           // 40% Noir (pour événements)
  
  // États interactifs
  primaryHover: '#4F46E5',   // Indigo plus foncé pour hover
  primaryActive: '#4338CA',  // Indigo encore plus foncé pour active
  secondaryHover: '#7C3AED', // Violet plus foncé pour hover
  
  // Dégradés
  gradientPrimary: ['#6366F1', '#8B5CF6'], // Dégradé indigo → violet
  gradientAvatar: ['#6366F1', '#8B5CF6'],  // Dégradé pour avatars
  
  // Variantes de gris pour compatibilité
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
} as const;

/**
 * Export par défaut pour faciliter l'import
 */
export default MachiColors;

/**
 * Type pour autocomplétion TypeScript
 */
export type MachiColorKey = keyof typeof MachiColors;

