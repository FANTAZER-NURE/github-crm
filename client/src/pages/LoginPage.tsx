import React from 'react';
import styles from '../features/auth/styles/auth.module.scss';
import { LoginForm } from '../features/auth/components/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <div className={styles.authPage}>
      <LoginForm />
    </div>
  );
};

export default LoginPage;
