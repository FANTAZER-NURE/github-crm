import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@blueprintjs/core';
import { useAuthActions } from '../features/auth/hooks/use-auth-actions';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuthActions();
  const navigate = useNavigate();

  const displayName = useMemo(() => user?.name || 'User', [user]);
  const email = useMemo(() => user?.email || '', [user]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate even if logout fails
      navigate('/login');
    }
  }, [logout, navigate]);

  return (
    <div className="profile-page">
      <h1>Profile</h1>

      <div className="profile-info">
        <div className="info-item">
          <strong>Name:</strong>
          <span>{displayName}</span>
        </div>

        <div className="info-item">
          <strong>Email:</strong>
          <span>{email}</span>
        </div>
      </div>

      <div className="profile-actions">
        <Button onClick={handleLogout} className="logout-button">
          Logout
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;
