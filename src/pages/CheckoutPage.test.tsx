/**
 * Tests para CheckoutPage.
 * Verifica guard de carga, redirección y flujo guest→auth→address.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { CheckoutPage } from './CheckoutPage';
import { cartReducer } from '../store/cartSlice';
import { authReducer } from '../store/authSlice';
import { checkoutReducer } from '../store/checkoutSlice';
import { catalogReducer } from '../store/catalogSlice';

const mockFetchCart = vi.fn();
vi.mock('../api/client', () => ({
  fetchCart: (...args: unknown[]) => mockFetchCart(...args),
  addCartItem: vi.fn(),
  setCartItemQuantity: vi.fn(),
  removeCartItem: vi.fn(),
  register: vi.fn(),
  login: vi.fn(),
  refreshSession: vi.fn(),
  logout: vi.fn(),
  getMyProfile: vi.fn(),
  createCheckout: vi.fn(),
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
      checkout: checkoutReducer,
      catalog: catalogReducer,
    } as never,
    preloadedState,
  });
}

function renderCheckoutPage(store?: ReturnType<typeof createTestStore>) {
  const testStore = store ?? createTestStore();
  return render(
    <Provider store={testStore}>
      <MemoryRouter initialEntries={['/checkout']}>
        <CheckoutPage />
      </MemoryRouter>
    </Provider>,
  );
}

const emptyCartResponse = {
  id: 'cart-1',
  status: 'ACTIVE' as const,
  items: [],
  items_subtotal_cop: 0,
  delivery_fee_cop: 0,
  iva_cop: 0,
  tax_rate_basis_points: 1900,
  total_cop: 0,
  reservation_expires_at: null,
};

const cartWithItemsResponse = {
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
  tax_rate_basis_points: 1900,
  total_cop: 16900,
  reservation_expires_at: null,
};

describe('CheckoutPage - Guard de carga y redirección', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no redirige mientras el carrito está cargando', async () => {
    // Mock fetchCart que nunca resuelve para simular loading
    mockFetchCart.mockReturnValue(new Promise(() => {}));

    const store = createTestStore({
      cart: {
        data: null,
        loading: false,
        error: null,
        isOpen: false,
        lastAction: null,
      },
      auth: {
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      },
      checkout: {
        currentStep: 'cart',
        loading: false,
        error: null,
        result: null,
        deliveryAddress: null,
        paymentProvider: null,
      },
    });

    renderCheckoutPage(store);

    // Esperar a que el componente renderice
    await waitFor(() => {
      expect(screen.getByText('Checkout')).toBeInTheDocument();
    });

    // No debe haber navegado a ningún lado mientras carga
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('redirige a /productos cuando el carrito está vacío después de cargar', async () => {
    mockFetchCart.mockResolvedValue(emptyCartResponse);

    const store = createTestStore({
      cart: {
        data: null,
        loading: false,
        error: null,
        isOpen: false,
        lastAction: null,
      },
      auth: {
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      },
      checkout: {
        currentStep: 'cart',
        loading: false,
        error: null,
        result: null,
        deliveryAddress: null,
        paymentProvider: null,
      },
    });

    renderCheckoutPage(store);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/productos');
    });
  });

  it('no redirige si el carrito tiene items', async () => {
    mockFetchCart.mockResolvedValue(cartWithItemsResponse);

    const store = createTestStore({
      cart: {
        data: null,
        loading: false,
        error: null,
        isOpen: false,
        lastAction: null,
      },
      auth: {
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      },
      checkout: {
        currentStep: 'cart',
        loading: false,
        error: null,
        result: null,
        deliveryAddress: null,
        paymentProvider: null,
      },
    });

    renderCheckoutPage(store);

    await waitFor(() => {
      expect(mockFetchCart).toHaveBeenCalled();
    });

    // No debe navegar a /productos porque hay items
    expect(mockNavigate).not.toHaveBeenCalledWith('/productos');
  });

  it('muestra formulario de login cuando no está autenticado y el carrito tiene items', async () => {
    mockFetchCart.mockResolvedValue(cartWithItemsResponse);

    const store = createTestStore({
      cart: {
        data: null,
        loading: false,
        error: null,
        isOpen: false,
        lastAction: null,
      },
      auth: {
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      },
      checkout: {
        currentStep: 'cart',
        loading: false,
        error: null,
        result: null,
        deliveryAddress: null,
        paymentProvider: null,
      },
    });

    renderCheckoutPage(store);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
    });
  });

  it('avanza al paso de dirección cuando isAuthenticated es true y currentStep es auth', async () => {
    mockFetchCart.mockResolvedValue(cartWithItemsResponse);

    const store = createTestStore({
      cart: {
        data: null,
        loading: false,
        error: null,
        isOpen: false,
        lastAction: null,
      },
      auth: {
        user: {
          id: 'user-1',
          email: 'test@test.com',
          role: 'cliente' as const,
          display_name: 'Test User',
          must_change_password: false,
          phone: null,
        },
        isAuthenticated: true,
        loading: false,
        error: null,
      },
      checkout: {
        currentStep: 'auth',
        loading: false,
        error: null,
        result: null,
        deliveryAddress: null,
        paymentProvider: null,
      },
    });

    renderCheckoutPage(store);

    // El efecto debería detectar isAuthenticated=true y currentStep=auth
    // y avanzar al paso de dirección
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /dirección de entrega/i })).toBeInTheDocument();
    });
  });

  it('usuario autenticado en step cart ve botón Continuar y avanza a address', async () => {
    mockFetchCart.mockResolvedValue(cartWithItemsResponse);

    const store = createTestStore({
      cart: {
        data: null,
        loading: false,
        error: null,
        isOpen: false,
        lastAction: null,
      },
      auth: {
        user: {
          id: 'user-1',
          email: 'test@test.com',
          role: 'cliente' as const,
          display_name: 'Test User',
          must_change_password: false,
          phone: null,
        },
        isAuthenticated: true,
        loading: false,
        error: null,
      },
      checkout: {
        currentStep: 'cart',
        loading: false,
        error: null,
        result: null,
        deliveryAddress: null,
        paymentProvider: null,
      },
    });

    renderCheckoutPage(store);

    // Esperar a que renderice el resumen del carrito
    await waitFor(() => {
      expect(screen.getByText('Resumen del Pedido')).toBeInTheDocument();
    });

    // Verificar que el botón Continuar está visible
    const continuarBtn = screen.getByRole('button', { name: /continuar/i });
    expect(continuarBtn).toBeInTheDocument();

    // Hacer click en Continuar
    continuarBtn.click();

    // Verificar que avanza al paso de dirección
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /dirección de entrega/i })).toBeInTheDocument();
    });
  });

  it('no redirige a /carrito cuando el carrito está vacío', async () => {
    mockFetchCart.mockResolvedValue(emptyCartResponse);

    const store = createTestStore({
      cart: {
        data: null,
        loading: false,
        error: null,
        isOpen: false,
        lastAction: null,
      },
      auth: {
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      },
      checkout: {
        currentStep: 'cart',
        loading: false,
        error: null,
        result: null,
        deliveryAddress: null,
        paymentProvider: null,
      },
    });

    renderCheckoutPage(store);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });

    // Verificar que nunca se navegó a /carrito
    const callsToCarrito = mockNavigate.mock.calls.filter(
      (call) => call[0] === '/carrito',
    );
    expect(callsToCarrito).toHaveLength(0);

    // Verificar que se navegó a /productos
    expect(mockNavigate).toHaveBeenCalledWith('/productos');
  });
});
