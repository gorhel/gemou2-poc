import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../../../../components/auth/AuthProvider';
import { supabase } from '../../../../lib/supabase';

// Mock Supabase est déjà fait dans jest.setup.js
jest.mock('../../../../lib/supabase');

describe('AuthProvider', () => {
  const mockSession = {
    user: {
      id: '123',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    },
    access_token: 'mock-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialisation', () => {
    it('devrait être en état loading au départ', () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current.loading).toBe(true);
    });

    it('devrait charger la session existante', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toEqual(mockSession.user);
      expect(result.current.session).toEqual(mockSession);
    });

    it('devrait gérer une session null', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });
  });

  describe('Authentication', () => {
    it('devrait se déconnecter correctement', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: null,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.signOut();

      expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
    });

    it('devrait gérer les erreurs de déconnexion', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: { message: 'Erreur de déconnexion' },
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.signOut();

      expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
    });
  });

  describe('Auth State Changes', () => {
    it('devrait écouter les changements d\'authentification', async () => {
      const mockUnsubscribe = jest.fn();
      
      (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { 
          subscription: { 
            unsubscribe: mockUnsubscribe 
          } 
        },
      });
      
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const { unmount } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('devrait mettre à jour l\'état lors des changements d\'auth', async () => {
      let authCallback: any;
      
      (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
        authCallback = callback;
        return {
          data: { 
            subscription: { 
              unsubscribe: jest.fn() 
            } 
          },
        };
      });
      
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Simuler un événement de connexion
      authCallback('SIGNED_IN', mockSession);

      await waitFor(() => {
        expect(result.current.user).toEqual(mockSession.user);
        expect(result.current.session).toEqual(mockSession);
      });
    });
  });

  describe('Error Handling', () => {
    it('devrait lancer une erreur si utilisé hors du Provider', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      spy.mockRestore();
    });

    it('devrait gérer les erreurs de getSession', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: { message: 'Erreur de récupération de session' },
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });
  });

  describe('Contexte values', () => {
    it('devrait fournir toutes les valeurs du contexte', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current).toHaveProperty('user');
      expect(result.current).toHaveProperty('session');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('signOut');
    });

    it('signOut devrait être une fonction', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(typeof result.current.signOut).toBe('function');
    });
  });
});


