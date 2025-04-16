import React, { useCallback, useMemo } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { Spinner } from '@blueprintjs/core';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requireAuth = true,
}) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  const checkAccess = useCallback(() => {
    if (loading) {
      return { hasAccess: false, redirectTo: null };
    }

    if (requireAuth) {
      if (!isAuthenticated) {
        return {
          hasAccess: false,
          redirectTo: `/login?redirect=${encodeURIComponent(
            location.pathname
          )}`,
        };
      }

      return { hasAccess: true, redirectTo: null };
    } else {
      if (isAuthenticated) {
        return { hasAccess: false, redirectTo: '/' };
      }
      return { hasAccess: true, redirectTo: null };
    }
  }, [loading, requireAuth, isAuthenticated, location.pathname]);

  const { hasAccess, redirectTo } = useMemo(() => checkAccess(), [checkAccess]);

  if (loading) {
    // Show loading state while checking authentication
    return (
      <div className="loading-container">
        <Spinner size={50} />
      </div>
    );
  }

  if (!hasAccess && redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};
