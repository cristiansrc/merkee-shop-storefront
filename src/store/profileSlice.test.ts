/**
 * Tests para profileSlice.
 * Verifica estado inicial y reducers.
 */

import { describe, it, expect } from 'vitest';
import { profileReducer, clearProfileError, clearPasswordChangeError, clearSuccessMessage, setUserProfile } from './profileSlice';

describe('profileSlice', () => {
  const initialState = {
    user: null,
    loading: false,
    error: null,
    successMessage: null,
    passwordChangeLoading: false,
    passwordChangeError: null,
    resetRequestLoading: false,
    resetRequestSent: false,
  };

  it('debería tener estado inicial correcto', () => {
    const state = profileReducer(undefined, { type: 'unknown' });
    expect(state).toEqual(initialState);
  });

  it('debería limpiar error de perfil', () => {
    const stateWithError = {
      ...initialState,
      error: 'Error de prueba',
    };
    const state = profileReducer(stateWithError, clearProfileError());
    expect(state.error).toBeNull();
  });

  it('debería limpiar error de cambio de contraseña', () => {
    const stateWithError = {
      ...initialState,
      passwordChangeError: 'Error de contraseña',
    };
    const state = profileReducer(stateWithError, clearPasswordChangeError());
    expect(state.passwordChangeError).toBeNull();
  });

  it('debería limpiar mensaje de éxito', () => {
    const stateWithSuccess = {
      ...initialState,
      successMessage: 'Perfil actualizado',
    };
    const state = profileReducer(stateWithSuccess, clearSuccessMessage());
    expect(state.successMessage).toBeNull();
  });

  it('debería establecer usuario del perfil', () => {
    const user = {
      id: '123',
      display_name: 'Test User',
      email: 'test@example.com',
      role: 'cliente' as const,
      must_change_password: false,
      phone: null,
    };
    const state = profileReducer(initialState, setUserProfile(user));
    expect(state.user).toEqual(user);
  });
});
