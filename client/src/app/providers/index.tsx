import React, { ReactNode, useEffect, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { fetchUserProfile } from '../../redux/slices/authSlice';
import ToastListener from '../../features/toast/ToastListener';
import { tokenService } from '../../utils/tokenService';
import store from '../../redux/store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 60000,
    },
  },
});

interface ProvidersProps {
  children: ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  const initializeAuth = useCallback(async () => {
    if (tokenService.getToken()) {
      try {
        store.dispatch(fetchUserProfile());
      } catch (error) {
        console.error('Failed to restore session:', error);
      }
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ToastListener />
        {children}
      </QueryClientProvider>
    </Provider>
  );
};
