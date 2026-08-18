/**
 * Configuración del store Redux Toolkit.
 * Estado global del storefront merkee.shop.
 */

import { configureStore } from '@reduxjs/toolkit';
import { catalogReducer } from './catalogSlice';
import { cartReducer } from './cartSlice';
import { authReducer } from './authSlice';
import { profileReducer } from './profileSlice';
import { checkoutReducer } from './checkoutSlice';
import { ordersReducer } from './ordersSlice';

export const store = configureStore({
  reducer: {
    catalog: catalogReducer,
    cart: cartReducer,
    auth: authReducer,
    profile: profileReducer,
    checkout: checkoutReducer,
    orders: ordersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
