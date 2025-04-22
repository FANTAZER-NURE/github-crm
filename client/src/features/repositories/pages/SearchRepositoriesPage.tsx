import React, { useMemo } from 'react';
import { H2 } from '@blueprintjs/core';
import styles from '../styles/RepositoriesPage.module.scss';
import { SearchRepositoriesSection } from '../components/SearchRepositoriesSection';
import { useAuthActions } from '../../auth/hooks/use-auth-actions';
const SearchRepositoriesPage: React.FC = () => {
  const { user } = useAuthActions();

  const greeting = useMemo(() => {
    return user ? `Welcome back, ${user.name}!` : 'Welcome!';
  }, [user]);

  return (
    <div className={styles.pageContainer}>
      <H2>{greeting}</H2>
      <SearchRepositoriesSection />
    </div>
  );
};

export default SearchRepositoriesPage;
