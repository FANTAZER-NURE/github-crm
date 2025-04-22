import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import {
  loginUser,
  registerUser,
  logoutUser,
  clearError,
  fetchUserProfile,
} from '../../../redux/slices/authSlice';
import { LoginData } from '../types/auth-types';

export const useAuthActions = () => {
  const dispatch = useAppDispatch();
  const { user, loading, error, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );

  const handleLogin = useCallback(
    async (credentials: LoginData): Promise<void> => {
      await dispatch(loginUser(credentials)).unwrap();
    },
    [dispatch]
  );

  const handleRegister = useCallback(
    async (name: string, email: string, password: string): Promise<void> => {
      await dispatch(registerUser({ name, email, password })).unwrap();
    },
    [dispatch]
  );

  const handleLogout = useCallback(async (): Promise<void> => {
    await dispatch(logoutUser());
  }, [dispatch]);

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleGetProfile = useCallback(async () => {
    try {
      const user = await dispatch(fetchUserProfile()).unwrap();
      return user;
    } catch {
      return null;
    }
  }, [dispatch]);

  return {
    user,
    loading,
    error,
    isAuthenticated,
    handleLogin,
    handleRegister,
    logout: handleLogout,
    handleClearError,
    handleGetProfile,
  };
};
