/**
 * Tests para CartPanel.
 * Verifica navegación al checkout y cierre del panel.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { CartPanel } from './CartPanel';
import { cartReducer } from '../store/cartSlice';
import { authReducer } from '../store/authSlice';
import { catalogReducer } from '../store/catalogSlice';

vi.mock('../api/client', () => ({
  fetchCart: vi.fn(),
  addCartItem: vi.fn(),
  setCartItemQuantity: vi.fn(),
  removeCartItem: vi.fn(),
  register: vi.fn(),
  login: vi.fn(),
  refreshSession: vi.fn(),
  logout: vi.fn(),
  getMyProfile: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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

const cartWithItems = {
  data: {
    id: 'cart-1',
    status: 'ACTIVE' as const,
    items: [
      {
        product: {
          id: 'product-1',
          name: 'Test Product',
          sale_price_cop: 10000,
          regular_price_cop: 15000,
          unit: 'unidad',
          stock_available: 10,
          images: [{ key: 'img-1', url: 'test.jpg', alt_text: 'Test', position: 1 }],
          description: 'Test description',
          category: { id: 'cat-1', name: 'Test', image: { key: 'img-2', url: 'cat.jpg', alt_text: 'Cat', position: 1 }, version: 1 },
          version: 1,
        },
        quantity: 1,
        reservation_status: 'ACTIVE' as const,
        reservation_expires_at: null,
      },
    ],
    items_subtotal_cop: 10000,
    delivery_fee_cop: 5000,
    iva_cop: 1900,
    total_cop: 16900,
    reservation_expires_at: null,
  },
  loading: false,
  error: null,
  isOpen: true,
  lastAction: null,
};

const cartEmpty = {
  data: {
    id: 'cart-1',
    status: 'ACTIVE' as const,
    items: [],
    items_subtotal_cop: 0,
    delivery_fee_cop: 0,
    iva_cop: 0,
    total_cop: 0,
    reservation_expires_at: null,
  },
  loading: false,
  error: null,
  isOpen: true,
  lastAction: null,
};

function renderCartPanel(store?: ReturnType<typeof createTestStore>) {
  const testStore = store ?? createTestStore();
  return render(
    <Provider store={testStore}>
      <MemoryRouter initialEntries={['/']}>
        <CartPanel />
      </MemoryRouter>
    </Provider>,
  );
}

describe('CartPanel - Navegación al checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra botón "Continuar al checkout" cuando hay items', () => {
    renderCartPanel(createTestStore({ cart: cartWithItems }));
    expect(screen.getByRole('button', { name: /continuar al checkout/i })).toBeInTheDocument();
  });

  it('navega a /checkout al hacer clic en "Continuar al checkout"', () => {
    renderCartPanel(createTestStore({ cart: cartWithItems }));

    fireEvent.click(screen.getByRole('button', { name: /continuar al checkout/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/checkout');
  });

  it('cierra el panel al hacer clic en "Continuar al checkout"', () => {
    const store = createTestStore({ cart: cartWithItems });
    renderCartPanel(store);

    fireEvent.click(screen.getByRole('button', { name: /continuar al checkout/i }));

    const state = store.getState();
    expect(state.cart.isOpen).toBe(false);
  });

  it('no muestra botón de checkout cuando el carrito está vacío', () => {
    renderCartPanel(createTestStore({ cart: cartEmpty }));
    expect(screen.queryByRole('button', { name: /continuar al checkout/i })).not.toBeInTheDocument();
  });

  it('muestra estado vacío cuando el carrito está vacío', () => {
    renderCartPanel(createTestStore({ cart: cartEmpty }));
    expect(screen.getByText(/carrito vacío/i)).toBeInTheDocument();
    expect(screen.getByText(/agrega productos del catálogo para comenzar tu compra/i)).toBeInTheDocument();
  });
});