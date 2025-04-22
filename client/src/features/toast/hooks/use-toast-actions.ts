import { useCallback } from 'react';
import { Intent } from '@blueprintjs/core';
import { useAppDispatch } from '../../../redux/hooks';
import {
  showError,
  showSuccess,
  showToast,
  showWarning,
} from '../../../redux/slices/toastSlice';

export const useToastActions = () => {
  const dispatch = useAppDispatch();

  const handleShowToast = useCallback(
    (message: string, intent: Intent, timeout?: number) => {
      dispatch(showToast({ message, intent, timeout }));
    },
    [dispatch]
  );

  const handleShowSuccess = useCallback(
    (message: string, timeout?: number) => {
      dispatch(showSuccess({ message, timeout }));
    },
    [dispatch]
  );

  const handleShowError = useCallback(
    (message: string, timeout?: number) => {
      dispatch(showError({ message, timeout }));
    },
    [dispatch]
  );

  const handleShowWarning = useCallback(
    (message: string, timeout?: number) => {
      dispatch(showWarning({ message, timeout }));
    },
    [dispatch]
  );

  return {
    showToast: handleShowToast,
    showSuccess: handleShowSuccess,
    showError: handleShowError,
    showWarning: handleShowWarning,
  };
};
