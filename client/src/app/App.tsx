import { lazy, Suspense, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import styles from './App.module.scss';
import { ProtectedRoute } from '../shared/components/ProtectedRoute';
import { OverlayToaster, Spinner } from '@blueprintjs/core';
import Header from '../shared/components/Header';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('../features/auth/pages/RegisterPage'));
const ProfilePage = lazy(() => import('../features/profile/pages/ProfilePage'));
const RepositoriesPage = lazy(
  () => import('../features/repositories/pages/RepositoriesPage')
);
const SearchRepositoriesPage = lazy(
  () => import('../features/repositories/pages/SearchRepositoriesPage')
);

function App() {
  const { isAuthenticated, loading } = useAuth();
  const { getToaster } = useToast();

  const renderLoader = useCallback(() => {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size={50} />
      </div>
    );
  }, []);

  if (loading) {
    return renderLoader();
  }

  return (
    <div className={`${styles.appContainer} bp5-dark`}>
      {isAuthenticated && <Header />}
      <main className={styles.appContent}>
        <Suspense fallback={renderLoader()}>
          <Routes>
            <Route element={<ProtectedRoute requireAuth={false} />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            <Route element={<ProtectedRoute requireAuth={true} />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/repositories" element={<RepositoriesPage />} />
              <Route path="/" element={<SearchRepositoriesPage />} />
            </Route>

            <Route
              path="*"
              element={<Navigate to={isAuthenticated ? '/' : '/login'} />}
            />
          </Routes>
        </Suspense>
        <OverlayToaster
          ref={getToaster().ref}
          position={getToaster().position}
        />
      </main>
    </div>
  );
}

export default App;
