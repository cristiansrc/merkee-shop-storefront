/**
 * Tests para ProductDetailPage.
 * Verifica detalle de producto, imágenes, precios y disponibilidad.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { ProductDetailPage } from './ProductDetailPage';
import { catalogReducer } from '../store/catalogSlice';

const mockProduct = {
  id: '1',
  name: 'Manzana Roja',
  description: 'Manzana fresca',
  regular_price_cop: 5900,
  sale_price_cop: 4900,
  unit: 'kg',
  stock_available: 45,
  category: { id: '1', name: 'Frutas', image: { url: 'test.jpg', alt_text: 'Test', key: 'test', position: 0 }, version: 1 },
  images: [
    { url: 'manzana1.jpg', alt_text: 'Manzana', key: 'manzana1', position: 0 },
    { url: 'manzana2.jpg', alt_text: 'Manzana vista', key: 'manzana2', position: 1 },
  ],
  version: 1,
};

// Mock del cliente API
vi.mock('../api/client', () => ({
  fetchProduct: vi.fn().mockImplementation(() => Promise.resolve(mockProduct)),
  fetchCategories: vi.fn().mockImplementation(() => Promise.resolve([])),
  fetchProducts: vi.fn().mockImplementation(() => Promise.resolve({ items: [], page: { page: 1, size: 20, total: 0 } })),
  fetchBanners: vi.fn().mockImplementation(() => Promise.resolve([])),
}));

function createTestStore() {
  return configureStore({
    reducer: {
      catalog: catalogReducer,
    },
  });
}

describe('ProductDetailPage', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    store = createTestStore();
  });

  it('muestra loading inicialmente', () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/productos/1']}>
          <Routes>
            <Route path="/productos/:productId" element={<ProductDetailPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByText('Cargando producto...')).toBeInTheDocument();
  });

  it('muestra detalle del producto', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/productos/1']}>
          <Routes>
            <Route path="/productos/:productId" element={<ProductDetailPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getAllByText('Manzana Roja').length).toBeGreaterThan(0);
    });

    expect(screen.getByText('Manzana fresca')).toBeInTheDocument();
  });

  it('muestra precios correctamente', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/productos/1']}>
          <Routes>
            <Route path="/productos/:productId" element={<ProductDetailPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getAllByText('$ 4.900').length).toBeGreaterThan(0);
    });

    expect(screen.getAllByText('$ 5.900').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/kg/).length).toBeGreaterThan(0);
  });

  it('muestra disponibilidad', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/productos/1']}>
          <Routes>
            <Route path="/productos/:productId" element={<ProductDetailPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Disponible/)).toBeInTheDocument();
    });
  });

  it('muestra galería de imágenes', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/productos/1']}>
          <Routes>
            <Route path="/productos/:productId" element={<ProductDetailPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getAllByAltText('Manzana').length).toBeGreaterThan(0);
    });

    expect(screen.getByAltText('Manzana vista')).toBeInTheDocument();
  });

  it('muestra breadcrumb', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/productos/1']}>
          <Routes>
            <Route path="/productos/:productId" element={<ProductDetailPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Inicio')).toBeInTheDocument();
    });

    expect(screen.getAllByText('Productos').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Frutas').length).toBeGreaterThan(0);
  });
});
