/**
 * Tests para AuthPage.
 * Verifica sincronización de vista con query param ?view=register.
 * Verifica alternancia de enlaces login/registro sin perder navegación.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { AuthPage } from './AuthPage';
import { authReducer } from '../store/authSlice';
import { profileReducer } from '../store/profileSlice';
import userEvent from '@testing-library/user-event';

// Mock de API client (evita llamadas reales)
vi.mock('../api/client', () => ({
  register: vi.fn().mockResolvedValue({ user: { id: '1', email: 'test@test.com' } }),
  login: vi.fn().mockResolvedValue({ user: { id: '1', email: 'test@test.com' } }),
  refreshSession: vi.fn(),
  logout: vi.fn(),
  getMyProfile: vi.fn(),
}));

vi.mock('../store/profileSlice', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../store/profileSlice')>();
  return {
    ...actual,
    sendPasswordResetRequest: vi.fn().mockResolvedValue({}),
  };
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createTestStore(preloadedState?: any) {
  return configureStore({
    reducer: {
      auth: authReducer,
      profile: profileReducer,
    } as never,
    preloadedState,
  });
}

function renderWithProviders(
  { route = '/login', store }: { route?: string; store?: ReturnType<typeof createTestStore> } = {},
) {
  const testStore = store ?? createTestStore();
  return render(
    <Provider store={testStore}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/registro" element={<AuthPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<div>Inicio</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

describe('AuthPage - Rutas y query params', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra formulario de login por defecto en /login', () => {
    renderWithProviders({ route: '/login' });
    expect(screen.getByRole('form', { name: /formulario de inicio de sesión/i })).toBeInTheDocument();
  });

  it('muestra formulario de registro cuando ?view=register', () => {
    renderWithProviders({ route: '/login?view=register' });
    expect(screen.getByRole('form', { name: /formulario de registro/i })).toBeInTheDocument();
  });

  it('muestra formulario de reset cuando ?view=reset-request', () => {
    renderWithProviders({ route: '/login?view=reset-request' });
    expect(screen.getByRole('form', { name: /formulario de restablecimiento de contraseña/i })).toBeInTheDocument();
  });

  it('muestra login por defecto en /registro (sin query param)', () => {
    renderWithProviders({ route: '/registro' });
    expect(screen.getByRole('form', { name: /formulario de inicio de sesión/i })).toBeInTheDocument();
  });

  it('muestra registro en /registro con ?view=register', () => {
    renderWithProviders({ route: '/registro?view=register' });
    expect(screen.getByRole('form', { name: /formulario de registro/i })).toBeInTheDocument();
  });

  it('muestra login por defecto en /auth (ruta legacy)', () => {
    renderWithProviders({ route: '/auth' });
    expect(screen.getByRole('form', { name: /formulario de inicio de sesión/i })).toBeInTheDocument();
  });

  it('muestra registro en /auth con ?view=register', () => {
    renderWithProviders({ route: '/auth?view=register' });
    expect(screen.getByRole('form', { name: /formulario de registro/i })).toBeInTheDocument();
  });

  it('ignora valores inválidos de view y muestra login', () => {
    renderWithProviders({ route: '/login?view=invalido' });
    expect(screen.getByRole('form', { name: /formulario de inicio de sesión/i })).toBeInTheDocument();
  });

  it('al hacer clic en "Crear una cuenta" cambia a vista registro', async () => {
    const user = userEvent.setup();
    renderWithProviders({ route: '/login' });

    const registerButton = screen.getByRole('button', { name: /crear una cuenta/i });
    await user.click(registerButton);

    expect(screen.getByRole('form', { name: /formulario de registro/i })).toBeInTheDocument();
  });

  it('al hacer clic en "¿Ya tienes cuenta?" desde registro cambia a vista login', async () => {
    const user = userEvent.setup();
    renderWithProviders({ route: '/login?view=register' });

    const loginButton = screen.getByRole('button', { name: /ya tienes cuenta/i });
    await user.click(loginButton);

    expect(screen.getByRole('form', { name: /formulario de inicio de sesión/i })).toBeInTheDocument();
  });

  it('redirige a / cuando ya está autenticado', () => {
    const store = createTestStore({
      auth: {
        isAuthenticated: true,
        user: { id: '1', email: 'test@test.com', role: 'cliente', display_name: 'Test', must_change_password: false, phone: null },
      },
    });
    renderWithProviders({ route: '/login', store });
    expect(screen.getByText('Inicio')).toBeInTheDocument();
  });
});
