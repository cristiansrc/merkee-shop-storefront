/**
 * Slice de Redux para órdenes propias.
 * Estado de vista derivado del servidor.
 * Solo lectura, paginado.
 * NO persiste datos sensibles en navegador.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { OrderResponse } from '../types/api';
import { listMyOrders, getMyOrder } from '../api/client';

// === Estado del slice ===
interface OrdersState {
  items: OrderResponse[];
  page: { page: number; size: number; total: number } | null;
  loading: boolean;
  error: string | null;
  selectedOrder: OrderResponse | null;
  selectedOrderLoading: boolean;
}

const initialState: OrdersState = {
  items: [],
  page: null,
  loading: false,
  error: null,
  selectedOrder: null,
  selectedOrderLoading: false,
};

// === Async Thunks ===

export const fetchOrders = createAsyncThunk(
  'orders/fetchAll',
  async (params: { page?: number; size?: number } = {}, { rejectWithValue }) => {
    try {
      return await listMyOrders(params);
    } catch (err: unknown) {
      const error = err as { message?: string };
      return rejectWithValue(error.message || 'Error al cargar órdenes');
    }
  },
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchById',
  async (orderId: string, { rejectWithValue }) => {
    try {
      return await getMyOrder(orderId);
    } catch (err: unknown) {
      const error = err as { message?: string };
      return rejectWithValue(error.message || 'Error al cargar orden');
    }
  },
);

// === Slice ===
const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrdersError(state) {
      state.error = null;
    },
    clearSelectedOrder(state) {
      state.selectedOrder = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Orders
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.page = action.payload.page;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Order By Id
    builder
      .addCase(fetchOrderById.pending, (state) => {
        state.selectedOrderLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.selectedOrderLoading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.selectedOrderLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Selectors
export const selectOrders = (state: { orders: OrdersState }): OrderResponse[] =>
  state.orders.items;

export const selectOrdersPage = (state: { orders: OrdersState }) =>
  state.orders.page;

export const selectOrdersLoading = (state: { orders: OrdersState }): boolean =>
  state.orders.loading;

export const selectOrdersError = (state: { orders: OrdersState }): string | null =>
  state.orders.error;

export const selectSelectedOrder = (state: { orders: OrdersState }): OrderResponse | null =>
  state.orders.selectedOrder;

export const { clearOrdersError, clearSelectedOrder } = ordersSlice.actions;
export const ordersReducer = ordersSlice.reducer;
