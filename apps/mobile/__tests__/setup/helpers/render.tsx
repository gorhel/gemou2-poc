import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { AuthProvider } from '../../../components/auth/AuthProvider';

/**
 * Interface pour les props du Provider global de test
 */
interface AllProvidersProps {
  children: React.ReactNode;
}

/**
 * Wrapper qui enveloppe tous les providers nécessaires pour les tests
 */
const AllProviders = ({ children }: AllProvidersProps) => {
  return <AuthProvider>{children}</AuthProvider>;
};

/**
 * Fonction de rendu personnalisée qui inclut automatiquement tous les providers
 * 
 * @param ui - L'élément React à rendre
 * @param options - Options de rendu supplémentaires
 * @returns Résultat du rendu avec tous les utilitaires de testing
 */
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

// Réexporte tout de @testing-library/react-native
export * from '@testing-library/react-native';

// Réexporte le render personnalisé
export { customRender as render };






