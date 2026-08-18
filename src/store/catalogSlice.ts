/**
 * Slice de Redux para catálogo: categorías, productos y banners.
 * Estado derivado del servidor, sin persistencia en navegador.
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type {
  CategoryResponse,
  ProductResponse,
  BannerResponse,
  PageMeta,
} from '../types/api';
import {
  fetchCategories,
  fetchProducts,
  fetchProduct,
  fetchBanners,
} from '../api/client';

// === Estado del slice ===
interface CatalogState {
  // Categorías
  categories: CategoryResponse[];
  categoriesLoading: boolean;
  categoriesError: string | null;

  // Productos (lista paginada)
  products: ProductResponse[];
  productsPage: PageMeta | null;
  productsLoading: boolean;
  productsError: string | null;

  // Producto individual (detalle)
  selectedProduct: ProductResponse | null;
  selectedProductLoading: boolean;
  selectedProductError: string | null;

  // Banners
  banners: BannerResponse[];
  bannersLoading: boolean;
  bannersError: string | null;

  // Filtros activos
  activeCategoryId: string | undefined;
  searchQuery: string;
}

const initialState: CatalogState = {
  categories: [],
  categoriesLoading: false,
  categoriesError: null,

  products: [],
  productsPage: null,
  productsLoading: false,
  productsError: null,

  selectedProduct: null,
  selectedProductLoading: false,
  selectedProductError: null,

  banners: [],
  bannersLoading: false,
  bannersError: null,

  activeCategoryId: undefined,
  searchQuery: '',
};

// === Async Thunks ===

export const loadCategories = createAsyncThunk(
  'catalog/loadCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchCategories();
    } catch (err: unknown) {
      const error = err as { message?: string };
      return rejectWithValue(error.message || 'Error al cargar categorías');
    }
  },
);

export const loadProducts = createAsyncThunk(
  'catalog/loadProducts',
  async (
    params: { page?: number; size?: number; category_id?: string; q?: string },
    { rejectWithValue },
  ) => {
    try {
      return await fetchProducts(params);
    } catch (err: unknown) {
      const error = err as { message?: string };
      return rejectWithValue(error.message || 'Error al cargar productos');
    }
  },
);

export const loadProduct = createAsyncThunk(
  'catalog/loadProduct',
  async (productId: string, { rejectWithValue }) => {
    try {
      return await fetchProduct(productId);
    } catch (err: unknown) {
      const error = err as { message?: string };
      return rejectWithValue(error.message || 'Error al cargar producto');
    }
  },
);

export const loadBanners = createAsyncThunk(
  'catalog/loadBanners',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchBanners();
    } catch (err: unknown) {
      const error = err as { message?: string };
      return rejectWithValue(error.message || 'Error al cargar banners');
    }
  },
);

// === Slice ===
const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    setActiveCategoryId(state, action: PayloadAction<string | undefined>) {
      state.activeCategoryId = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    clearSelectedProduct(state) {
      state.selectedProduct = null;
      state.selectedProductError = null;
    },
  },
  extraReducers: (builder) => {
    // Categorías
    builder
      .addCase(loadCategories.pending, (state) => {
        state.categoriesLoading = true;
        state.categoriesError = null;
      })
      .addCase(loadCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categories = action.payload;
      })
      .addCase(loadCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.categoriesError = action.payload as string;
      });

    // Productos (lista)
    builder
      .addCase(loadProducts.pending, (state) => {
        state.productsLoading = true;
        state.productsError = null;
      })
      .addCase(loadProducts.fulfilled, (state, action) => {
        state.productsLoading = false;
        state.products = action.payload.items;
        state.productsPage = action.payload.page;
      })
      .addCase(loadProducts.rejected, (state, action) => {
        state.productsLoading = false;
        state.productsError = action.payload as string;
      });

    // Producto individual
    builder
      .addCase(loadProduct.pending, (state) => {
        state.selectedProductLoading = true;
        state.selectedProductError = null;
      })
      .addCase(loadProduct.fulfilled, (state, action) => {
        state.selectedProductLoading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(loadProduct.rejected, (state, action) => {
        state.selectedProductLoading = false;
        state.selectedProductError = action.payload as string;
      });

    // Banners
    builder
      .addCase(loadBanners.pending, (state) => {
        state.bannersLoading = true;
        state.bannersError = null;
      })
      .addCase(loadBanners.fulfilled, (state, action) => {
        state.bannersLoading = false;
        state.banners = action.payload;
      })
      .addCase(loadBanners.rejected, (state, action) => {
        state.bannersLoading = false;
        state.bannersError = action.payload as string;
      });
  },
});

export const { setActiveCategoryId, setSearchQuery, clearSelectedProduct } =
  catalogSlice.actions;
export const catalogReducer = catalogSlice.reducer;
