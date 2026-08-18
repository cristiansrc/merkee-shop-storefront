/**
 * Tests para ProductsPage.
 * Verifica paginación, búsqueda y filtrado por categoría.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { ProductsPage } from './ProductsPage';
import { catalogReducer } from '../store/catalogSlice';

// Mock del cliente API
vi.mock('../api/client', () => ({
  fetchProducts: vi.fn().mockResolvedValue({
    items: [
      {
        id: '1',
        name: 'Producto Test',
        description: 'Descripción test',
        regular_price_cop: 10000,
        sale_price_cop: 8000,
        unit: 'unidad',
        stock_available: 10,
        category: { id: '1', name: 'Test', image: { url: 'test.jpg', alt_text: 'Test', key: 'test', position: 0 }, version: 1 },
        images: [{ url: 'test.jpg', alt_text: 'Test', key: 'test', position: 0 }],
        version: 1,
      },
    ],
    page: { page: 1, size: 20, total: 1 },
  }),
}));

function createTestStore() {
  return configureStore({
    reducer: {
      catalog: catalogReducer,
    },
  });
}

describe('ProductsPage', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  it('muestra el título por defecto', () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/productos']}>
          <ProductsPage />
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByText('Todos los productos')).toBeInTheDocument();
  });

  it('muestra resultados de búsqueda', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/productos?q=manzana']}>
          <ProductsPage />
        </MemoryRouter>
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Resultados para "manzana"')).toBeInTheDocument();
    });
  });

  it('muestra productos', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/productos']}>
          <ProductsPage />
        </MemoryRouter>
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Producto Test')).toBeInTheDocument();
    });
  });

  it('muestra paginación cuando hay múltiples páginas', async () => {
    const { fetchProducts } = await import('../api/client');
    vi.mocked(fetchProducts).mockResolvedValueOnce({
      items: [
        {
          id: '1',
          name: 'Producto Test',
          description: 'Test',
          regular_price_cop: 10000,
          sale_price_cop: 8000,
          unit: 'unidad',
          stock_available: 10,
          category: { id: '1', name: 'Test', image: { url: 'test.jpg', alt_text: 'Test', key: 'test', position: 0 }, version: 1 },
          images: [{ url: 'test.jpg', alt_text: 'Test', key: 'test', position: 0 }],
          version: 1,
        },
      ],
      page: { page: 1, size: 20, total: 50 },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/productos']}>
          <ProductsPage />
        </MemoryRouter>
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText('50 productos encontrados')).toBeInTheDocument();
    });

    expect(screen.getByText('Página 1 de 3')).toBeInTheDocument();
    expect(screen.getByText('Siguiente →')).toBeInTheDocument();
  });
});
