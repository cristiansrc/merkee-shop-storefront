/**
 * Slice de Redux para carrito.
 * Vista derivada del servidor, sin persistencia en navegador.
 * El carrito real vive en el servidor (cookie HttpOnly o sesión autenticada).
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { CartResponse, CartItemResponse } from '../types/api';
import {
  fetchCart,
  addCartItem,
  setCartItemQuantity,
  removeCartItem,
} from '../api/client';

// === Estado del slice ===
interface CartState {
  data: CartResponse | null;
  loading: boolean;
  error: string | null;

  // UI state
  isOpen: boolean;
  lastAction: {
    type: 'add' | 'update' | 'remove';
    productId: string;
    timestamp: number;
  } | null;
}

const initialState: CartState = {
  data: null,
  loading: false,
  error: null,
  isOpen: false,
  lastAction: null,
};

// === Async Thunks ===

export const loadCart = createAsyncThunk(
  'cart/load',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchCart();
    } catch (err: unknown) {
      const error = err as { message?: string };
      return rejectWithValue(error.message || 'Error al cargar carrito');
    }
  },
);

export const addToCart = createAsyncThunk(
  'cart/addItem',
  async (
    params: { productId: string; quantity: number },
    { rejectWithValue },
  ) => {
    try {
      return await addCartItem({
        product_id: params.productId,
        quantity: params.quantity,
      });
    } catch (err: unknown) {
      const error = err as { message?: string };
      return rejectWithValue(error.message || 'Error al agregar al carrito');
    }
  },
);

export const updateCartItem = createAsyncThunk(
  'cart/updateItem',
  async (
    params: { productId: string; quantity: number },
    { rejectWithValue },
  ) => {
    try {
      return await setCartItemQuantity(params.productId, {
        quantity: params.quantity,
      });
    } catch (err: unknown) {
      const error = err as { message?: string };
      return rejectWithValue(error.message || 'Error al actualizar carrito');
    }
  },
);

export const removeFromCart = createAsyncThunk(
  'cart/removeItem',
  async (productId: string, { rejectWithValue }) => {
    try {
      await removeCartItem(productId);
      return productId;
    } catch (err: unknown) {
      const error = err as { message?: string };
      return rejectWithValue(error.message || 'Error al eliminar del carrito');
    }
  },
);

// === Slice ===
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    toggleCart(state) {
      state.isOpen = !state.isOpen;
    },
    openCart(state) {
      state.isOpen = true;
    },
    closeCart(state) {
      state.isOpen = false;
    },
    clearCartError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Cargar carrito
    builder
      .addCase(loadCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadCart.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(loadCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Agregar item
    builder
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.lastAction = {
          type: 'add',
          productId: action.meta.arg.productId,
          timestamp: Date.now(),
        };
        state.isOpen = true; // Abrir carrito al agregar
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Actualizar cantidad
    builder
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.lastAction = {
          type: 'update',
          productId: action.meta.arg.productId,
          timestamp: Date.now(),
        };
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Eliminar item
    builder
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        if (state.data) {
          state.data.items = state.data.items.filter(
            (item) => item.product.id !== action.payload,
          );
          // Recalcular totales
          state.data.items_subtotal_cop = state.data.items.reduce(
            (sum, item) => sum + item.product.sale_price_cop * item.quantity,
            0,
          );
          state.data.iva_cop = Math.floor(
            (state.data.items_subtotal_cop * 19 + 50) / 100,
          );
          state.data.total_cop =
            state.data.items_subtotal_cop +
            state.data.delivery_fee_cop +
            state.data.iva_cop;
        }
        state.lastAction = {
          type: 'remove',
          productId: action.payload,
          timestamp: Date.now(),
        };
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Selectors
export const selectCartItems = (state: { cart: CartState }): CartItemResponse[] =>
  state.cart.data?.items ?? [];

export const selectCartTotal = (state: { cart: CartState }): number =>
  state.cart.data?.total_cop ?? 0;

export const selectCartItemCount = (state: { cart: CartState }): number =>
  state.cart.data?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

export const { toggleCart, openCart, closeCart, clearCartError } = cartSlice.actions;
export const cartReducer = cartSlice.reducer;
