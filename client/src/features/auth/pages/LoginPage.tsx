import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Button,
  Card,
  FormGroup,
  InputGroup,
  Intent,
  Callout,
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import styles from '../styles/auth.module.scss';
import { VerticalSpacing } from '../../../shared/ui/VerticalSpacing';
import { useAuth } from '../../../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('redirect') || '/';
  }, [location.search]);

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
      clearError();
      setFormError('');
    },
    [clearError]
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
      clearError();
      setFormError('');
    },
    [clearError]
  );

  const validateForm = useCallback(() => {
    if (!email.trim()) {
      setFormError('Email is required');
      return false;
    }

    if (!password) {
      setFormError('Password is required');
      return false;
    }

    return true;
  }, [email, password]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      try {
        await login(email, password);
        navigate(redirectPath);
      } catch {
        // Error is already set in the context
      }
    },
    [email, password, login, navigate, redirectPath, validateForm]
  );

  return (
    <div className={styles.authPage}>
      <Card className={styles.authCard}>
        <h1>Login</h1>

        {(error || formError) && (
          <Callout intent={Intent.DANGER} className={styles.errorMessage}>
            {formError || error}
          </Callout>
        )}

        <FormGroup label="Email">
          <InputGroup
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="test@gmail.com"
            size="large"
            fill
          />
        </FormGroup>

        <VerticalSpacing />

        <FormGroup label="Password">
          <InputGroup
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="••••••"
            size="large"
            fill
          />
        </FormGroup>

        <VerticalSpacing />

        <Button
          type="submit"
          intent={Intent.PRIMARY}
          icon={IconNames.LOG_IN}
          text="Login"
          size="large"
          fill
          onClick={handleSubmit}
        />

        <div className={styles.authLink}>
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
