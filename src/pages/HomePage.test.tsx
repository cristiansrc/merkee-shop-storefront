/**
 * Tests para HomePage.
 * Verifica carga de banners, categorías y productos destacados.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { HomePage } from './HomePage';
import { catalogReducer } from '../store/catalogSlice';

// Mock del cliente API
vi.mock('../api/client', () => ({
  fetchBanners: vi.fn().mockResolvedValue([
    {
      id: '1',
      name: 'Banner Test',
      image: { url: 'test.jpg', alt_text: 'Test', key: 'test', position: 0 },
      target_path: '/productos',
      display_order: 0,
      active: true,
      version: 1,
    },
  ]),
  fetchCategories: vi.fn().mockResolvedValue([
    {
      id: '1',
      name: 'Categoría Test',
      image: { url: 'test.jpg', alt_text: 'Test', key: 'test', position: 0 },
      version: 1,
    },
  ]),
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
    page: { page: 1, size: 6, total: 1 },
  }),
}));

function createTestStore() {
  return configureStore({
    reducer: {
      catalog: catalogReducer,
    },
  });
}

describe('HomePage', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  it('renderiza el título de la página', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </Provider>,
    );

    expect(screen.getByText('Explora nuestras categorías')).toBeInTheDocument();
  });

  it('muestra loading inicialmente', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </Provider>,
    );

    expect(screen.getByText('Cargando promociones...')).toBeInTheDocument();
  });

  it('carga y muestra categorías', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Categoría Test')).toBeInTheDocument();
    });
  });

  it('carga y muestra productos destacados', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Producto Test')).toBeInTheDocument();
    });
  });
});
