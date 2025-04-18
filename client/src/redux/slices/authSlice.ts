import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  User,
  LoginData,
  RegisterData,
} from '../../features/auth/types/auth-types';
import {
  getProfile,
  login,
  logout,
  register,
} from '../../features/auth/api/authApi';
import { tokenService } from '../../utils/tokenService';
import { AxiosError } from 'axios';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: LoginData, { dispatch, rejectWithValue }) => {
    try {
      const response = await login({ email, password });

      if (response.success && response.token) {
        tokenService.saveToken(response.token);
        // After login, get the user profile
        await dispatch(fetchUserProfile());
        return response;
      }

      return rejectWithValue('Login failed: Invalid credentials');
    } catch (err) {
      const error = err as Error;
      return rejectWithValue(error.message || 'An error occurred during login');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await register(userData);

      if (response.success && response.user) {
        return response.user;
      }

      return rejectWithValue(response.message || 'Registration failed');
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        return rejectWithValue(
          err.response.data.message || 'Registration failed'
        );
      }
      return rejectWithValue('An error occurred during registration');
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getProfile();

      if (response.success && response.user) {
        return response.user;
      }

      return rejectWithValue('Failed to fetch user profile');
    } catch (err) {
      const error = err as Error;
      return rejectWithValue(
        error.message || 'An error occurred while fetching user profile'
      );
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try {
    await logout();
    tokenService.removeToken();
    return null;
  } catch (err) {
    console.error('Logout error:', err);
    // Still return success even if API call fails
    tokenService.removeToken();
    return null;
  }
});

  const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchUserProfile.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.loading = false;
          state.user = action.payload;
          state.isAuthenticated = true;
        }
      )
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError } = authSlice.actions;

export default authSlice.reducer;
