import { Button } from '@blueprintjs/core';

import { useCallback, useMemo, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import {
  Card,
  Callout,
  FormGroup,
  InputGroup,
  Intent,
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import styles from '../styles/auth.module.scss';
import { VerticalSpacing } from '../../../shared/ui/VerticalSpacing';
import { Link } from 'react-router-dom';

export const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { handleRegister, error, clearError } = useAuth();

  const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setName(e.target.value);
      // clearError();
      setFormError('');
    },
    [clearError]
  );

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
      // clearError();
      setFormError('');
    },
    [clearError]
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
      // clearError();
      setFormError('');
    },
    [clearError]
  );

  const handleConfirmPasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setConfirmPassword(e.target.value);
      // clearError();
      setFormError('');
    },
    [clearError]
  );

  const validateForm = useCallback(() => {
    if (!name.trim()) {
      setFormError('Name is required');
      return false;
    }

    if (!email.trim()) {
      setFormError('Email is required');
      return false;
    }

    if (!emailRegex.test(email)) {
      setFormError('Please enter a valid email address');
      return false;
    }

    if (!password) {
      setFormError('Password is required');
      return false;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return false;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return false;
    }

    return true;
  }, [name, email, emailRegex, password, confirmPassword]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      await handleRegister(name, email, password);
    },
    [name, email, password, handleRegister, validateForm]
  );
  return (
    <Card className={styles.authCard}>
      <h1>Create Account</h1>

      {(error || formError) && (
        <Callout intent={Intent.DANGER} className={styles.errorMessage}>
          {formError || error}
        </Callout>
      )}

      <FormGroup label="Name">
        <InputGroup
          type="text"
          value={name}
          onChange={handleNameChange}
          placeholder="Enter your name"
          size="large"
          fill
        />
      </FormGroup>

      <VerticalSpacing />

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

      <FormGroup label="Confirm Password">
        <InputGroup
          type="password"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          placeholder="••••••"
          size="large"
          fill
        />
      </FormGroup>

      <VerticalSpacing />

      <Button
        intent={Intent.PRIMARY}
        icon={IconNames.NEW_PERSON}
        text="Create Account"
        fill
        onClick={handleSubmit}
        size="large"
      />

      <div className={styles.authLink}>
        Already have an account? <Link to="/login">Login</Link>
      </div>
    </Card>
  );
};
