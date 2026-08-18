/**
 * Slice de Redux para autenticación.
 * Estado de vista derivado del servidor.
 * Access token en memoria, cookie HttpOnly gestionada por browser.
 * NO persiste tokens en localStorage/sessionStorage.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { UserResponse, SessionResponse } from '../types/api';
import {
  register as apiRegister,
  login as apiLogin,
  refreshSession as apiRefreshSession,
  logout as apiLogout,
  getMyProfile,
} from '../api/client';

// === Estado del slice ===
interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// === Async Thunks ===

export const registerUser = createAsyncThunk(
  'auth/register',
  async (
    request: { display_name: string; email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const response: SessionResponse = await apiRegister(request);
      return response.user;
    } catch (err: unknown) {
      const error = err as { message?: string; code?: string };
      return rejectWithValue(error.message || 'Error al registrar');
    }
  },
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (
    request: { email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const response: SessionResponse = await apiLogin(request);
      return response.user;
    } catch (err: unknown) {
      const error = err as { message?: string; code?: string };
      return rejectWithValue(error.message || 'Error al iniciar sesión');
    }
  },
);

export const refreshUser = createAsyncThunk(
  'auth/refresh',
  async (_, { rejectWithValue }) => {
    try {
      const response: SessionResponse = await apiRefreshSession();
      return response.user;
    } catch (err: unknown) {
      const error = err as { message?: string };
      return rejectWithValue(error.message || 'Sesión expirada');
    }
  },
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await apiLogout();
    } catch (err: unknown) {
      const error = err as { message?: string };
      return rejectWithValue(error.message || 'Error al cerrar sesión');
    }
  },
);

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await getMyProfile();
    } catch (err: unknown) {
      const error = err as { message?: string };
      return rejectWithValue(error.message || 'Error al cargar perfil');
    }
  },
);

// === Slice ===
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    setUser(state, action) {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Refresh
    builder
      .addCase(refreshUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(refreshUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      });

    // Fetch Profile
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }): UserResponse | null =>
  state.auth.user;

export const selectIsAuthenticated = (state: { auth: AuthState }): boolean =>
  state.auth.isAuthenticated;

export const selectIsAdmin = (state: { auth: AuthState }): boolean =>
  state.auth.user?.role === 'admin';

export const selectMustChangePassword = (state: { auth: AuthState }): boolean =>
  state.auth.user?.must_change_password ?? false;

export const { clearAuthError, setUser } = authSlice.actions;
export const authReducer = authSlice.reducer;
