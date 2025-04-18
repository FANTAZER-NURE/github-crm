import authReducer, { AuthState } from './slices/authSlice';
import toastReducer, { ToastState } from './slices/toastSlice';
import { configureStore, ThunkDispatch, AnyAction } from '@reduxjs/toolkit';

const store = configureStore({
  reducer: {
    auth: authReducer,
    toast: toastReducer,
  },
});

export type RootState = {
  auth: AuthState;
  toast: ToastState;
};

export type AppDispatch = ThunkDispatch<RootState, undefined, AnyAction>;

export default store;
