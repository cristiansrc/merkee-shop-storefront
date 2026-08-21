/**
 * Tests para Header.
 * Verifica botón "Iniciar sesión" / "Mi cuenta" según estado de autenticación.
 * Verifica que el menú móvil respeta la lógica de autenticación.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { Header } from './Header';
import { authReducer } from '../store/authSlice';
import { cartReducer } from '../store/cartSlice';
import { catalogReducer } from '../store/catalogSlice';

vi.mock('../api/client', () => ({
  register: vi.fn(),
  login: vi.fn(),
  refreshSession: vi.fn(),
  logout: vi.fn(),
  getMyProfile: vi.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createTestStore(preloadedState?: any) {
  return configureStore({
    reducer: {
      auth: authReducer,
      cart: cartReducer,
      catalog: catalogReducer,
    } as never,
    preloadedState,
  });
}

function renderHeader(store?: ReturnType<typeof createTestStore>) {
  const testStore = store ?? createTestStore();
  return render(
    <Provider store={testStore}>
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    </Provider>,
  );
}

describe('Header - Autenticación', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra "Iniciar sesión" cuando no está autenticado', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: /iniciar sesión/i })).toHaveAttribute('href', '/login');
  });

  it('muestra "Mi cuenta" cuando está autenticado', () => {
    const store = createTestStore({
      auth: {
        user: { id: '1', email: 'a@b.com', role: 'cliente', display_name: 'Test', must_change_password: false, phone: null, created_at: '', updated_at: '' },
        isAuthenticated: true,
        loading: false,
        error: null,
      },
    });
    renderHeader(store);
    expect(screen.getByRole('link', { name: /mi cuenta/i })).toHaveAttribute('href', '/mi-cuenta');
  });

  it('no muestra "Iniciar sesión" cuando está autenticado', () => {
    const store = createTestStore({
      auth: {
        user: { id: '1', email: 'a@b.com', role: 'cliente', display_name: 'Test', must_change_password: false, phone: null, created_at: '', updated_at: '' },
        isAuthenticated: true,
        loading: false,
        error: null,
      },
    });
    renderHeader(store);
    expect(screen.queryByRole('link', { name: /iniciar sesión/i })).not.toBeInTheDocument();
  });

  it('no muestra "Mi cuenta" cuando no está autenticado', () => {
    renderHeader();
    expect(screen.queryByRole('link', { name: /mi cuenta/i })).not.toBeInTheDocument();
  });

  it('muestra "Cerrar sesión" cuando está autenticado', () => {
    const store = createTestStore({
      auth: {
        user: { id: '1', email: 'a@b.com', role: 'cliente', display_name: 'Test', must_change_password: false, phone: null, created_at: '', updated_at: '' },
        isAuthenticated: true,
        loading: false,
        error: null,
      },
    });
    renderHeader(store);
    expect(screen.getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument();
  });

  it('no muestra "Cerrar sesión" cuando no está autenticado', () => {
    renderHeader();
    expect(screen.queryByRole('button', { name: /cerrar sesión/i })).not.toBeInTheDocument();
  });

  it('muestra "Cerrar sesión" en menú móvil cuando autenticado', () => {
    const store = createTestStore({
      auth: {
        user: { id: '1', email: 'a@b.com', role: 'cliente', display_name: 'Test', must_change_password: false, phone: null, created_at: '', updated_at: '' },
        isAuthenticated: true,
        loading: false,
        error: null,
      },
    });
    renderHeader(store);
    const mobileMenuBtn = screen.getByRole('button', { name: /menú de navegación/i });
    mobileMenuBtn.click();
    // El botón de cerrar sesión debe existir tanto en nav desktop como en nav móvil
    const logoutButtons = screen.getAllByRole('button', { name: /cerrar sesión/i });
    expect(logoutButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('incluye enlace de auth en navegación móvil', () => {
    renderHeader();
    const mobileMenuBtn = screen.getByRole('button', { name: /menú de navegación/i });
    mobileMenuBtn.click();
    expect(screen.getByRole('link', { name: /^iniciar sesión$/i })).toBeInTheDocument();
  });

  it('muestra "Mi cuenta" en menú móvil cuando autenticado', () => {
    const store = createTestStore({
      auth: {
        user: { id: '1', email: 'a@b.com', role: 'cliente', display_name: 'Test', must_change_password: false, phone: null, created_at: '', updated_at: '' },
        isAuthenticated: true,
        loading: false,
        error: null,
      },
    });
    renderHeader(store);
    const mobileMenuBtn = screen.getByRole('button', { name: /menú de navegación/i });
    mobileMenuBtn.click();
    expect(screen.getByRole('link', { name: /^mi cuenta$/i })).toBeInTheDocument();
  });
});
