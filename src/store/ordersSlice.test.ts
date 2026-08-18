/**
 * Tests para ordersSlice.
 * Verifica estado inicial y reducers.
 */

import { describe, it, expect } from 'vitest';
import { ordersReducer, clearOrdersError, clearSelectedOrder } from './ordersSlice';

describe('ordersSlice', () => {
  const initialState = {
    items: [],
    page: null,
    loading: false,
    error: null,
    selectedOrder: null,
    selectedOrderLoading: false,
  };

  it('debería tener estado inicial correcto', () => {
    const state = ordersReducer(undefined, { type: 'unknown' });
    expect(state).toEqual(initialState);
  });

  it('debería limpiar error', () => {
    const stateWithError = {
      ...initialState,
      error: 'Error de prueba',
    };
    const state = ordersReducer(stateWithError, clearOrdersError());
    expect(state.error).toBeNull();
  });

  it('debería limpiar orden seleccionada', () => {
    const stateWithOrder = {
      ...initialState,
      selectedOrder: {
        id: '123',
        order_number: 'ORD-001',
        status: 'PAID' as const,
        items_subtotal_cop: 10000,
        delivery_fee_cop: 5000,
        iva_cop: 1900,
        tax_rate_basis_points: 1900,
        total_cop: 16900,
        items: [],
        delivery_recipient_name: 'Test User',
        delivery_line1: 'Calle 123',
        delivery_city: 'Bogotá',
        delivery_phone: '1234567890',
        payment: {
          id: 'pay-123',
          provider: 'WOMPI' as const,
          status: 'APPROVED' as const,
          amount_cop: 16900,
          provider_reference: null,
        },
        refund: null,
        created_at: new Date().toISOString(),
      },
    };
    const state = ordersReducer(stateWithOrder, clearSelectedOrder());
    expect(state.selectedOrder).toBeNull();
  });
});
