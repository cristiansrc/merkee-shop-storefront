/**
 * Tests para catalogSlice.
 * Verifica estado inicial, reducers y thunks.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import {
  catalogReducer,
  setActiveCategoryId,
  setSearchQuery,
  clearSelectedProduct,
  loadCategories,
  loadProducts,
  loadProduct,
  loadBanners,
} from './catalogSlice';

// Mock del cliente API
vi.mock('../api/client', () => ({
  fetchCategories: vi.fn(),
  fetchProducts: vi.fn(),
  fetchProduct: vi.fn(),
  fetchBanners: vi.fn(),
}));

function createTestStore() {
  return configureStore({
    reducer: {
      catalog: catalogReducer,
    },
  });
}

describe('catalogSlice', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  it('tiene estado inicial correcto', () => {
    const state = store.getState().catalog;
    expect(state.categories).toEqual([]);
    expect(state.products).toEqual([]);
    expect(state.selectedProduct).toBeNull();
    expect(state.banners).toEqual([]);
    expect(state.activeCategoryId).toBeUndefined();
    expect(state.searchQuery).toBe('');
  });

  it('setActiveCategoryId actualiza el estado', () => {
    store.dispatch(setActiveCategoryId('123'));
    expect(store.getState().catalog.activeCategoryId).toBe('123');
  });

  it('setSearchQuery actualiza el estado', () => {
    store.dispatch(setSearchQuery('manzana'));
    expect(store.getState().catalog.searchQuery).toBe('manzana');
  });

  it('clearSelectedProduct limpia el producto seleccionado', () => {
    store.dispatch(clearSelectedProduct());
    expect(store.getState().catalog.selectedProduct).toBeNull();
  });

  it('loadCategories fulfilled carga categorías', async () => {
    const { fetchCategories } = await import('../api/client');
    vi.mocked(fetchCategories).mockResolvedValueOnce([
      {
        id: '1',
        name: 'Frutas',
        image: { url: 'test.jpg', alt_text: 'Test', key: 'test', position: 0 },
        version: 1,
      },
    ]);

    await store.dispatch(loadCategories());
    expect(store.getState().catalog.categories).toHaveLength(1);
    expect(store.getState().catalog.categories[0].name).toBe('Frutas');
  });

  it('loadProducts fulfilled carga productos', async () => {
    const { fetchProducts } = await import('../api/client');
    vi.mocked(fetchProducts).mockResolvedValueOnce({
      items: [
        {
          id: '1',
          name: 'Manzana',
          description: 'Test',
          regular_price_cop: 1000,
          sale_price_cop: 800,
          unit: 'kg',
          stock_available: 10,
          category: { id: '1', name: 'Frutas', image: { url: 'test.jpg', alt_text: 'Test', key: 'test', position: 0 }, version: 1 },
          images: [],
          version: 1,
        },
      ],
      page: { page: 1, size: 20, total: 1 },
    });

    await store.dispatch(loadProducts({ page: 1, size: 20 }));
    expect(store.getState().catalog.products).toHaveLength(1);
    expect(store.getState().catalog.productsPage).toEqual({ page: 1, size: 20, total: 1 });
  });

  it('loadProduct fulfilled carga producto individual', async () => {
    const { fetchProduct } = await import('../api/client');
    vi.mocked(fetchProduct).mockResolvedValueOnce({
      id: '1',
      name: 'Manzana',
      description: 'Test',
      regular_price_cop: 1000,
      sale_price_cop: 800,
      unit: 'kg',
      stock_available: 10,
      category: { id: '1', name: 'Frutas', image: { url: 'test.jpg', alt_text: 'Test', key: 'test', position: 0 }, version: 1 },
      images: [],
      version: 1,
    });

    await store.dispatch(loadProduct('1'));
    expect(store.getState().catalog.selectedProduct?.name).toBe('Manzana');
  });

  it('loadBanners fulfilled carga banners', async () => {
    const { fetchBanners } = await import('../api/client');
    vi.mocked(fetchBanners).mockResolvedValueOnce([
      {
        id: '1',
        name: 'Banner Test',
        image: { url: 'test.jpg', alt_text: 'Test', key: 'test', position: 0 },
        target_path: '/productos',
        display_order: 0,
        active: true,
        version: 1,
      },
    ]);

    await store.dispatch(loadBanners());
    expect(store.getState().catalog.banners).toHaveLength(1);
    expect(store.getState().catalog.banners[0].name).toBe('Banner Test');
  });
});
