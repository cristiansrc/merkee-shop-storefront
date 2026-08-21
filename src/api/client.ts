/**
 * Cliente API para merkee.shop storefront.
 * Derivado del contrato OpenAPI: docs/api/openapi.yaml
 *
 * - Usa fetch nativo (sin Axios) para mantener mínimo el bundle.
 * - Detecta si la API está disponible; si no, usa mocks.
 * - NO modifica el contrato OpenAPI.
 * - NO persiste tokens ni carrito en localStorage/sessionStorage.
 */

import type {
  CategoryResponse,
  ProductResponse,
  BannerResponse,
  CartResponse,
  PagedProductResponse,
  ProductQueryParams,
  CartItemMutationRequest,
  SetCartItemQuantityRequest,
  SessionResponse,
  RegisterRequest,
  LoginRequest,
  UserResponse,
  UpdateProfileRequest,
  PasswordChangeRequest,
  PasswordResetRequest,
  PasswordResetConfirmRequest,
  CreateCheckoutRequest,
  CheckoutResponse,
  OrderResponse,
  PagedOrderResponse,
  OrderQueryParams,
} from '../types/api';
import {
  mockCategories,
  mockProducts,
  mockBanners,
  getMockPagedProducts,
  getMockCartWithItems,
} from './mocks';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.merkee.shop/v1';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

// === Estado de disponibilidad de API ===
let apiAvailable: boolean | null = null;

// === Token de acceso en memoria (nunca en localStorage/sessionStorage) ===
let accessToken: string | null = null;

export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};

export const getAccessToken = (): string | null => accessToken;

// === Refresh silencioso (single-flight + retry único, sin bucle) ===
let refreshPromise: Promise<boolean> | null = null;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;

/** Decodifica la expiración (`exp`) de un JWT de acceso (ms epoch). */
export function decodeAccessTokenExpiry(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(atob(normalized)) as { exp?: unknown };
    return typeof json.exp === 'number' ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}

async function tryRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        await refreshSession();
        return true;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

/** Programa un refresh proactivo ~60 s antes de la expiración del access token. */
export function scheduleRefresh(token: string): void {
  if (refreshTimer) clearTimeout(refreshTimer);
  const expiry = decodeAccessTokenExpiry(token);
  if (!expiry) return;
  const delay = Math.max(expiry - Date.now() - 60_000, 1_000);
  refreshTimer = setTimeout(() => {
    void tryRefresh();
  }, delay);
}

async function checkApiAvailability(): Promise<boolean> {
  if (apiAvailable !== null) return apiAvailable;
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    });
    apiAvailable = response.ok || response.status === 401;
  } catch {
    apiAvailable = false;
  }
  return apiAvailable;
}

// === Helpers ===
function buildQueryString(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

async function apiFetch<T>(
  path: string,
  options?: RequestInit,
  opts?: { retryOn401?: boolean },
): Promise<T> {
  const retryOn401 = opts?.retryOn401 ?? true;

  const doFetch = (): Promise<Response> =>
    fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...options?.headers,
      },
    });

  let response = await doFetch();

  // 410 SESSION_EXPIRED: refresh una vez + reintento (sin bucle).
  // CART_RESERVATION_EXPIRED u otros 410: sin reintento.
  if (response.status === 410 && retryOn401) {
    const errorBody = await response.clone().json().catch(() => null);
    if (errorBody?.code === 'SESSION_EXPIRED') {
      const refreshed = await tryRefresh();
      if (refreshed) {
        response = await doFetch();
      } else {
        // Refresh falló: limpiar token y timer
        setAccessToken(null);
        if (refreshTimer) {
          clearTimeout(refreshTimer);
          refreshTimer = null;
        }
      }
    }
  }

  // Refresh silencioso + reintento UNA sola vez ante 401 (sin bucle).
  if (response.status === 401 && retryOn401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      response = await doFetch();
    }
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw {
      status: response.status,
      message: errorBody?.message || `Error ${response.status}`,
      code: errorBody?.code || 'UNKNOWN_ERROR',
      body: errorBody,
    };
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

// === API Endpoints ===

// --- Catálogo ---

export async function fetchCategories(): Promise<CategoryResponse[]> {
  if (USE_MOCKS || !(await checkApiAvailability())) {
    return mockCategories;
  }
  return apiFetch<CategoryResponse[]>('/categories');
}

export async function fetchProducts(
  params: ProductQueryParams = {},
): Promise<PagedProductResponse> {
  if (USE_MOCKS || !(await checkApiAvailability())) {
    return getMockPagedProducts(params.page, params.size, params.category_id, params.q);
  }
  const qs = buildQueryString({
    page: params.page,
    size: params.size,
    category_id: params.category_id,
    q: params.q,
  });
  return apiFetch<PagedProductResponse>(`/products${qs}`);
}

export async function fetchProduct(productId: string): Promise<ProductResponse> {
  if (USE_MOCKS || !(await checkApiAvailability())) {
    const product = mockProducts.find((p) => p.id === productId);
    if (!product) throw { status: 404, message: 'Producto no encontrado', code: 'RESOURCE_NOT_FOUND' };
    return product;
  }
  return apiFetch<ProductResponse>(`/products/${productId}`);
}

export async function fetchBanners(): Promise<BannerResponse[]> {
  if (USE_MOCKS || !(await checkApiAvailability())) {
    return mockBanners;
  }
  return apiFetch<BannerResponse[]>('/banners');
}

