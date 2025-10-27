import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { AuthProvider } from '../../components/auth/AuthProvider';
import { supabase } from '../../lib/supabase';

jest.mock('../../lib/supabase');

describe('Authentication Flow - Intégration', () => {
  const mockUser = {
    id: '123',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  };

  const mockSession = {
    user: mockUser,
    access_token: 'mock-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Flux de connexion complet', () => {
    it('devrait permettre à un utilisateur de se connecter avec succès', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const TestLoginComponent = () => {
        const [email, setEmail] = React.useState('');
        const [password, setPassword] = React.useState('');
        const [error, setError] = React.useState('');
        const [success, setSuccess] = React.useState(false);

        const handleLogin = async () => {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            setError(error.message);
          } else {
            setSuccess(true);
          }
        };

        return (
          <>
            <input
              testID="email-input"
              placeholder="Email"
              value={email}
              onChange={(e: any) => setEmail(e.target.value)}
            />
            <input
              testID="password-input"
              placeholder="Mot de passe"
              value={password}
              onChange={(e: any) => setPassword(e.target.value)}
              type="password"
            />
            <button testID="login-button" onClick={handleLogin}>
              Se connecter
            </button>
            {error && <div testID="error-message">{error}</div>}
            {success && <div testID="success-message">Connexion réussie</div>}
          </>
        );
      };

      const { getByTestId } = render(
        <AuthProvider>
          <TestLoginComponent />
        </AuthProvider>
      );

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const loginButton = getByTestId('login-button');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      await waitFor(() => {
        expect(getByTestId('success-message')).toBeTruthy();
      });
    });

    it('devrait afficher une erreur si les identifiants sont incorrects', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Identifiants invalides' },
      });

      const TestLoginComponent = () => {
        const [error, setError] = React.useState('');

        const handleLogin = async () => {
          const { error } = await supabase.auth.signInWithPassword({
            email: 'wrong@example.com',
            password: 'wrongpassword',
          });

          if (error) {
            setError(error.message);
          }
        };

        return (
          <>
            <button testID="login-button" onClick={handleLogin}>
              Se connecter
            </button>
            {error && <div testID="error-message">{error}</div>}
          </>
        );
      };

      const { getByTestId } = render(<TestLoginComponent />);

      fireEvent.click(getByTestId('login-button'));

      await waitFor(() => {
        expect(getByTestId('error-message').props.children).toBe(
          'Identifiants invalides'
        );
      });
    });
  });

  describe('Flux d\'inscription complet', () => {
    it('devrait permettre à un utilisateur de s\'inscrire', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: {
          user: mockUser,
          session: mockSession,
        },
        error: null,
      });

      const TestRegisterComponent = () => {
        const [success, setSuccess] = React.useState(false);

        const handleRegister = async () => {
          const { error } = await supabase.auth.signUp({
            email: 'newuser@example.com',
            password: 'StrongPass123',
          });

          if (!error) {
            setSuccess(true);
          }
        };

        return (
          <>
            <button testID="register-button" onClick={handleRegister}>
              S'inscrire
            </button>
            {success && <div testID="success-message">Inscription réussie</div>}
          </>
        );
      };

      const { getByTestId } = render(<TestRegisterComponent />);

      fireEvent.click(getByTestId('register-button'));

      await waitFor(() => {
        expect(supabase.auth.signUp).toHaveBeenCalledWith({
          email: 'newuser@example.com',
          password: 'StrongPass123',
        });
      });

      await waitFor(() => {
        expect(getByTestId('success-message')).toBeTruthy();
      });
    });
  });

  describe('Flux de déconnexion', () => {
    it('devrait permettre à un utilisateur de se déconnecter', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: null,
      });

      const TestLogoutComponent = () => {
        const [loggedOut, setLoggedOut] = React.useState(false);

        const handleLogout = async () => {
          await supabase.auth.signOut();
          setLoggedOut(true);
        };

        return (
          <>
            <button testID="logout-button" onClick={handleLogout}>
              Se déconnecter
            </button>
            {loggedOut && <div testID="logout-message">Déconnecté</div>}
          </>
        );
      };

      const { getByTestId } = render(
        <AuthProvider>
          <TestLogoutComponent />
        </AuthProvider>
      );

      fireEvent.click(getByTestId('logout-button'));

      await waitFor(() => {
        expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        expect(getByTestId('logout-message')).toBeTruthy();
      });
    });
  });

  describe('Flux de réinitialisation de mot de passe', () => {
    it('devrait permettre de demander une réinitialisation de mot de passe', async () => {
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        data: {},
        error: null,
      });

      const TestResetPasswordComponent = () => {
        const [success, setSuccess] = React.useState(false);

        const handleResetPassword = async () => {
          const { error } = await supabase.auth.resetPasswordForEmail(
            'user@example.com'
          );

          if (!error) {
            setSuccess(true);
          }
        };

        return (
          <>
            <button testID="reset-button" onClick={handleResetPassword}>
              Réinitialiser le mot de passe
            </button>
            {success && (
              <div testID="success-message">Email de réinitialisation envoyé</div>
            )}
          </>
        );
      };

      const { getByTestId } = render(<TestResetPasswordComponent />);

      fireEvent.click(getByTestId('reset-button'));

      await waitFor(() => {
        expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
          'user@example.com'
        );
      });

      await waitFor(() => {
        expect(getByTestId('success-message')).toBeTruthy();
      });
    });
  });
});






