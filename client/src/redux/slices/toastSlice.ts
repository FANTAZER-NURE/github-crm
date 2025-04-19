import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Intent } from '@blueprintjs/core';

export interface ToastState {
  message: string | null;
  intent: Intent | null;
  timeout: number;
  isVisible: boolean;
}

const initialState: ToastState = {
  message: null,
  intent: null,
  timeout: 3000,
  isVisible: false,
};

export const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    showToast: (
      state,
      action: PayloadAction<{
        message: string;
        intent: Intent;
        timeout?: number;
      }>
    ) => {
      const { message, intent, timeout = 3000 } = action.payload;
      state.message = message;
      state.intent = intent;
      state.timeout = timeout;
      state.isVisible = true;
    },
    hideToast: (state) => {
      state.isVisible = false;
    },
    showSuccess: (
      state,
      action: PayloadAction<{ message: string; timeout?: number }>
    ) => {
      const { message, timeout = 3000 } = action.payload;
      state.message = message;
      state.intent = Intent.SUCCESS;
      state.timeout = timeout;
      state.isVisible = true;
    },
    showError: (
      state,
      action: PayloadAction<{ message: string; timeout?: number }>
    ) => {
      const { message, timeout = 5000 } = action.payload;
      state.message = message;
      state.intent = Intent.DANGER;
      state.timeout = timeout;
      state.isVisible = true;
    },
    showWarning: (
      state,
      action: PayloadAction<{ message: string; timeout?: number }>
    ) => {
      const { message, timeout = 4000 } = action.payload;
      state.message = message;
      state.intent = Intent.WARNING;
      state.timeout = timeout;
      state.isVisible = true;
    },
  },
});

export const { showToast, hideToast, showSuccess, showError, showWarning } =
  toastSlice.actions;

export default toastSlice.reducer;
