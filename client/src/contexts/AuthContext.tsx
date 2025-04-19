import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import { User, AuthContextType } from '../features/auth/types/auth-types';
import {
  getProfile,
  login,
  logout,
  register,
} from '../features/auth/api/authApi';
import { tokenService } from '../utils/tokenService';
import { AxiosError } from 'axios';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider Component
 *
 * Provides authentication state and methods to the entire application
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAuthenticated = useMemo(() => !!user, [user]);

  const handleGetProfile = useCallback(async (): Promise<User | null> => {
    try {
      const response = await getProfile();

      if (response.success && response.user) {
        setUser(response.user);
      }

      return response.user;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An error occurred during login'
      );
      return null;
    }
  }, []);

  /**
   * Login handler - authenticates user with provided credentials
   */
  const handleLogin = useCallback(
    async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }): Promise<void> => {
      setLoading(true);
      setError(null);
      console.log('LOGIN');

      try {
        const response = await login({ email, password });

        if (response.success && response.token) {
          console.log('response.token', response.token);
          tokenService.saveToken(response.token);
        }

        const user = await handleGetProfile();

        if (user) {
          setUser(user);
          console.log('response.token', response.token);
        } else {
          throw new Error('Login failed');
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An error occurred during login'
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [handleGetProfile]
  );

  /**
   * Register handler - creates a new user account
   */
  const handleRegister = useCallback(
    async (name: string, email: string, password: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const response = await register({ name, email, password });

        if (response.success && response.user) {
          setUser(response.user);
        } else {
          console.log('HERE1', response);
          setError(response.message || 'Registration failed');
        }
      } catch (err) {
        console.log(
          'HERE2',
          err,
          err instanceof Error,
          err instanceof AxiosError
        );

        setError(
          err instanceof AxiosError
            ? err.response?.data.message
            : 'An error occurred during registration'
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Logout handler - ends the user session
   */
  const handleLogout = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      await logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Still clear the user state even if API call fails
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear any auth-related errors
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const contextValue = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      error,
      isAuthenticated,
      handleLogin: handleLogin,
      handleRegister: handleRegister,
      logout: handleLogout,
      clearError,
    }),
    [
      user,
      loading,
      error,
      isAuthenticated,
      handleLogin,
      handleRegister,
      handleLogout,
      clearError,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

/**
 * Custom hook to access the auth context
 *
 * @throws Error if used outside of AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
