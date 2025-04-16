import React from 'react';
import { H2 } from '@blueprintjs/core';
import styles from '../styles/RepositoriesPage.module.scss';
import { RepositoriesSection } from '../components/RepositoriesSection';
import AddRepositoryByPath from '../components/AddRepositoryByPath';

const RepositoriesPage: React.FC = () => {
  return (
    <div className={styles.pageContainer}>
      <H2>My Repositories</H2>
      <AddRepositoryByPath />
      <RepositoriesSection />
    </div>
  );
};

export default RepositoriesPage;
