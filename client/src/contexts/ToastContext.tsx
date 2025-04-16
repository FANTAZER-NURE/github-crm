import React, { createContext, useContext, useRef, useCallback } from 'react';
import {
  Intent,
  OverlayToaster,
  Position,
  Toaster,
  ToasterPosition,
} from '@blueprintjs/core';

interface ToastContextValue {
  showToast: (message: string, intent: Intent, timeout?: number) => void;
  showSuccess: (message: string, timeout?: number) => void;
  showError: (message: string, timeout?: number) => void;
  showWarning: (message: string, timeout?: number) => void;
  toasterRef: React.RefObject<Toaster | null>;
  getToaster: () => {
    ref: React.RefObject<OverlayToaster | null>;
    position: ToasterPosition;
  };
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const toasterRef = useRef<Toaster | null>(null);

  const getToaster = useCallback(() => {
    return {
      ref: toasterRef as React.RefObject<OverlayToaster>,
      position: Position.BOTTOM_RIGHT,
    };
  }, []);

  const showToast = useCallback(
    (message: string, intent: Intent, timeout = 3000) => {
      const toaster = getToaster().ref.current;
      toaster?.show({ message, intent, timeout });
    },
    [getToaster]
  );

  const showSuccess = useCallback(
    (message: string, timeout = 3000) => {
      showToast(message, Intent.SUCCESS, timeout);
    },
    [showToast]
  );

  const showError = useCallback(
    (message: string, timeout = 5000) => {
      showToast(message, Intent.DANGER, timeout);
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message: string, timeout = 4000) => {
      showToast(message, Intent.WARNING, timeout);
    },
    [showToast]
  );

  const value = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    toasterRef,
    getToaster,
  };

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
