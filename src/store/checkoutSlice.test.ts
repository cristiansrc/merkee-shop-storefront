/**
 * Tests para checkoutSlice.
 * Verifica estado inicial, reducers y pasos del checkout.
 */

import { describe, it, expect } from 'vitest';
import { checkoutReducer, setCheckoutStep, setDeliveryAddress, setPaymentProvider, resetCheckout, clearCheckoutError, nextStep, prevStep } from './checkoutSlice';

describe('checkoutSlice', () => {
  const initialState = {
    currentStep: 'cart' as const,
    loading: false,
    error: null,
    result: null,
    deliveryAddress: null,
    paymentProvider: null,
  };

  it('debería tener estado inicial correcto', () => {
    const state = checkoutReducer(undefined, { type: 'unknown' });
    expect(state).toEqual(initialState);
  });

  it('debería establecer paso de checkout', () => {
    const state = checkoutReducer(initialState, setCheckoutStep('address'));
    expect(state.currentStep).toBe('address');
  });

  it('debería establecer dirección de entrega', () => {
    const address = {
      recipient_name: 'Test User',
      line1: 'Calle 123',
      city: 'Bogotá',
      phone: '1234567890',
    };
    const state = checkoutReducer(initialState, setDeliveryAddress(address));
    expect(state.deliveryAddress).toEqual(address);
  });

  it('debería establecer proveedor de pago', () => {
    const state = checkoutReducer(initialState, setPaymentProvider('WOMPI'));
    expect(state.paymentProvider).toBe('WOMPI');
  });

  it('debería resetear checkout', () => {
    const stateWithDetails = {
      ...initialState,
      currentStep: 'confirmation' as const,
      deliveryAddress: { recipient_name: 'Test', line1: 'Calle 123', city: 'Bogotá', phone: '123' },
      paymentProvider: 'WOMPI' as const,
    };
    const state = checkoutReducer(stateWithDetails, resetCheckout());
    expect(state).toEqual(initialState);
  });

  it('debería limpiar error', () => {
    const stateWithError = {
      ...initialState,
      error: 'Error de prueba',
    };
    const state = checkoutReducer(stateWithError, clearCheckoutError());
    expect(state.error).toBeNull();
  });

  it('debería avanzar al siguiente paso', () => {
    const state = checkoutReducer(initialState, nextStep());
    expect(state.currentStep).toBe('auth');
  });

  it('debería retroceder al paso anterior', () => {
    const stateAddress = checkoutReducer(initialState, setCheckoutStep('address'));
    const state = checkoutReducer(stateAddress, prevStep());
    expect(state.currentStep).toBe('auth');
  });

  it('no debería avanzar más allá de confirmation', () => {
    const stateConfirmation = checkoutReducer(initialState, setCheckoutStep('confirmation'));
    const state = checkoutReducer(stateConfirmation, nextStep());
    expect(state.currentStep).toBe('confirmation');
  });

  it('no debería retroceder más allá de cart', () => {
    const state = checkoutReducer(initialState, prevStep());
    expect(state.currentStep).toBe('cart');
  });
});
