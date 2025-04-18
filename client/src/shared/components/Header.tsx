import React, { useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Button, Alignment, Tab, Tabs, Tag } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import styles from './Header.module.scss';
import { useAuthActions } from '../../features/auth/hooks/useAuthActions';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isAuthenticated, user } = useAuthActions();

  const currentPath = useMemo(() => {
    if (location.pathname === '/profile') return 'profile';
    if (location.pathname === '/repositories') return 'repositories';
    return 'dashboard';
  }, [location.pathname]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const handleTabChange = useCallback(
    (navTabId: string) => {
      switch (navTabId) {
        case 'dashboard':
          navigate('/');
          break;
        case 'profile':
          navigate('/profile');
          break;
        case 'repositories':
          navigate('/repositories');
          break;
        default:
          navigate('/');
      }
    },
    [navigate]
  );

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.headerContainer}>
      <Navbar className={styles.navbar}>
        <Navbar.Group align={Alignment.LEFT}>
          <Navbar.Heading className={styles.logo}>GitHub CRM</Navbar.Heading>
          <Navbar.Divider />
          <Tabs
            id="navbar-tabs"
            className={styles.navTabs}
            selectedTabId={currentPath}
            onChange={handleTabChange}
            animate
          >
            <Tab
              id="dashboard"
              title="Dashboard"
              icon={IconNames.DASHBOARD}
              className={styles.tab}
            />
            <Tab
              id="repositories"
              title="My Repositories"
              icon={IconNames.GIT_REPO}
              className={styles.tab}
            />

            <Tab
              id="profile"
              title="Profile"
              icon={IconNames.USER}
              className={styles.tab}
            />
          </Tabs>
        </Navbar.Group>
        <Navbar.Group align={Alignment.RIGHT}>
          <Tag
            intent="primary"
            round
            minimal
            icon={IconNames.USER}
            size="large"
          >
            {user?.name}
          </Tag>
          <Button
            icon={IconNames.LOG_OUT}
            text="Logout"
            variant="minimal"
            onClick={handleLogout}
            className={styles.logoutButton}
          />
        </Navbar.Group>
      </Navbar>
    </div>
  );
};

export default Header;
