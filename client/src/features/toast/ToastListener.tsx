import React, { useRef, useEffect, useCallback } from 'react';
import { Position, OverlayToaster } from '@blueprintjs/core';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { hideToast } from '../../redux/slices/toastSlice';

const ToastListener: React.FC = () => {
  const toasterRef = useRef<OverlayToaster | null>(null);
  const dispatch = useAppDispatch();
  const { message, intent, timeout, isVisible } = useAppSelector(
    (state) => state.toast
  );

  const getToaster = useCallback(() => {
    return {
      ref: toasterRef as React.RefObject<OverlayToaster>,
      position: Position.BOTTOM_RIGHT,
    };
  }, []);

  useEffect(() => {
    if (isVisible && message && intent) {
      const toaster = getToaster().ref.current;
      const toastKey = toaster?.show({ message, intent, timeout });

      // Hide toast in Redux state after it's shown
      setTimeout(() => {
        dispatch(hideToast());
      }, timeout);

      return () => {
        if (toastKey !== undefined) {
          toaster?.dismiss(toastKey);
        }
      };
    }

    return () => {
      if (toasterRef.current) {
        toasterRef.current.clear();
      }
    };
  }, [isVisible, message, intent, timeout, dispatch, getToaster]);

  return <OverlayToaster position={Position.BOTTOM_RIGHT} ref={toasterRef} />;
};

export default ToastListener;
