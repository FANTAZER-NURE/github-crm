import { useCallback, useMemo } from 'react';
import { AxiosError } from 'axios';
import {
  AuthResponse,
  ErrorResponse,
  LoginData,
  RegisterData,
  RefreshTokenResponse,
} from '../types/auth-types';
import { api } from '../../../api/client';

export const useAuthApi = () => {
  const register = useCallback(
    async (userData: RegisterData): Promise<AuthResponse> => {
      try {
        const response = await api.postApi('/auth/register', userData);
        return response as AuthResponse;
      } catch (error) {
        if (error instanceof AxiosError && error.response) {
          throw new Error(
            (error.response.data as ErrorResponse)?.message ||
              'Registration failed'
          );
        }
        throw new Error('Registration failed');
      }
    },
    []
  );

  const login = useCallback(
    async (loginData: LoginData): Promise<AuthResponse> => {
      try {
        const response = await api.postApi('/auth/login', loginData);
        return response as AuthResponse;
      } catch (error) {
        if (error instanceof AxiosError && error.response) {
          throw new Error(
            (error.response.data as ErrorResponse)?.message || 'Login failed'
          );
        }
        throw new Error('Login failed');
      }
    },
    []
  );

  const getProfile = useCallback(async (): Promise<AuthResponse> => {
    try {
      const response = await api.getApi('/auth/profile');
      return response as AuthResponse;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        throw new Error(
          (error.response.data as ErrorResponse)?.message ||
            'Failed to get profile'
        );
      }
      throw new Error('Failed to get profile');
    }
  }, []);

  const refreshToken = useCallback(async (): Promise<RefreshTokenResponse> => {
    try {
      const response = await api.postApi('/auth/refresh-token');
      return response as RefreshTokenResponse;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        throw new Error(
          (error.response.data as ErrorResponse)?.message ||
            'Failed to refresh token'
        );
      }
      throw new Error('Failed to refresh token');
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await api.postApi('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  return useMemo(
    () => ({
      register,
      login,
      getProfile,
      logout,
      refreshToken,
    }),
    [register, login, getProfile, logout, refreshToken]
  );
};
