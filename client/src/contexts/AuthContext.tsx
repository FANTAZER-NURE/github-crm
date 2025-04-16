import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import { User, AuthContextType } from '../features/auth/types/auth-types';
import { useAuthApi } from '../features/auth/api/authApi';
import axios from 'axios';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Time before token expiry to trigger refresh (5 minutes in ms)
const REFRESH_TOKEN_THRESHOLD = 5 * 60 * 1000;

/**
 * Auth Provider Component
 *
 * Provides authentication state and methods to the entire application
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenExpiryTime, setTokenExpiryTime] = useState<number | null>(null);
  const authApi = useAuthApi();
  const isAuthenticated = useMemo(() => !!user, [user]);

  /**
   * Refresh the access token using the refresh token
   */
  const refreshTokens = useCallback(async (): Promise<boolean> => {
    try {
      const response = await authApi.refreshToken();

      if (response.success) {
        // Refresh was successful - update token expiry
        // Default to 1 hour if we don't know the exact time
        setTokenExpiryTime(Date.now() + 60 * 60 * 1000);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error refreshing token:', err);
      return false;
    }
  }, [authApi]);

  // Set up a timer to refresh the token
  useEffect(() => {
    let refreshTimeout: ReturnType<typeof setTimeout> | null = null;

    if (isAuthenticated && tokenExpiryTime) {
      const timeToRefresh =
        tokenExpiryTime - Date.now() - REFRESH_TOKEN_THRESHOLD;

      if (timeToRefresh <= 0) {
        // Refresh immediately if token is about to expire or already expired
        refreshTokens();
      } else {
        // Schedule a refresh
        refreshTimeout = setTimeout(() => {
          refreshTokens();
        }, timeToRefresh);
      }
    }

    return () => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
    };
  }, [isAuthenticated, tokenExpiryTime, refreshTokens]);

  /**
   * Initialize auth state
   * Attempts to restore user session on app load
   */
  const initialize = useCallback(async () => {
    try {
      const response = await authApi.getProfile();

      if (response.success && response.user) {
        setUser(response.user);

        // Calculate token expiry based on current time and the standard JWT expiry
        // We don't know the exact expiry time from the cookie, so default to 1 hour
        setTokenExpiryTime(Date.now() + 60 * 60 * 1000);
      }
    } catch (err) {
      console.log('Auth Provider: error during initialization', err);

      // Try to refresh the token if the error is due to token expiration
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        try {
          await refreshTokens();
          // If refresh was successful, try to get profile again
          await initialize();
          return;
        } catch (refreshError) {
          // Silent failure on refresh - user is not authenticated
          console.log(
            'Token refresh failed during initialization',
            refreshError
          );
        }
      }
    } finally {
      setLoading(false);
    }
  }, [authApi, refreshTokens]);

  // Initialize on component mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  /**
   * Login handler - authenticates user with provided credentials
   */
  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const response = await authApi.login({ email, password });

        if (response.success && response.user) {
          setUser(response.user);
          // Set token expiry based on current time plus JWT expiration (default 1 hour)
          setTokenExpiryTime(Date.now() + 60 * 60 * 1000);
        } else {
          throw new Error(response.message || 'Login failed');
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
    [authApi]
  );

  /**
   * Register handler - creates a new user account
   */
  const register = useCallback(
    async (name: string, email: string, password: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const response = await authApi.register({ name, email, password });

        if (response.success && response.user) {
          setUser(response.user);
          // Set token expiry based on current time plus JWT expiration (default 1 hour)
          setTokenExpiryTime(Date.now() + 60 * 60 * 1000);
        } else {
          throw new Error(response.message || 'Registration failed');
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'An error occurred during registration'
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [authApi]
  );

  /**
   * Logout handler - ends the user session
   */
  const logout = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      await authApi.logout();
      setUser(null);
      setTokenExpiryTime(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Still clear the user state even if API call fails
      setUser(null);
      setTokenExpiryTime(null);
    } finally {
      setLoading(false);
    }
  }, [authApi]);

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
      login,
      register,
      logout,
      clearError,
      refreshTokens,
    }),
    [
      user,
      loading,
      error,
      isAuthenticated,
      login,
      register,
      logout,
      clearError,
      refreshTokens,
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