// --- Carrito ---

export async function fetchCart(): Promise<CartResponse> {
  if (USE_MOCKS || !(await checkApiAvailability())) {
    return getMockCartWithItems();
  }
  return apiFetch<CartResponse>('/cart');
}

export async function addCartItem(
  request: CartItemMutationRequest,
): Promise<CartResponse> {
  if (USE_MOCKS || !(await checkApiAvailability())) {
    // Simular agregar item al carrito mock
    const cart = getMockCartWithItems();
    const existingItem = cart.items.find((i) => i.product.id === request.product_id);
    if (existingItem) {
      existingItem.quantity += request.quantity;
    } else {
      const product = mockProducts.find((p) => p.id === request.product_id);
      if (product) {
        cart.items.push({
          product,
          quantity: request.quantity,
          reservation_status: 'ACTIVE',
          reservation_expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        });
      }
    }
    // Recalcular totales
    cart.items_subtotal_cop = cart.items.reduce(
      (sum, item) => sum + item.product.sale_price_cop * item.quantity,
      0,
    );
    cart.iva_cop = Math.floor((cart.items_subtotal_cop * 19 + 50) / 100);
    cart.total_cop = cart.items_subtotal_cop + cart.delivery_fee_cop + cart.iva_cop;
    return cart;
  }

  const idempotencyKey = crypto.randomUUID();
  return apiFetch<CartResponse>('/cart/items', {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify(request),
  });
}

export async function setCartItemQuantity(
  productId: string,
  request: SetCartItemQuantityRequest,
): Promise<CartResponse> {
  if (USE_MOCKS || !(await checkApiAvailability())) {
    const cart = getMockCartWithItems();
    const item = cart.items.find((i) => i.product.id === productId);
    if (item) {
      item.quantity = request.quantity;
    }
    cart.items_subtotal_cop = cart.items.reduce(
      (sum, i) => sum + i.product.sale_price_cop * i.quantity,
      0,
    );
    cart.iva_cop = Math.floor((cart.items_subtotal_cop * 19 + 50) / 100);
    cart.total_cop = cart.items_subtotal_cop + cart.delivery_fee_cop + cart.iva_cop;
    return cart;
  }

  const idempotencyKey = crypto.randomUUID();
  return apiFetch<CartResponse>(`/cart/items/${productId}`, {
    method: 'PUT',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify(request),
  });
}

export async function removeCartItem(productId: string): Promise<void> {
  if (USE_MOCKS || !(await checkApiAvailability())) {
    return; // Simular eliminación exitosa
  }

  const idempotencyKey = crypto.randomUUID();
  await apiFetch<void>(`/cart/items/${productId}`, {
    method: 'DELETE',
    headers: { 'Idempotency-Key': idempotencyKey },
  });
}

// --- Auth ---

export async function register(request: RegisterRequest): Promise<SessionResponse> {
  const session = await apiFetch<SessionResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(request),
  }, { retryOn401: false });
  setAccessToken(session.access_token);
  scheduleRefresh(session.access_token);
  return session;
}

export async function login(request: LoginRequest): Promise<SessionResponse> {
  const session = await apiFetch<SessionResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(request),
  }, { retryOn401: false });
  setAccessToken(session.access_token);
  scheduleRefresh(session.access_token);
  return session;
}

export async function refreshSession(): Promise<SessionResponse> {
  const session = await apiFetch<SessionResponse>('/auth/refresh', {
    method: 'POST',
  }, { retryOn401: false });
  setAccessToken(session.access_token);
  scheduleRefresh(session.access_token);
  return session;
}

export async function logout(): Promise<void> {
  await apiFetch<void>('/auth/logout', {
    method: 'POST',
  }, { retryOn401: false });
  setAccessToken(null);
  if (refreshTimer) clearTimeout(refreshTimer);
}

export async function requestPasswordReset(
  request: PasswordResetRequest,
): Promise<void> {
  await apiFetch<void>('/auth/password-reset-requests', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function resetPassword(
  request: PasswordResetConfirmRequest,
): Promise<void> {
  await apiFetch<void>('/auth/password-resets', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// --- Profile ---

export async function getMyProfile(): Promise<UserResponse> {
  return apiFetch<UserResponse>('/me');
}

export async function updateMyProfile(
  request: UpdateProfileRequest,
): Promise<UserResponse> {
  const idempotencyKey = crypto.randomUUID();
  return apiFetch<UserResponse>('/me', {
    method: 'PATCH',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify(request),
  });
}

export async function changePassword(
  request: PasswordChangeRequest,
): Promise<void> {
  const idempotencyKey = crypto.randomUUID();
  await apiFetch<void>('/auth/password-change', {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify(request),
  });
}

// --- Checkout ---

export async function createCheckout(
  request: CreateCheckoutRequest,
): Promise<CheckoutResponse> {
  const idempotencyKey = crypto.randomUUID();
  return apiFetch<CheckoutResponse>('/checkouts', {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify(request),
  });
}

// --- Orders ---

export async function listMyOrders(
  params: OrderQueryParams = {},
): Promise<PagedOrderResponse> {
  const qs = buildQueryString({
    page: params.page,
    size: params.size,
  });
  return apiFetch<PagedOrderResponse>(`/orders${qs}`);
}

export async function getMyOrder(orderId: string): Promise<OrderResponse> {
  return apiFetch<OrderResponse>(`/orders/${orderId}`);
}
