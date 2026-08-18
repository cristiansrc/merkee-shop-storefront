/**
 * Tests para authSlice.
 * Verifica estado inicial, reducers y thunks.
 */

import { describe, it, expect } from 'vitest';
import { authReducer, clearAuthError, setUser } from './authSlice';

describe('authSlice', () => {
  const initialState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  };

  it('debería tener estado inicial correcto', () => {
    const state = authReducer(undefined, { type: 'unknown' });
    expect(state).toEqual(initialState);
  });

  it('debería limpiar error', () => {
    const stateWithError = {
      ...initialState,
      error: 'Error de prueba',
    };
    const state = authReducer(stateWithError, clearAuthError());
    expect(state.error).toBeNull();
  });

  it('debería establecer usuario', () => {
    const user = {
      id: '123',
      display_name: 'Test User',
      email: 'test@example.com',
      role: 'cliente' as const,
      must_change_password: false,
      phone: null,
    };
    const state = authReducer(initialState, setUser(user));
    expect(state.user).toEqual(user);
    expect(state.isAuthenticated).toBe(true);
  });
});
