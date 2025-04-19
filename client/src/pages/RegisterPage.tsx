import React from 'react';
import styles from '../features/auth/styles/auth.module.scss';
import { RegisterForm } from '../features/auth/components/RegisterForm';

const RegisterPage: React.FC = () => {
  return (
    <div className={styles.authPage}>
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;
