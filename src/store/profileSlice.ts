/**
 * Slice de Redux para perfil de usuario.
 * Estado de vista derivado del servidor.
 * NO persiste datos sensibles en navegador.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { UserResponse } from '../types/api';
import {
  updateMyProfile,
  changePassword,
  requestPasswordReset,
  resetPassword,
} from '../api/client';

// === Estado del slice ===
interface ProfileState {
  user: UserResponse | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  passwordChangeLoading: boolean;
  passwordChangeError: string | null;
  resetRequestLoading: boolean;
  resetRequestSent: boolean;
}

const initialState: ProfileState = {
  user: null,
  loading: false,
  error: null,
  successMessage: null,
  passwordChangeLoading: false,
  passwordChangeError: null,
  resetRequestLoading: false,
  resetRequestSent: false,
};

// === Async Thunks ===

export const updateProfile = createAsyncThunk(
  'profile/update',
  async (
    request: { display_name?: string; phone?: string | null },
    { rejectWithValue },
  ) => {
    try {
      return await updateMyProfile(request);
    } catch (err: unknown) {
      const error = err as { message?: string; code?: string };
      return rejectWithValue(error.message || 'Error al actualizar perfil');
    }
  },
);

export const changeUserPassword = createAsyncThunk(
  'profile/changePassword',
  async (
    request: { current_password: string; new_password: string },
    { rejectWithValue },
  ) => {
    try {
      await changePassword(request);
      return true;
    } catch (err: unknown) {
      const error = err as { message?: string; code?: string };
      return rejectWithValue(error.message || 'Error al cambiar contraseña');
    }
  },
);

export const sendPasswordResetRequest = createAsyncThunk(
  'profile/requestReset',
  async (email: string, { rejectWithValue }) => {
    try {
      await requestPasswordReset({ email });
      return true;
    } catch (err: unknown) {
      const error = err as { message?: string };
      return rejectWithValue(error.message || 'Error al solicitar restablecimiento');
    }
  },
);

export const confirmPasswordReset = createAsyncThunk(
  'profile/confirmReset',
  async (
    request: { token: string; new_password: string },
    { rejectWithValue },
  ) => {
    try {
      await resetPassword(request);
      return true;
    } catch (err: unknown) {
      const error = err as { message?: string; code?: string };
      return rejectWithValue(error.message || 'Error al restablecer contraseña');
    }
  },
);

// === Slice ===
const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfileError(state) {
      state.error = null;
    },
    clearPasswordChangeError(state) {
      state.passwordChangeError = null;
    },
    clearSuccessMessage(state) {
      state.successMessage = null;
    },
    setUserProfile(state, action) {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Update Profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.successMessage = 'Perfil actualizado correctamente';
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Change Password
    builder
      .addCase(changeUserPassword.pending, (state) => {
        state.passwordChangeLoading = true;
        state.passwordChangeError = null;
        state.successMessage = null;
      })
      .addCase(changeUserPassword.fulfilled, (state) => {
        state.passwordChangeLoading = false;
        state.successMessage = 'Contraseña cambiada correctamente';
      })
      .addCase(changeUserPassword.rejected, (state, action) => {
        state.passwordChangeLoading = false;
        state.passwordChangeError = action.payload as string;
      });

    // Request Password Reset
    builder
      .addCase(sendPasswordResetRequest.pending, (state) => {
        state.resetRequestLoading = true;
        state.error = null;
      })
      .addCase(sendPasswordResetRequest.fulfilled, (state) => {
        state.resetRequestLoading = false;
        state.resetRequestSent = true;
      })
      .addCase(sendPasswordResetRequest.rejected, (state, action) => {
        state.resetRequestLoading = false;
        state.error = action.payload as string;
      });

    // Confirm Password Reset
    builder
      .addCase(confirmPasswordReset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmPasswordReset.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = 'Contraseña restablecida correctamente';
      })
      .addCase(confirmPasswordReset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Selectors
export const selectProfile = (state: { profile: ProfileState }): UserResponse | null =>
  state.profile.user;

export const selectProfileLoading = (state: { profile: ProfileState }): boolean =>
  state.profile.loading;

export const selectProfileError = (state: { profile: ProfileState }): string | null =>
  state.profile.error;

export const selectProfileSuccess = (state: { profile: ProfileState }): string | null =>
  state.profile.successMessage;

export const selectPasswordChangeLoading = (state: { profile: ProfileState }): boolean =>
  state.profile.passwordChangeLoading;

export const selectPasswordChangeError = (state: { profile: ProfileState }): string | null =>
  state.profile.passwordChangeError;

export const {
  clearProfileError,
  clearPasswordChangeError,
  clearSuccessMessage,
  setUserProfile,
} = profileSlice.actions;
export const profileReducer = profileSlice.reducer;
