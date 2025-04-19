import authReducer, { AuthState } from './slices/authSlice';
import toastReducer, { ToastState } from './slices/toastSlice';
import { configureStore, ThunkDispatch, AnyAction } from '@reduxjs/toolkit';

// export const store = configureStore({
//   reducer: {
//     auth: authReducer,
//     toast: toastReducer,
//   },
// });

// // export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

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
