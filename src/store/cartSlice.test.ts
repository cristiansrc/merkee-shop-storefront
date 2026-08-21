/**
 * Tests para cartSlice.
 * Verifica que SESSION_EXPIRED del carrito (sesión guest obsoleta) limpia el
 * estado stale y NO se confunde con un refresh de auth.
 */

import { describe, it, expect } from 'vitest';
import { cartReducer } from './cartSlice';
import type { CartResponse } from '../types/api';

function cartData(): CartResponse {
  return {
    id: 'cart-1',
    status: 'ACTIVE',
    items: [
      {
        product: {
          id: 'prod-1',
          category: { id: 'cat-1', name: 'Frutas', image: { key: 'k', url: 'u', alt_text: 'a', position: 0 }, version: 1 },
          name: 'Manzana Roja',
          description: '',
          regular_price_cop: 5900,
          sale_price_cop: 4900,
          unit: 'kg',
          stock_available: 10,
          images: [{ key: 'k', url: 'u', alt_text: 'a', position: 0 }],
          version: 1,
        },
        quantity: 1,
        reservation_status: 'ACTIVE',
        reservation_expires_at: null,
      },
    ],
    items_subtotal_cop: 4900,
    delivery_fee_cop: 5000,
    iva_cop: 931,
    tax_rate_basis_points: 1900,
    total_cop: 10831,
    reservation_expires_at: null,
  };
}

function staleState() {
  return {
    data: cartData(),
    loading: true,
    error: null,
    isOpen: false,
    lastAction: null,
  };
}

describe('cartSlice', () => {
  it('limpia el carrito stale ante SESSION_EXPIRED (sesión guest obsoleta)', () => {
    const state = cartReducer(staleState(), {
      type: 'cart/load/rejected',
      payload: { message: 'Sesión expirada', code: 'SESSION_EXPIRED' },
    });

    expect(state.loading).toBe(false);
    expect(state.data).toBeNull();
    expect(state.error).toBe('Sesión expirada');
  });

  it('no limpia el carrito ante errores distintos de SESSION_EXPIRED', () => {
    const state = cartReducer(staleState(), {
      type: 'cart/load/rejected',
      payload: { message: 'Error de red', code: 'TECHNICAL_DEPENDENCY_FAILURE' },
    });

    expect(state.loading).toBe(false);
    expect(state.data).not.toBeNull();
    expect(state.error).toBe('Error de red');
  });

  it('no limpia el carrito ante CART_RESERVATION_EXPIRED (distinto de SESSION_EXPIRED)', () => {
    const state = cartReducer(staleState(), {
      type: 'cart/load/rejected',
      payload: { message: 'Reserva expirada', code: 'CART_RESERVATION_EXPIRED' },
    });

    expect(state.data).not.toBeNull();
  });
});
