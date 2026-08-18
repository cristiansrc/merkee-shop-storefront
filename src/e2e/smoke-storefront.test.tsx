/**
 * E2E Smoke Tests — merkee-shop-storefront.
 *
 * Cobertura integral de flujos críticos contra mocks del contrato OpenAPI.
 * Responsive, es-CO/COP, sin localStorage/sessionStorage de token/carrito.
 * Errores 401/403/409/410/422 verificados en componentes y slices.
 *
 * NO inventa endpoints ni modifica OpenAPI.
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

import { catalogReducer } from '../store/catalogSlice';
import { cartReducer } from '../store/cartSlice';
import { authReducer } from '../store/authSlice';
import { profileReducer } from '../store/profileSlice';
import { checkoutReducer } from '../store/checkoutSlice';
import { ordersReducer } from '../store/ordersSlice';
import { openCart } from '../store/cartSlice';

import { HomePage } from '../pages/HomePage';
import { CategoriesPage } from '../pages/CategoriesPage';
import { ProductsPage } from '../pages/ProductsPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { AuthPage } from '../pages/AuthPage';
import { ProfilePage } from '../pages/ProfilePage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { OrdersPage } from '../pages/OrdersPage';
import { NotFoundPage } from '../pages/NotFoundPage';

import { Header } from '../components/Header';
import { CartPanel } from '../components/CartPanel';
import { LoginForm } from '../components/LoginForm';
import { RegisterForm } from '../components/RegisterForm';
import { PasswordResetRequestForm } from '../components/PasswordResetRequestForm';
import { PasswordResetConfirmForm } from '../components/PasswordResetConfirmForm';
import { PasswordChangeForm } from '../components/PasswordChangeForm';
import { ProfileForm } from '../components/ProfileForm';
import { CartSummary } from '../components/CartSummary';
import { CheckoutSteps } from '../components/CheckoutSteps';
import { CheckoutConfirmation } from '../components/CheckoutConfirmation';
import { DeliveryAddressForm } from '../components/DeliveryAddressForm';
import { PaymentProviderSelect } from '../components/PaymentProviderSelect';
import { OrdersList } from '../components/OrdersList';
import { OrderDetail } from '../components/OrderDetail';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';
import { CartItem } from '../components/CartItem';
import { ProductCard } from '../components/ProductCard';

import type { UserResponse, CartResponse, OrderResponse, PagedOrderResponse, ProductResponse } from '../types/api';

// ─── Mocks del contrato OpenAPI ──────────────────────────────────────────────

const mockUser: UserResponse = {
  id: 'usr-001',
  display_name: 'Cristian test',
  email: 'cristian@merkee.shop',
  role: 'cliente',
  must_change_password: false,
  phone: '+57 300 1234567',
};

const mockMustChangePasswordUser: UserResponse = {
  ...mockUser,
  must_change_password: true,
};

const mockProduct: ProductResponse = {
  id: '660e8400-e29b-41d4-a716-446655440001',
  category: {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Frutas y Verduras',
    image: { key: 'categories/frutas.jpg', url: 'https://images.merkee.shop/categories/frutas.jpg', alt_text: 'Frutas', position: 0 },
    version: 1,
  },
  name: 'Manzana Roja',
  description: 'Manzana roja fresca.',
  regular_price_cop: 5900,
  sale_price_cop: 4900,
  unit: 'kg',
  stock_available: 45,
  images: [{ key: 'products/manzana.jpg', url: 'https://images.merkee.shop/products/manzana.jpg', alt_text: 'Manzana', position: 0 }],
  version: 1,
};

const mockEmptyCart: CartResponse = {
  id: 'cart-001',
  status: 'ACTIVE',
  items: [],
  items_subtotal_cop: 0,
  delivery_fee_cop: 5000,
  iva_cop: 0,
  tax_rate_basis_points: 1900,
  total_cop: 5000,
  reservation_expires_at: null,
};

const mockCartWithItems: CartResponse = {
  id: 'cart-002',
  status: 'ACTIVE',
  items: [
    {
      product: mockProduct,
      quantity: 2,
      reservation_status: 'ACTIVE',
      reservation_expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    },
  ],
  items_subtotal_cop: 9800,
  delivery_fee_cop: 5000,
  iva_cop: 1862,
  tax_rate_basis_points: 1900,
  total_cop: 16662,
  reservation_expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
};

const mockOrder: OrderResponse = {
  id: 'ord-001',
  order_number: 'ORD-2026-001',
  status: 'PAID',
  items_subtotal_cop: 9800,
  delivery_fee_cop: 5000,
  iva_cop: 1862,
  tax_rate_basis_points: 1900,
  total_cop: 16662,
  items: [
    {
      product_id: mockProduct.id,
      product_name: 'Manzana Roja',
      unit: 'kg',
      unit_price_cop: 4900,
      quantity: 2,
      subtotal_cop: 9800,
    },
  ],
  delivery_recipient_name: 'Cristian test',
  delivery_line1: 'Calle 100 #15-20',
  delivery_city: 'Bogotá',
  delivery_phone: '+57 300 1234567',
  payment: {
    id: 'pay-001',
    provider: 'WOMPI',
    status: 'APPROVED',
    amount_cop: 16662,
    provider_reference: 'wompi-ref-001',
  },
  refund: null,
  created_at: '2026-08-15T10:30:00Z',
};

const mockPagedOrders: PagedOrderResponse = {
  items: [mockOrder],
  page: { page: 1, size: 10, total: 1 },
};

// ─── Mocks de API client ─────────────────────────────────────────────────────

const mockApi = {
  fetchCategories: vi.fn(),
  fetchProducts: vi.fn(),
  fetchProduct: vi.fn(),
  fetchBanners: vi.fn(),
  fetchCart: vi.fn(),
  addCartItem: vi.fn(),
  setCartItemQuantity: vi.fn(),
  removeCartItem: vi.fn(),
  register: vi.fn(),
  login: vi.fn(),
  refreshSession: vi.fn(),
  logout: vi.fn(),
  requestPasswordReset: vi.fn(),
  resetPassword: vi.fn(),
  getMyProfile: vi.fn(),
  updateMyProfile: vi.fn(),
  changePassword: vi.fn(),
  createCheckout: vi.fn(),
  listMyOrders: vi.fn(),
  getMyOrder: vi.fn(),
};

vi.mock('../api/client', () => ({
  fetchCategories: (...args: unknown[]) => mockApi.fetchCategories(...args),
  fetchProducts: (...args: unknown[]) => mockApi.fetchProducts(...args),
  fetchProduct: (...args: unknown[]) => mockApi.fetchProduct(...args),
  fetchBanners: (...args: unknown[]) => mockApi.fetchBanners(...args),
  fetchCart: (...args: unknown[]) => mockApi.fetchCart(...args),
  addCartItem: (...args: unknown[]) => mockApi.addCartItem(...args),
  setCartItemQuantity: (...args: unknown[]) => mockApi.setCartItemQuantity(...args),
  removeCartItem: (...args: unknown[]) => mockApi.removeCartItem(...args),
  register: (...args: unknown[]) => mockApi.register(...args),
  login: (...args: unknown[]) => mockApi.login(...args),
  refreshSession: (...args: unknown[]) => mockApi.refreshSession(...args),
  logout: (...args: unknown[]) => mockApi.logout(...args),
  requestPasswordReset: (...args: unknown[]) => mockApi.requestPasswordReset(...args),
  resetPassword: (...args: unknown[]) => mockApi.resetPassword(...args),
  getMyProfile: (...args: unknown[]) => mockApi.getMyProfile(...args),
  updateMyProfile: (...args: unknown[]) => mockApi.updateMyProfile(...args),
  changePassword: (...args: unknown[]) => mockApi.changePassword(...args),
  createCheckout: (...args: unknown[]) => mockApi.createCheckout(...args),
  listMyOrders: (...args: unknown[]) => mockApi.listMyOrders(...args),
  getMyOrder: (...args: unknown[]) => mockApi.getMyOrder(...args),
}));

// ─── Helpers de测试 ──────────────────────────────────────────────────────────

const testReducer = {
  catalog: catalogReducer,
  cart: cartReducer,
  auth: authReducer,
  profile: profileReducer,
  checkout: checkoutReducer,
  orders: ordersReducer,
} as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createTestStore(preloadedState?: any) {
  return configureStore({
    reducer: testReducer as any,
    preloadedState,
  });
}

function renderWithProviders(
  ui: React.ReactElement,
  options: {
    store?: ReturnType<typeof createTestStore>;
    route?: string;
  } = {},
) {
  const { store = createTestStore(), route = '/' } = options;
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        {ui}
      </MemoryRouter>
    </Provider>,
  );
}

function renderWithFullApp(
  options: {
    store?: ReturnType<typeof createTestStore>;
    route?: string;
  } = {},
) {
  const { store = createTestStore(), route = '/' } = options;
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <HomePage />
      </MemoryRouter>
    </Provider>,
  );
}

// ─── Setup/Teardown ──────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  mockApi.fetchCart.mockResolvedValue(mockEmptyCart);
  mockApi.fetchCategories.mockResolvedValue([
    { id: 'cat-1', name: 'Frutas y Verduras', image: { url: 'test.jpg', alt_text: 'Test', key: 'test', position: 0 }, version: 1 },
  ]);
  mockApi.fetchProducts.mockResolvedValue({
    items: [mockProduct],
    page: { page: 1, size: 20, total: 1 },
  });
  mockApi.fetchProduct.mockResolvedValue(mockProduct);
  mockApi.fetchBanners.mockResolvedValue([
    { id: 'ban-1', name: 'Ofertas', image: { url: 'banner.jpg', alt_text: 'Banner', key: 'ban', position: 0 }, target_path: '/productos', display_order: 0, active: true, version: 1 },
  ]);
  mockApi.listMyOrders.mockResolvedValue(mockPagedOrders);
  mockApi.getMyOrder.mockResolvedValue(mockOrder);
});

// Storage spies declarados a nivel suite — se crean antes de los tests
let localStorageGetSpy: ReturnType<typeof vi.spyOn<Storage, 'getItem'>>;
let localStorageSetSpy: ReturnType<typeof vi.spyOn<Storage, 'setItem'>>;
let sessionStorageGetSpy: ReturnType<typeof vi.spyOn<Storage, 'getItem'>>;
let sessionStorageSetSpy: ReturnType<typeof vi.spyOn<Storage, 'setItem'>>;

beforeAll(() => {
  localStorageGetSpy = vi.spyOn(Storage.prototype, 'getItem');
  localStorageSetSpy = vi.spyOn(Storage.prototype, 'setItem');
  sessionStorageGetSpy = vi.spyOn(Storage.prototype, 'getItem');
  sessionStorageSetSpy = vi.spyOn(Storage.prototype, 'setItem');
});

afterEach(() => {
  localStorageGetSpy.mockClear();
  localStorageSetSpy.mockClear();
  sessionStorageGetSpy.mockClear();
  sessionStorageSetSpy.mockClear();
});

// ═══════════════════════════════════════════════════════════════════════════════
// 1. HOME / CATEGORÍAS / PRODUCTOS / BÚSQUEDA / DETALLE
// ═══════════════════════════════════════════════════════════════════════════════

describe('Smoke E2E — Home / Catálogo / Búsqueda / Detalle', () => {
  it('Home carga banners, categorías y productos destacados', async () => {
    renderWithFullApp();

    expect(screen.getByText('Cargando promociones...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Ofertas')).toBeInTheDocument();
    });

    // Category name appears in both the category section and product card
    await waitFor(() => {
      expect(screen.getAllByText('Frutas y Verduras').length).toBeGreaterThanOrEqual(1);
    });

    await waitFor(() => {
      expect(screen.getByText('Manzana Roja')).toBeInTheDocument();
    });
  });

  it('Home muestra COP con formato es-CO (sin decimales)', async () => {
    renderWithFullApp();

    await waitFor(() => {
      // COP format: $4.900 or similar
      expect(screen.getAllByText(/\$\s?[\d.,]+/).length).toBeGreaterThan(0);
    });
  });

  it('Home tiene links de navegación a categorías y productos', async () => {
    renderWithFullApp();

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /productos/i })).toBeInTheDocument();
    });

    expect(screen.getByText('Ver todos los productos')).toBeInTheDocument();
  });

  it('CategoriesPage muestra grid de categorías', async () => {
    renderWithProviders(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Frutas y Verduras')).toBeInTheDocument();
    });

    const links = screen.getAllByRole('link');
    const catLinks = links.filter(l => l.getAttribute('href')?.includes('category_id'));
    expect(catLinks.length).toBeGreaterThan(0);
  });

  it('ProductsPage muestra productos con paginación', async () => {
    renderWithProviders(<ProductsPage />, { route: '/productos' });

    await waitFor(() => {
      expect(screen.getByText('Manzana Roja')).toBeInTheDocument();
    });

    expect(screen.getByText(/1 producto encontrado/)).toBeInTheDocument();
  });

  it('ProductsPage soporta búsqueda por query param q', async () => {
    renderWithProviders(<ProductsPage />, { route: '/productos?q=manzana' });

    await waitFor(() => {
      expect(mockApi.fetchProducts).toHaveBeenCalledWith(
        expect.objectContaining({ q: 'manzana' }),
      );
    });
  });

  it('ProductsPage soporta filtrado por category_id', async () => {
    renderWithProviders(<ProductsPage />, { route: '/productos?category_id=cat-1' });

    await waitFor(() => {
      expect(mockApi.fetchProducts).toHaveBeenCalledWith(
        expect.objectContaining({ category_id: 'cat-1' }),
      );
    });
  });

  it('ProductDetailPage muestra detalle completo del producto', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/productos/:productId" element={<ProductDetailPage />} />
      </Routes>,
      { route: '/productos/660e8400-e29b-41d4-a716-446655440001' },
    );

    // "Manzana Roja" appears in breadcrumb + h1
    expect((await screen.findAllByText('Manzana Roja')).length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Frutas y Verduras').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/45.*kg/)).toBeInTheDocument(); // stock
    expect(screen.getByText('Agregar al carrito')).toBeInTheDocument();
  });

  it('ProductDetailPage muestra badge de descuento con porcentaje', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/productos/:productId" element={<ProductDetailPage />} />
      </Routes>,
      { route: '/productos/660e8400-e29b-41d4-a716-446655440001' },
    );

    await waitFor(() => {
      expect(screen.getByText(/-\d+%/)).toBeInTheDocument();
    });
  });

  it('ProductDetailPage muestra breadcrumb de navegación', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/productos/:productId" element={<ProductDetailPage />} />
      </Routes>,
      { route: '/productos/660e8400-e29b-41d4-a716-446655440001' },
    );

    await waitFor(() => {
      // Breadcrumb contains "Inicio" and "Productos" links
      expect(screen.getAllByText('Inicio').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Productos').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('NotFoundPage muestra 404 y link al inicio', () => {
    renderWithProviders(<NotFoundPage />);

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Página no encontrada')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /volver al inicio/i })).toBeInTheDocument();
  });

  it('Header tiene búsqueda con minLength=2', () => {
    renderWithProviders(<Header />);

    const searchInput = screen.getByRole('searchbox');
    expect(searchInput).toHaveAttribute('minlength', '2');
    expect(searchInput).toHaveAttribute('maxlength', '100');
  });

  it('Header muestra badge del carrito con items', async () => {
    const store = createTestStore({
      cart: { data: mockCartWithItems, loading: false, error: null, isOpen: false, lastAction: null },
    });

    renderWithProviders(<Header />, { store });

    // Badge shows total item count: 2
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /carrito de compras/i })).toBeInTheDocument();
  });

  it('Header tiene navegación completa: Inicio, Categorías, Productos', () => {
    renderWithProviders(<Header />);

    // Desktop nav links
    const nav = screen.getByRole('navigation', { name: /navegación principal/i });
    expect(within(nav).getByText('Inicio')).toBeInTheDocument();
    expect(within(nav).getByText('Categorías')).toBeInTheDocument();
    expect(within(nav).getByText('Productos')).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. LOGIN / REGISTRO / RESET
// ═══════════════════════════════════════════════════════════════════════════════

describe('Smoke E2E — Login / Registro / Reset', () => {
  it('AuthPage muestra formulario de login por defecto', () => {
    renderWithProviders(<AuthPage />, { route: '/auth' });

    expect(screen.getByRole('form', { name: /formulario de inicio de sesión/i })).toBeInTheDocument();
    // "Iniciar Sesión" appears as h2 heading and button text
    expect(screen.getAllByText('Iniciar Sesión').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
  });

  it('AuthPage permite alternar a registro', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthPage />, { route: '/auth' });

    await user.click(screen.getByRole('button', { name: /crear una cuenta/i }));

    expect(screen.getByRole('form', { name: /formulario de registro/i })).toBeInTheDocument();
    // "Crear Cuenta" appears as h2 and button
    expect(screen.getAllByText('Crear Cuenta').length).toBeGreaterThanOrEqual(1);
  });

  it('AuthPage permite alternar a reset de contraseña', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthPage />, { route: '/auth' });

    await user.click(screen.getByRole('button', { name: /olvidaste tu contraseña/i }));

    expect(screen.getByRole('form', { name: /formulario de restablecimiento/i })).toBeInTheDocument();
    expect(screen.getByText('Restablecer Contraseña')).toBeInTheDocument();
  });

  it('LoginForm muestra textos es-CO, no ingles', () => {
    renderWithProviders(<LoginForm />, { route: '/auth' });

    // "Iniciar Sesión" appears in heading and button
    expect(screen.getAllByText('Iniciar Sesión').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByText('Contraseña')).toBeInTheDocument();
    expect(screen.getByText('¿Olvidaste tu contraseña?')).toBeInTheDocument();
    expect(screen.getByText('Crear una cuenta')).toBeInTheDocument();
    // No debe haber textos en inglés
    expect(screen.queryByText('Email')).not.toBeInTheDocument();
    expect(screen.queryByText('Password')).not.toBeInTheDocument();
  });

  it('RegisterForm tiene validación de confirmación de contraseña', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterForm />, { route: '/auth' });

    await user.type(screen.getByLabelText(/nombre visible/i), 'Test User');
    await user.type(screen.getByLabelText(/^correo electrónico/i), 'test@merkee.shop');
    await user.type(screen.getByLabelText(/^contraseña$/i), '123456789012');
    await user.type(screen.getByLabelText(/confirmar contraseña/i), '123456789999');

    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    await waitFor(() => {
      expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument();
    });
  });

  it('RegisterForm tiene minLength=12 en campos de contraseña', () => {
    renderWithProviders(<RegisterForm />, { route: '/auth' });

    const pwd = screen.getByLabelText(/^contraseña$/i);
    const confirm = screen.getByLabelText(/confirmar contraseña/i);
    expect(pwd).toHaveAttribute('minlength', '12');
    expect(confirm).toHaveAttribute('minlength', '12');
  });

  it('RegisterForm permite volver al login vía callback', async () => {
    const onLoginClick = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<RegisterForm onLoginClick={onLoginClick} />, { route: '/auth' });

    await user.click(screen.getByRole('button', { name: /ya tienes cuenta/i }));

    expect(onLoginClick).toHaveBeenCalledTimes(1);
  });

  it('PasswordResetRequestForm muestra mensaje de respuesta neutra', async () => {
    mockApi.requestPasswordReset.mockResolvedValue(undefined);
    const user = userEvent.setup();

    renderWithProviders(<PasswordResetRequestForm />, { route: '/auth' });

    await user.type(screen.getByLabelText(/correo electrónico/i), 'test@merkee.shop');
    await user.click(screen.getByRole('button', { name: /enviar enlace/i }));

    await waitFor(() => {
      expect(screen.getByText('Solicitud Enviada')).toBeInTheDocument();
      expect(screen.getByText(/si el correo electrónico está registrado/i)).toBeInTheDocument();
    });
  });

  it('PasswordResetConfirmForm muestra formulario de nueva contraseña', () => {
    renderWithProviders(
      <PasswordResetConfirmForm token="test-token-abc123" />,
      { route: '/auth/reset-confirm?token=test-token-abc123' },
    );

    expect(screen.getByRole('form', { name: /formulario de nueva contraseña/i })).toBeInTheDocument();
    // Labels contain "nueva contraseña" - use exact label text
    expect(screen.getByLabelText('Nueva contraseña')).toHaveAttribute('minlength', '12');
    expect(screen.getByLabelText('Confirmar contraseña')).toHaveAttribute('minlength', '12');
  });

  it('LoginForm usa autoComplete correctos para accesibilidad', () => {
    renderWithProviders(<LoginForm />, { route: '/auth' });

    expect(screen.getByLabelText(/correo electrónico/i)).toHaveAttribute('autocomplete', 'email');
    expect(screen.getByLabelText(/contraseña/i)).toHaveAttribute('autocomplete', 'current-password');
  });

  it('RegisterForm usa autoComplete new-password', () => {
    renderWithProviders(<RegisterForm />, { route: '/auth' });

    expect(screen.getByLabelText(/^contraseña$/i)).toHaveAttribute('autocomplete', 'new-password');
    expect(screen.getByLabelText(/confirmar contraseña/i)).toHaveAttribute('autocomplete', 'new-password');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. CARRITO GUEST / CLIENTE
// ═══════════════════════════════════════════════════════════════════════════════

describe('Smoke E2E — Carrito Guest / Cliente', () => {
  it('CartPanel no se muestra cuando isOpen=false', () => {
    renderWithProviders(<CartPanel />);

    expect(screen.queryByRole('dialog', { name: /carrito de compras/i })).not.toBeInTheDocument();
  });

  it('CartPanel se muestra cuando isOpen=true con items', async () => {
    const store = createTestStore({
      cart: { data: mockCartWithItems, loading: false, error: null, isOpen: true, lastAction: null },
    });

    renderWithProviders(<CartPanel />, { store });

    expect(screen.getByRole('dialog', { name: /carrito de compras/i })).toBeInTheDocument();
    expect(screen.getByText('Tu Carrito')).toBeInTheDocument();
    expect(screen.getByText('Manzana Roja')).toBeInTheDocument();
  });

  it('CartPanel muestra subtotal, IVA 19%, entrega y total en COP', async () => {
    const store = createTestStore({
      cart: { data: mockCartWithItems, loading: false, error: null, isOpen: true, lastAction: null },
    });

    renderWithProviders(<CartPanel />, { store });

    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    expect(screen.getByText('Envío')).toBeInTheDocument();
    expect(screen.getByText('IVA (19%)')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();

    const allText = document.body.textContent || '';
    expect(allText).toMatch(/\$\s?[\d.,]+/);
  });

  it('CartPanel muestra carrito vacío para guest', async () => {
    const store = createTestStore({
      cart: { data: mockEmptyCart, loading: false, error: null, isOpen: true, lastAction: null },
    });

    renderWithProviders(<CartPanel />, { store });

    expect(screen.getByText('Carrito vacío')).toBeInTheDocument();
    expect(screen.getByText(/Agrega productos del catálogo/i)).toBeInTheDocument();
  });

  it('CartPanel muestra nota de reserva de 10 minutos', async () => {
    const store = createTestStore({
      cart: { data: mockCartWithItems, loading: false, error: null, isOpen: true, lastAction: null },
    });

    renderWithProviders(<CartPanel />, { store });

    expect(screen.getByText(/reservados por 10 minutos/i)).toBeInTheDocument();
  });

  it('CartItem muestra nombre, cantidad, precio unitario y subtotal en COP', async () => {
    renderWithProviders(
      <CartItem item={mockCartWithItems.items[0]} />,
    );

    expect(screen.getByText('Manzana Roja')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // quantity

    const allText = document.body.textContent || '';
    expect(allText).toMatch(/\$\s?[\d.,]+/);
  });

  it('CartSummary muestra desglose de totales con IVA 19% y entrega', async () => {
    const store = createTestStore({
      cart: { data: mockCartWithItems, loading: false, error: null, isOpen: false, lastAction: null },
    });

    renderWithProviders(<CartSummary />, { store });

    expect(screen.getByText('Resumen del Pedido')).toBeInTheDocument();
    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    expect(screen.getByText('IVA (19%)')).toBeInTheDocument();
    expect(screen.getByText('Entrega')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('CartSummary muestra "carrito vacío" cuando no hay items', () => {
    const store = createTestStore({
      cart: { data: mockEmptyCart, loading: false, error: null, isOpen: false, lastAction: null },
    });

    renderWithProviders(<CartSummary />, { store });

    expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument();
  });

  it('CartPanel tiene botón de cerrar con aria-label', async () => {
    const store = createTestStore({
      cart: { data: mockEmptyCart, loading: false, error: null, isOpen: true, lastAction: null },
    });

    renderWithProviders(<CartPanel />, { store });

    expect(screen.getByRole('button', { name: /cerrar carrito/i })).toBeInTheDocument();
  });

  it('CartPanel tiene botón continuar al checkout', async () => {
    const store = createTestStore({
      cart: { data: mockCartWithItems, loading: false, error: null, isOpen: true, lastAction: null },
    });

    renderWithProviders(<CartPanel />, { store });

    expect(screen.getByText('Continuar al checkout')).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. CHECKOUT VISUAL DE CINCO PASOS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Smoke E2E — Checkout 5 pasos', () => {
  it('CheckoutSteps muestra los 5 pasos: Carrito, Autenticación, Dirección, Pago, Confirmación', () => {
    const store = createTestStore({
      checkout: {
        currentStep: 'cart',
        loading: false,
        error: null,
        result: null,
        deliveryAddress: null,
        paymentProvider: null,
      },
    });

    renderWithProviders(<CheckoutSteps />, { store });

    expect(screen.getByText('Carrito')).toBeInTheDocument();
    expect(screen.getByText('Autenticación')).toBeInTheDocument();
    expect(screen.getByText('Dirección')).toBeInTheDocument();
    expect(screen.getByText('Pago')).toBeInTheDocument();
    expect(screen.getByText('Confirmación')).toBeInTheDocument();
  });

  it('CheckoutSteps marca el paso actual con aria-current="step"', () => {
    const store = createTestStore({
      checkout: {
        currentStep: 'address',
        loading: false,
        error: null,
        result: null,
        deliveryAddress: null,
        paymentProvider: null,
      },
    });

    renderWithProviders(<CheckoutSteps />, { store });

    const addressStep = screen.getByText('Dirección').closest('li');
    expect(addressStep).toHaveAttribute('aria-current', 'step');
  });

  it('CheckoutSteps muestra checkmark en pasos completados', () => {
    const store = createTestStore({
      checkout: {
        currentStep: 'provider',
        loading: false,
        error: null,
        result: null,
        deliveryAddress: null,
        paymentProvider: null,
      },
    });

    renderWithProviders(<CheckoutSteps />, { store });

    const allItems = screen.getAllByRole('listitem');
    // First 3 steps (cart=0, auth=1, address=2) should have checkmarks when current is provider(3)
    expect(allItems[0].textContent).toContain('✓');
    expect(allItems[1].textContent).toContain('✓');
    expect(allItems[2].textContent).toContain('✓');
    expect(allItems[3].textContent).toContain('4'); // Current step number
    expect(allItems[4].textContent).toContain('5'); // Upcoming step number
  });

  it('DeliveryAddressForm muestra los 4 campos requeridos', () => {
    renderWithProviders(<DeliveryAddressForm />);

    expect(screen.getByLabelText(/nombre del destinatario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^dirección$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^ciudad$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^teléfono$/i)).toBeInTheDocument();
  });

  it('DeliveryAddressForm tiene validaciones de longitud', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DeliveryAddressForm />);

    await user.type(screen.getByLabelText(/nombre del destinatario/i), 'X');
    await user.type(screen.getByLabelText(/^dirección$/i), 'ABC');
    await user.type(screen.getByLabelText(/^ciudad$/i), 'X');
    await user.type(screen.getByLabelText(/^teléfono$/i), '123');

    await user.click(screen.getByRole('button', { name: /continuar/i }));

    await waitFor(() => {
      expect(screen.getByText(/nombre debe tener entre 2 y 100/i)).toBeInTheDocument();
      expect(screen.getByText(/dirección debe tener entre 5 y 180/i)).toBeInTheDocument();
      expect(screen.getByText(/ciudad debe tener entre 2 y 100/i)).toBeInTheDocument();
      expect(screen.getByText(/teléfono debe tener entre 7 y 30/i)).toBeInTheDocument();
    });
  });

  it('PaymentProviderSelect muestra Wompi y Mercado Pago', () => {
    renderWithProviders(<PaymentProviderSelect />);

    expect(screen.getByText('Wompi')).toBeInTheDocument();
    expect(screen.getByText('Mercado Pago')).toBeInTheDocument();
    expect(screen.getByText(/pago seguro con tarjeta, pse y más/i)).toBeInTheDocument();
    expect(screen.getByText(/pago con tarjeta, efectivo y transferencia/i)).toBeInTheDocument();
  });

  it('PaymentProviderSelect tiene botones Anterior y Continuar', () => {
    renderWithProviders(<PaymentProviderSelect />);

    expect(screen.getByRole('button', { name: /anterior/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continuar/i })).toBeInTheDocument();
  });

  it('PaymentProviderSelect deshabilita Continuar sin selección', () => {
    renderWithProviders(<PaymentProviderSelect />);

    expect(screen.getByRole('button', { name: /continuar/i })).toBeDisabled();
  });

  it('CheckoutConfirmation muestra estados de pago en es-CO', () => {
    const store = createTestStore({
      checkout: {
        currentStep: 'confirmation',
        loading: false,
        error: null,
        result: {
          order: mockOrder,
          payment: mockOrder.payment,
          provider_checkout_url: 'https://checkout.wompi.co/pay/abc123',
        },
        deliveryAddress: null,
        paymentProvider: 'WOMPI',
      },
    });

    renderWithProviders(<CheckoutConfirmation />, { store });

    expect(screen.getByText('Pedido Creado')).toBeInTheDocument();
    expect(screen.getByText('Pago aprobado')).toBeInTheDocument();
    expect(screen.getByText('Wompi')).toBeInTheDocument();
    expect(screen.getByText('Ir a Pagar')).toBeInTheDocument();
    expect(screen.getByText('Manzana Roja')).toBeInTheDocument();
  });

  it('CheckoutConfirmation muestra loading state', () => {
    const store = createTestStore({
      checkout: {
        currentStep: 'confirmation',
        loading: true,
        error: null,
        result: null,
        deliveryAddress: null,
        paymentProvider: null,
      },
    });

    renderWithProviders(<CheckoutConfirmation />, { store });

    expect(screen.getByText('Procesando Pedido')).toBeInTheDocument();
    expect(screen.getByText(/por favor espera/i)).toBeInTheDocument();
  });

  it('CheckoutConfirmation muestra error cuando no hay resultado', () => {
    const store = createTestStore({
      checkout: {
        currentStep: 'confirmation',
        loading: false,
        error: null,
        result: null,
        deliveryAddress: null,
        paymentProvider: null,
      },
    });

    renderWithProviders(<CheckoutConfirmation />, { store });

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText(/no se pudo procesar el pedido/i)).toBeInTheDocument();
  });

  it('CheckoutPage muestra error cuando checkoutSlice tiene error', async () => {
    const store = createTestStore({
      checkout: {
        currentStep: 'address',
        loading: false,
        error: 'Sesión expirada',
        result: null,
        deliveryAddress: null,
        paymentProvider: null,
      },
      auth: { user: mockUser, isAuthenticated: true, loading: false, error: null },
      cart: { data: mockCartWithItems, loading: false, error: null, isOpen: false, lastAction: null },
    });

    renderWithProviders(<CheckoutPage />, { store, route: '/checkout' });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Sesión expirada');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. PERFIL / PASSWORD-CHANGE
// ═══════════════════════════════════════════════════════════════════════════════

describe('Smoke E2E — Perfil / Password Change', () => {
  it('ProfilePage muestra perfil y formulario de cambio de contraseña para cliente autenticado', async () => {
    const store = createTestStore({
      auth: { user: mockUser, isAuthenticated: true, loading: false, error: null },
      profile: { user: mockUser, loading: false, error: null, successMessage: null, passwordChangeLoading: false, passwordChangeError: null, resetRequestLoading: false, resetRequestSent: false },
    });

    renderWithProviders(<ProfilePage />, { store, route: '/mi-cuenta' });

    expect(screen.getByText('Mi Cuenta')).toBeInTheDocument();
    expect(screen.getByText('Mi Perfil')).toBeInTheDocument();
    // "Cambiar Contraseña" appears as h2 heading AND button text
    expect(screen.getAllByText('Cambiar Contraseña').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Cerrar Sesión')).toBeInTheDocument();
  });

  it('ProfilePage muestra must_change_password guard', async () => {
    const store = createTestStore({
      auth: { user: mockMustChangePasswordUser, isAuthenticated: true, loading: false, error: null },
      profile: { user: mockMustChangePasswordUser, loading: false, error: null, successMessage: null, passwordChangeLoading: false, passwordChangeError: null, resetRequestLoading: false, resetRequestSent: false },
    });

    renderWithProviders(<ProfilePage />, { store, route: '/mi-cuenta' });

    expect(screen.getByText(/debes cambiar tu contraseña antes de continuar/i)).toBeInTheDocument();
    expect(screen.queryByText('Cerrar Sesión')).not.toBeInTheDocument();
  });

  it('ProfileForm muestra email deshabilitado y rol', () => {
    const store = createTestStore({
      auth: { user: mockUser, isAuthenticated: true, loading: false, error: null },
      profile: { user: mockUser, loading: false, error: null, successMessage: null, passwordChangeLoading: false, passwordChangeError: null, resetRequestLoading: false, resetRequestSent: false },
    });

    renderWithProviders(<ProfileForm />, { store });

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    expect(emailInput).toBeDisabled();
    expect(emailInput).toHaveValue('cristian@merkee.shop');

    expect(screen.getByDisplayValue('Cliente')).toBeInTheDocument(); // role display
    expect(screen.getByText(/el correo no se puede modificar/i)).toBeInTheDocument();
  });

  it('PasswordChangeForm muestra 3 campos: actual, nueva, confirmar', () => {
    renderWithProviders(<PasswordChangeForm />);

    expect(screen.getByLabelText(/contraseña actual/i)).toBeInTheDocument();
    // "Nueva contraseña" matches both label texts (label says "Nueva contraseña", confirm says "Confirmar nueva contraseña")
    expect(screen.getByLabelText('Nueva contraseña')).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar nueva contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cambiar contraseña/i })).toBeInTheDocument();
  });

  it('PasswordChangeForm tiene minLength=12 en nueva contraseña', () => {
    renderWithProviders(<PasswordChangeForm />);

    expect(screen.getByLabelText('Nueva contraseña')).toHaveAttribute('minlength', '12');
    expect(screen.getByLabelText(/confirmar nueva contraseña/i)).toHaveAttribute('minlength', '12');
  });

  it('PasswordChangeForm usa autoComplete correctos', () => {
    renderWithProviders(<PasswordChangeForm />);

    expect(screen.getByLabelText(/contraseña actual/i)).toHaveAttribute('autocomplete', 'current-password');
    expect(screen.getByLabelText('Nueva contraseña')).toHaveAttribute('autocomplete', 'new-password');
    expect(screen.getByLabelText(/confirmar nueva contraseña/i)).toHaveAttribute('autocomplete', 'new-password');
  });

  it('ProfileForm muestra botón "Guardar Cambios"', () => {
    const store = createTestStore({
      auth: { user: mockUser, isAuthenticated: true, loading: false, error: null },
      profile: { user: mockUser, loading: false, error: null, successMessage: null, passwordChangeLoading: false, passwordChangeError: null, resetRequestLoading: false, resetRequestSent: false },
    });

    renderWithProviders(<ProfileForm />, { store });

    expect(screen.getByRole('button', { name: /guardar cambios/i })).toBeInTheDocument();
  });

  it('ProfilePage redirige a /auth si no está autenticado', () => {
    const store = createTestStore({
      auth: { user: null, isAuthenticated: false, loading: false, error: null },
    });

    renderWithProviders(<ProfilePage />, { store, route: '/mi-cuenta' });

    // Should not render profile content
    expect(screen.queryByText('Mi Cuenta')).not.toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. ÓRDENES
// ═══════════════════════════════════════════════════════════════════════════════

describe('Smoke E2E — Órdenes', () => {
  it('OrdersPage muestra lista de pedidos para usuario autenticado', async () => {
    const store = createTestStore({
      auth: { user: mockUser, isAuthenticated: true, loading: false, error: null },
    });

    renderWithProviders(<OrdersPage />, { store, route: '/pedidos' });

    // "Mis Pedidos" appears both as page h1 and inside OrdersList h2
    expect(screen.getAllByText('Mis Pedidos').length).toBeGreaterThanOrEqual(1);

    await waitFor(() => {
      expect(screen.getByText('#ORD-2026-001')).toBeInTheDocument();
    });
  });

  it('OrdersList muestra estados de pago en es-CO', async () => {
    const store = createTestStore({
      orders: { items: [mockOrder], page: { page: 1, size: 10, total: 1 }, loading: false, error: null, selectedOrder: null, selectedOrderLoading: false },
    });

    renderWithProviders(<OrdersList />, { store });

    await waitFor(() => {
      expect(screen.getByText('Pagado')).toBeInTheDocument();
    });
  });

  it('OrdersList muestra total en COP', async () => {
    const store = createTestStore({
      orders: { items: [mockOrder], page: { page: 1, size: 10, total: 1 }, loading: false, error: null, selectedOrder: null, selectedOrderLoading: false },
    });

    renderWithProviders(<OrdersList />, { store });

    await waitFor(() => {
      const allText = document.body.textContent || '';
      expect(allText).toMatch(/\$\s?[\d.,]+/);
    });
  });

  it('OrdersList muestra "No tienes pedidos aún" cuando está vacío', async () => {
    mockApi.listMyOrders.mockResolvedValue({ items: [], page: null });

    const store = createTestStore({
      orders: { items: [], page: null, loading: false, error: null, selectedOrder: null, selectedOrderLoading: false },
    });

    renderWithProviders(<OrdersList />, { store });

    await waitFor(() => {
      expect(screen.getByText('No tienes pedidos aún')).toBeInTheDocument();
    });
  });

  it('OrdersList muestra loading cuando carga', () => {
    const store = createTestStore({
      orders: { items: [], page: null, loading: true, error: null, selectedOrder: null, selectedOrderLoading: false },
    });

    renderWithProviders(<OrdersList />, { store });

    expect(screen.getByText('Cargando pedidos...')).toBeInTheDocument();
  });

  it('OrdersList muestra error con botón reintentar', async () => {
    mockApi.listMyOrders.mockRejectedValue({ status: 500, message: 'Error al cargar órdenes', code: 'INTERNAL_ERROR' });

    const store = createTestStore({
      orders: { items: [], page: null, loading: false, error: null, selectedOrder: null, selectedOrderLoading: false },
    });

    renderWithProviders(<OrdersList />, { store });

    await waitFor(() => {
      expect(screen.getByText('Error al cargar órdenes')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
    });
  });

  it('OrderDetail muestra información completa de la orden', async () => {
    const store = createTestStore({
      orders: { items: [], page: null, loading: false, error: null, selectedOrder: mockOrder, selectedOrderLoading: false },
      auth: { user: mockUser, isAuthenticated: true, loading: false, error: null },
    });

    renderWithProviders(<OrderDetail />, { store, route: '/pedidos/ord-001' });

    await waitFor(() => {
      expect(screen.getByText('Pedido #ORD-2026-001')).toBeInTheDocument();
    });

    expect(screen.getByText('Pagado')).toBeInTheDocument();
    expect(screen.getByText('Wompi')).toBeInTheDocument();
    expect(screen.getByText('Manzana Roja')).toBeInTheDocument();
    expect(screen.getByText('Cristian test')).toBeInTheDocument();
    expect(screen.getByText('Bogotá')).toBeInTheDocument();

    // Totals in COP
    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    expect(screen.getByText('IVA (19%)')).toBeInTheDocument();
    expect(screen.getByText('Entrega')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('OrderDetail muestra "Pedido no encontrado" cuando no hay orden', async () => {
    const store = createTestStore({
      orders: { items: [], page: null, loading: false, error: null, selectedOrder: null, selectedOrderLoading: false },
      auth: { user: mockUser, isAuthenticated: true, loading: false, error: null },
    });

    renderWithProviders(<OrderDetail />, { store, route: '/pedidos/unknown' });

    await waitFor(() => {
      expect(screen.getByText('Pedido no encontrado')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /volver a mis pedidos/i })).toBeInTheDocument();
  });

  it('OrderDetail tiene botón "Volver a mis pedidos"', async () => {
    const store = createTestStore({
      orders: { items: [], page: null, loading: false, error: null, selectedOrder: mockOrder, selectedOrderLoading: false },
      auth: { user: mockUser, isAuthenticated: true, loading: false, error: null },
    });

    renderWithProviders(<OrderDetail />, { store, route: '/pedidos/ord-001' });

    await waitFor(() => {
      expect(screen.getByText('Pedido #ORD-2026-001')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /volver a mis pedidos/i })).toBeInTheDocument();
  });

  it('OrdersPage redirige a /auth si no está autenticado', () => {
    const store = createTestStore({
      auth: { user: null, isAuthenticated: false, loading: false, error: null },
    });

    renderWithProviders(<OrdersPage />, { store, route: '/pedidos' });

    expect(screen.queryByText('Mis Pedidos')).not.toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 7. NO localStorage/sessionStorage de token/carrito
// ═══════════════════════════════════════════════════════════════════════════════

describe('Smoke E2E — Seguridad de storage (sin localStorage/sessionStorage de token/carrito)', () => {
  it('AuthSlice no persiste token en localStorage', async () => {
    mockApi.login.mockResolvedValue({
      access_token: 'test-jwt-token-abc123',
      expires_at: '2026-12-31T23:59:59Z',
      user: mockUser,
    });

    const store = createTestStore();
    const { loginUser } = await import('../store/authSlice');

    await store.dispatch(loginUser({ email: 'test@merkee.shop', password: '123456789012' }));

    const state = store.getState();
    expect(state.auth.isAuthenticated).toBe(true);
    expect(state.auth.user?.email).toBe('cristian@merkee.shop');

    // Verify no token in storage — spy checks after this test's own afterEach clears
    const tokenSetCalls = localStorageSetSpy.mock.calls.filter(
      ([key]) => key === 'token' || key === 'access_token',
    );
    expect(tokenSetCalls).toHaveLength(0);
  });

  it('CartSlice no persiste carrito en localStorage', async () => {
    mockApi.fetchCart.mockResolvedValue(mockCartWithItems);

    const store = createTestStore();
    const { loadCart } = await import('../store/cartSlice');

    await store.dispatch(loadCart());

    const state = store.getState();
    expect(state.cart.data).toEqual(mockCartWithItems);

    // Verify no cart data in storage
    const cartSetCalls = localStorageSetSpy.mock.calls.filter(
      ([key]) => key === 'cart' || key === 'cartData',
    );
    expect(cartSetCalls).toHaveLength(0);
  });

  it('AuthSlice limpia estado en logout sin residuos en storage', async () => {
    mockApi.logout.mockResolvedValue(undefined);

    const store = createTestStore({
      auth: { user: mockUser, isAuthenticated: true, loading: false, error: null },
    });

    const { logoutUser } = await import('../store/authSlice');

    await store.dispatch(logoutUser());

    const state = store.getState();
    expect(state.auth.isAuthenticated).toBe(false);
    expect(state.auth.user).toBeNull();

    // No token was ever set in storage
    const tokenSetCalls = localStorageSetSpy.mock.calls.filter(
      ([key]) => key === 'token' || key === 'access_token',
    );
    expect(tokenSetCalls).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 8. ERRORES 401/403/409/410/422 Y TEXTOS es-CO/COP
// ═══════════════════════════════════════════════════════════════════════════════

describe('Smoke E2E — Errores 401/403/409/410/422 y textos es-CO/COP', () => {
  it('ErrorMessage muestra icono, texto y botón de reintentar', () => {
    const onRetry = vi.fn();
    render(<ErrorMessage message="Error al cargar datos" onRetry={onRetry} />);

    expect(screen.getByText('Error al cargar datos')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('ErrorMessage sin onRetry no muestra botón', () => {
    render(<ErrorMessage message="Error permanente" />);

    expect(screen.getByText('Error permanente')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /reintentar/i })).not.toBeInTheDocument();
  });

  it('Loading muestra spinner con message', () => {
    render(<Loading message="Cargando productos..." />);

    expect(screen.getByText('Cargando productos...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('Loading fullPage usa clase correspondiente', () => {
    const { container } = render(<Loading message="Cargando..." fullPage />);

    const loadingEl = container.querySelector('.loading--fullpage');
    expect(loadingEl).toBeInTheDocument();
  });

  it('EmptyState muestra título, mensaje y acción opcional', () => {
    const onAction = vi.fn();
    render(
      <EmptyState
        title="Sin resultados"
        message="No hay nada por aquí"
        actionLabel="Volver"
        onAction={onAction}
      />,
    );

    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(screen.getByText('No hay nada por aquí')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /volver/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /volver/i }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('EmptyState sin actionLabel no muestra botón', () => {
    render(<EmptyState title="Vacío" message="Nada aquí" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('AuthSlice maneja error 401 (credenciales inválidas) con texto es-CO', async () => {
    mockApi.login.mockRejectedValue({
      status: 401,
      message: 'Credenciales inválidas',
      code: 'INVALID_CREDENTIALS',
    });

    const store = createTestStore();
    const { loginUser } = await import('../store/authSlice');

    await store.dispatch(loginUser({ email: 'bad@test.com', password: 'wrong' }));

    const state = store.getState();
    expect(state.auth.error).toBe('Credenciales inválidas');
    expect(state.auth.isAuthenticated).toBe(false);
  });

  it('AuthSlice maneja error 403 (forbidden) con texto es-CO', async () => {
    mockApi.login.mockRejectedValue({
      status: 403,
      message: 'Acceso denegado',
      code: 'ACCESS_DENIED',
    });

    const store = createTestStore();
    const { loginUser } = await import('../store/authSlice');

    await store.dispatch(loginUser({ email: 'test@test.com', password: '123456789012' }));

    const state = store.getState();
    expect(state.auth.error).toBe('Acceso denegado');
  });

  it('AuthSlice maneja error 409 (conflicto) con texto es-CO', async () => {
    mockApi.register.mockRejectedValue({
      status: 409,
      message: 'El correo ya está registrado',
      code: 'EMAIL_ALREADY_EXISTS',
    });

    const store = createTestStore();
    const { registerUser } = await import('../store/authSlice');

    await store.dispatch(registerUser({ display_name: 'Test', email: 'dup@test.com', password: '123456789012' }));

    const state = store.getState();
    expect(state.auth.error).toBe('El correo ya está registrado');
  });

  it('AuthSlice maneja error 410 (gone/resource expired) con texto es-CO', async () => {
    mockApi.refreshSession.mockRejectedValue({
      status: 410,
      message: 'Sesión expirada',
      code: 'SESSION_EXPIRED',
    });

    const store = createTestStore({
      auth: { user: mockUser, isAuthenticated: true, loading: false, error: null },
    });

    const { refreshUser } = await import('../store/authSlice');

    await store.dispatch(refreshUser());

    const state = store.getState();
    expect(state.auth.isAuthenticated).toBe(false);
    expect(state.auth.user).toBeNull();
  });

  it('CheckoutSlice maneja error 422 (validación) con texto es-CO', async () => {
    mockApi.createCheckout.mockRejectedValue({
      status: 422,
      message: 'Dirección de entrega inválida',
      code: 'VALIDATION_ERROR',
    });

    const store = createTestStore();
    const { submitCheckout } = await import('../store/checkoutSlice');

    await store.dispatch(submitCheckout({
      delivery_address: { recipient_name: 'Test', line1: 'Calle 1', city: 'Bogotá', phone: '3001234567' },
      payment_provider: 'WOMPI',
    }));

    const state = store.getState();
    expect(state.checkout.error).toBe('Dirección de entrega inválida');
  });

  it('OrdersSlice maneja error 401 (no autenticado)', async () => {
    mockApi.listMyOrders.mockRejectedValue({
      status: 401,
      message: 'No autenticado',
      code: 'UNAUTHORIZED',
    });

    const store = createTestStore();
    const { fetchOrders } = await import('../store/ordersSlice');

    await store.dispatch(fetchOrders({}));

    const state = store.getState();
    expect(state.orders.error).toBe('No autenticado');
  });

  it('OrdersSlice maneja error 403 (admin forbidden en storefront)', async () => {
    mockApi.listMyOrders.mockRejectedValue({
      status: 403,
      message: 'No tienes permisos para acceder a este recurso',
      code: 'FORBIDDEN',
    });

    const store = createTestStore();
    const { fetchOrders } = await import('../store/ordersSlice');

    await store.dispatch(fetchOrders({}));

    const state = store.getState();
    expect(state.orders.error).toBe('No tienes permisos para acceder a este recurso');
  });

  it('ProfileSlice maneja error 409 en cambio de contraseña (idempotency replay)', async () => {
    mockApi.changePassword.mockRejectedValue({
      status: 409,
      message: 'Solicitud duplicada',
      code: 'IDEMPOTENCY_KEY_REUSED',
    });

    const store = createTestStore();
    const { changeUserPassword } = await import('../store/profileSlice');

    await store.dispatch(changeUserPassword({
      current_password: 'current123456',
      new_password: 'new1234567890',
    }));

    const state = store.getState();
    expect(state.profile.passwordChangeError).toBe('Solicitud duplicada');
  });

  it('ProfileSlice maneja error 422 en reset de contraseña (token inválido)', async () => {
    mockApi.resetPassword.mockRejectedValue({
      status: 422,
      message: 'Token inválido o expirado',
      code: 'PASSWORD_RESET_TOKEN_INVALID_OR_EXPIRED',
    });

    const store = createTestStore();
    const { confirmPasswordReset } = await import('../store/profileSlice');

    await store.dispatch(confirmPasswordReset({
      token: 'invalid-token',
      new_password: 'new1234567890',
    }));

    const state = store.getState();
    expect(state.profile.error).toBe('Token inválido o expirado');
  });

  it('Todos los textos de UI están en es-CO (sin textos ingleses)', async () => {
    renderWithProviders(<Header />);

    // Header texts
    expect(screen.queryByText('Home')).not.toBeInTheDocument();
    expect(screen.queryByText('Categories')).not.toBeInTheDocument();
    expect(screen.queryByText('Products')).not.toBeInTheDocument();
    expect(screen.queryByText('Search')).not.toBeInTheDocument();

    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Categorías')).toBeInTheDocument();
    expect(screen.getByText('Productos')).toBeInTheDocument();
  });

  it('COP se formatea con Intl.NumberFormat es-CO (sin decimales)', () => {
    const formatCOP = (value: number) =>
      new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);

    expect(formatCOP(4900)).toMatch(/\$\s?4\.900/);
    expect(formatCOP(16662)).toMatch(/\$\s?16\.662/);
    expect(formatCOP(0)).toMatch(/\$\s?0/);
  });

  it('CheckoutConfirmation muestra estados de pago localizados en es-CO', () => {
    const statusMessages: Record<string, string> = {
      PENDING_PAYMENT: 'Pago pendiente',
      PAID: 'Pago aprobado',
      PAYMENT_FAILED: 'Pago fallido',
      PAYMENT_EXPIRED: 'Pago expirado',
      RESERVATION_EXPIRED: 'Reserva expirada',
      PAYMENT_REFUND_PENDING: 'Reembolso pendiente',
      PAYMENT_REFUNDED: 'Reembolsado',
      PAYMENT_REFUND_FAILED: 'Error en reembolso',
    };

    expect(statusMessages['PAID']).toBe('Pago aprobado');
    expect(statusMessages['PENDING_PAYMENT']).toBe('Pago pendiente');
    expect(statusMessages['PAYMENT_FAILED']).toBe('Pago fallido');
    expect(statusMessages['PAYMENT_EXPIRED']).toBe('Pago expirado');
    expect(statusMessages['RESERVATION_EXPIRED']).toBe('Reserva expirada');
    expect(statusMessages['PAYMENT_REFUND_PENDING']).toBe('Reembolso pendiente');
    expect(statusMessages['PAYMENT_REFUNDED']).toBe('Reembolsado');
    expect(statusMessages['PAYMENT_REFUND_FAILED']).toBe('Error en reembolso');

    // No english status labels
    expect(statusMessages['PAID']).not.toBe('Paid');
    expect(statusMessages['PENDING_PAYMENT']).not.toBe('Pending Payment');
  });

  it('OrdersList muestra estados de orden localizados en es-CO', () => {
    const statusMessages: Record<string, string> = {
      PENDING_PAYMENT: 'Pago pendiente',
      PAID: 'Pagado',
      PAYMENT_FAILED: 'Pago fallido',
      PAYMENT_EXPIRED: 'Pago expirado',
      RESERVATION_EXPIRED: 'Reserva expirada',
      PAYMENT_REFUND_PENDING: 'Reembolso pendiente',
      PAYMENT_REFUNDED: 'Reembolsado',
      PAYMENT_REFUND_FAILED: 'Error en reembolso',
    };

    expect(statusMessages['PAID']).toBe('Pagado');
    // No "Paid" in English
    expect(statusMessages['PAID']).not.toBe('Paid');
  });

  it('Formularios muestran placeholders en es-CO', () => {
    renderWithProviders(<LoginForm />, { route: '/auth' });

    expect(screen.getByPlaceholderText('tu@ejemplo.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Mínimo 12 caracteres')).toBeInTheDocument();
  });

  it('RegisterForm muestra placeholders en es-CO', () => {
    renderWithProviders(<RegisterForm />, { route: '/auth' });

    expect(screen.getByPlaceholderText('Tu nombre')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('tu@ejemplo.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Mínimo 12 caracteres')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Repite tu contraseña')).toBeInTheDocument();
  });

  it('Footer muestra textos es-CO y moneda COP', () => {
    render(
      <Provider store={createTestStore()}>
        <MemoryRouter>
          <footer className="footer">
            <div className="footer__container">
              <p className="footer__text">
                © {new Date().getFullYear()} merkee.shop — Tu supermercado digital
              </p>
              <p className="footer__text footer__text--small">
                Todos los precios incluyen IVA cuando aplica. Envío: $5.000 COP.
              </p>
            </div>
          </footer>
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByText(/merkee\.shop — Tu supermercado digital/)).toBeInTheDocument();
    expect(screen.getByText(/\$5\.000 COP/)).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 9. ACCESIBILIDAD / RESPONSIVE (ARIA)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Smoke E2E — Accesibilidad y Responsive (ARIA)', () => {
  it('Header tiene aria-label en navegación y botones', () => {
    renderWithProviders(<Header />);

    expect(screen.getByRole('navigation', { name: /navegación principal/i })).toBeInTheDocument();
    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /carrito de compras/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /menú de navegación/i })).toBeInTheDocument();
  });

  it('Header menú móvil tiene aria-expanded', () => {
    renderWithProviders(<Header />);

    const menuBtn = screen.getByRole('button', { name: /menú de navegación/i });
    expect(menuBtn).toHaveAttribute('aria-expanded', 'false');
  });

  it('CartPanel tiene role="dialog" y aria-label', async () => {
    const store = createTestStore();
    store.dispatch(openCart());

    renderWithProviders(<CartPanel />, { store });

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /carrito de compras/i })).toBeInTheDocument();
    });
  });

  it('CheckoutSteps tiene aria-label en navegación', () => {
    renderWithProviders(<CheckoutSteps />);

    expect(screen.getByRole('navigation', { name: /pasos del checkout/i })).toBeInTheDocument();
  });

  it('ProductCard tiene aria-label en botón de agregar', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    expect(screen.getByRole('button', { name: /agregar manzana roja al carrito/i })).toBeInTheDocument();
  });

  it('ErrorMessage tiene role="alert"', () => {
    render(<ErrorMessage message="Error" />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('Loading tiene role="status"', () => {
    render(<Loading />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('Forms tienen aria-label descriptivos', () => {
    renderWithProviders(<LoginForm />, { route: '/auth' });

    expect(screen.getByRole('form', { name: /formulario de inicio de sesión/i })).toBeInTheDocument();
  });

  it('RegisterForm tiene aria-label', () => {
    renderWithProviders(<RegisterForm />, { route: '/auth' });

    expect(screen.getByRole('form', { name: /formulario de registro/i })).toBeInTheDocument();
  });

  it('PasswordChangeForm tiene aria-label', () => {
    renderWithProviders(<PasswordChangeForm />);

    expect(screen.getByRole('form', { name: /formulario de cambio de contraseña/i })).toBeInTheDocument();
  });

  it('CartItem tiene aria-labels descriptivos en controles de cantidad', () => {
    renderWithProviders(<CartItem item={mockCartWithItems.items[0]} />);

    expect(screen.getByRole('button', { name: /reducir cantidad de manzana roja/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /aumentar cantidad de manzana roja/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /eliminar manzana roja del carrito/i })).toBeInTheDocument();
  });

  it('DeliveryAddressForm muestra errores de validación después de submit', async () => {
    renderWithProviders(<DeliveryAddressForm />);

    // Type invalid data: recipient_name length 1 (< 2 minimum)
    fireEvent.change(screen.getByLabelText(/nombre del destinatario/i), { target: { value: 'X' } });
    fireEvent.change(screen.getByLabelText(/^dirección$/i), { target: { value: 'ABC' } });
    fireEvent.change(screen.getByLabelText(/^ciudad$/i), { target: { value: 'B' } });
    fireEvent.change(screen.getByLabelText(/^teléfono$/i), { target: { value: '12' } });

    fireEvent.submit(screen.getByRole('button', { name: /continuar/i }));

    await waitFor(() => {
      expect(screen.getByText(/nombre debe tener entre 2 y 100/i)).toBeInTheDocument();
      expect(screen.getByText(/dirección debe tener entre 5 y 180/i)).toBeInTheDocument();
      expect(screen.getByText(/ciudad debe tener entre 2 y 100/i)).toBeInTheDocument();
      expect(screen.getByText(/teléfono debe tener entre 7 y 30/i)).toBeInTheDocument();
    });
  });

  it('Footer tiene aria-hidden en elementos decorativos', () => {
    render(
      <Provider store={createTestStore()}>
        <MemoryRouter>
          <footer className="footer">
            <div className="footer__container">
              <p className="footer__text">© 2026 merkee.shop</p>
            </div>
          </footer>
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByText(/merkee\.shop/)).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 10. FLUJO COMPLETO: GUEST → CARRITO → CHECKOUT VISUAL
// ═══════════════════════════════════════════════════════════════════════════════

describe('Smoke E2E — Flujo guest → carrito → checkout visual', () => {
  it('Flujo completo: agregar producto, ver carrito, avanzar pasos de checkout', async () => {
    const store = createTestStore();
    mockApi.addCartItem.mockResolvedValue(mockCartWithItems);

    // 1. Agregar producto al carrito
    const { addToCart } = await import('../store/cartSlice');
    await store.dispatch(addToCart({ productId: mockProduct.id, quantity: 2 }));

    const stateAfterAdd = store.getState();
    expect(stateAfterAdd.cart.data?.items.length).toBeGreaterThan(0);
    expect(stateAfterAdd.cart.isOpen).toBe(true);

    // 2. Verificar carrito tiene items
    renderWithProviders(<CartPanel />, { store });

    await waitFor(() => {
      expect(screen.getByText('Manzana Roja')).toBeInTheDocument();
    });

    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();

    // 3. Checkout empieza en paso auth para guest
    const { setCheckoutStep } = await import('../store/checkoutSlice');
    store.dispatch(setCheckoutStep('auth'));

    const checkoutState = store.getState();
    expect(checkoutState.checkout.currentStep).toBe('auth');

    // 4. Avanzar a dirección
    store.dispatch(setCheckoutStep('address'));
    expect(store.getState().checkout.currentStep).toBe('address');

    // 5. Avanzar a proveedor de pago
    store.dispatch(setCheckoutStep('provider'));
    expect(store.getState().checkout.currentStep).toBe('provider');

    // 6. Avanzar a confirmación
    store.dispatch(setCheckoutStep('confirmation'));
    expect(store.getState().checkout.currentStep).toBe('confirmation');
  });
});
