/**
 * Slice de Redux para checkout.
 * Estado de vista derivado del servidor.
 * Checkout en 5 pasos visuales: carrito, autenticación, dirección, proveedor, confirmación/estado.
 * NO persiste datos sensibles en navegador.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { CheckoutResponse, DeliveryAddressRequest, PaymentProvider } from '../types/api';
import { createCheckout } from '../api/client';

// === Pasos del checkout ===
export type CheckoutStep = 'cart' | 'auth' | 'address' | 'provider' | 'confirmation';

// === Estado del slice ===
interface CheckoutState {
  currentStep: CheckoutStep;
  loading: boolean;
  error: string | null;
  result: CheckoutResponse | null;
  deliveryAddress: DeliveryAddressRequest | null;
  paymentProvider: PaymentProvider | null;
}

const initialState: CheckoutState = {
  currentStep: 'cart',
  loading: false,
  error: null,
  result: null,
  deliveryAddress: null,
  paymentProvider: null,
};

// === Async Thunks ===

export const submitCheckout = createAsyncThunk(
  'checkout/submit',
  async (
    request: { delivery_address: DeliveryAddressRequest; payment_provider: PaymentProvider },
    { rejectWithValue },
  ) => {
    try {
      return await createCheckout(request);
    } catch (err: unknown) {
      const error = err as { message?: string; code?: string };
      return rejectWithValue(error.message || 'Error al procesar checkout');
    }
  },
);

// === Slice ===
const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setCheckoutStep(state, action) {
      state.currentStep = action.payload as CheckoutStep;
      state.error = null;
    },
    setDeliveryAddress(state, action) {
      state.deliveryAddress = action.payload as DeliveryAddressRequest;
    },
    setPaymentProvider(state, action) {
      state.paymentProvider = action.payload as PaymentProvider;
    },
    resetCheckout(state) {
      state.currentStep = 'cart';
      state.loading = false;
      state.error = null;
      state.result = null;
      state.deliveryAddress = null;
      state.paymentProvider = null;
    },
    clearCheckoutError(state) {
      state.error = null;
    },
    nextStep(state) {
      const steps: CheckoutStep[] = ['cart', 'auth', 'address', 'provider', 'confirmation'];
      const currentIndex = steps.indexOf(state.currentStep);
      if (currentIndex < steps.length - 1) {
        state.currentStep = steps[currentIndex + 1];
        state.error = null;
      }
    },
    prevStep(state) {
      const steps: CheckoutStep[] = ['cart', 'auth', 'address', 'provider', 'confirmation'];
      const currentIndex = steps.indexOf(state.currentStep);
      if (currentIndex > 0) {
        state.currentStep = steps[currentIndex - 1];
        state.error = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitCheckout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitCheckout.fulfilled, (state, action) => {
        state.loading = false;
        state.result = action.payload;
        state.currentStep = 'confirmation';
      })
      .addCase(submitCheckout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Selectors
export const selectCheckoutStep = (state: { checkout: CheckoutState }): CheckoutStep =>
  state.checkout.currentStep;

export const selectCheckoutLoading = (state: { checkout: CheckoutState }): boolean =>
  state.checkout.loading;

export const selectCheckoutError = (state: { checkout: CheckoutState }): string | null =>
  state.checkout.error;

export const selectCheckoutResult = (state: { checkout: CheckoutState }): CheckoutResponse | null =>
  state.checkout.result;

export const selectDeliveryAddress = (state: { checkout: CheckoutState }): DeliveryAddressRequest | null =>
  state.checkout.deliveryAddress;

export const selectPaymentProvider = (state: { checkout: CheckoutState }): PaymentProvider | null =>
  state.checkout.paymentProvider;

export const {
  setCheckoutStep,
  setDeliveryAddress,
  setPaymentProvider,
  resetCheckout,
  clearCheckoutError,
  nextStep,
  prevStep,
} = checkoutSlice.actions;
export const checkoutReducer = checkoutSlice.reducer;
