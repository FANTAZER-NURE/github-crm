import { useCallback, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/auth.module.scss';
import {
  Button,
  Callout,
  Card,
  FormGroup,
  InputGroup,
  Intent,
} from '@blueprintjs/core';
import { VerticalSpacing } from '../../../shared/ui/VerticalSpacing';
import { IconNames } from '@blueprintjs/icons';
import { useAuthActions } from '../hooks/use-auth-actions';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const { error, handleLogin, handleClearError, isAuthenticated } =
    useAuthActions();

  // Get redirect URL from query parameters or use default
  const getRedirectUrl = useCallback(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('redirect') || '/';
  }, [location.search]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(getRedirectUrl());
    }
  }, [isAuthenticated, navigate, getRedirectUrl]);

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
      handleClearError();
      setFormError('');
    },
    [handleClearError]
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
      handleClearError();
      setFormError('');
    },
    [handleClearError]
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

      await handleLogin({ email, password });
      navigate(getRedirectUrl());
    },
    [validateForm, handleLogin, email, password, navigate, getRedirectUrl]
  );

  return (
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
  );
};
