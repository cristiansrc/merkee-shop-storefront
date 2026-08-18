/**
 * Mock data derivado directamente del contrato OpenAPI.
 * Solo se usa cuando la API no está disponible.
 * NO inventa campos: todos los valores coinciden con los schemas de openapi.yaml.
 */

import type {
  CategoryResponse,
  ProductResponse,
  BannerResponse,
  CartResponse,
  PagedProductResponse,
} from '../types/api';

// === Categorías mock ===
export const mockCategories: CategoryResponse[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Frutas y Verduras',
    image: {
      key: 'categories/frutas-verduras.jpg',
      url: 'https://images.merkee.shop/categories/frutas-verduras.jpg',
      alt_text: 'Frutas y verduras frescas',
      position: 0,
    },
    version: 1,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Lácteos y Huevos',
    image: {
      key: 'categories/lacteos.jpg',
      url: 'https://images.merkee.shop/categories/lacteos.jpg',
      alt_text: 'Lácteos y huevos frescos',
      position: 0,
    },
    version: 1,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Carnes y Aves',
    image: {
      key: 'categories/carnes.jpg',
      url: 'https://images.merkee.shop/categories/carnes.jpg',
      alt_text: 'Carnes y aves frescas',
      position: 0,
    },
    version: 1,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'Panadería',
    image: {
      key: 'categories/panaderia.jpg',
      url: 'https://images.merkee.shop/categories/panaderia.jpg',
      alt_text: 'Panadería artesanal',
      position: 0,
    },
    version: 1,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    name: 'Bebidas',
    image: {
      key: 'categories/bebidas.jpg',
      url: 'https://images.merkee.shop/categories/bebidas.jpg',
      alt_text: 'Bebidas y jugos',
      position: 0,
    },
    version: 1,
  },
];

// === Productos mock ===
const mockProductBase: Omit<ProductResponse, 'id' | 'category'> = {
  name: '',
  description: '',
  regular_price_cop: 0,
  sale_price_cop: 0,
  unit: 'unidad',
  stock_available: 10,
  images: [],
  version: 1,
};

export const mockProducts: ProductResponse[] = [
  {
    ...mockProductBase,
    id: '660e8400-e29b-41d4-a716-446655440001',
    category: mockCategories[0],
    name: 'Manzana Roja',
    description: 'Manzana roja fresca de alta calidad, crujiente y dulce. Ideal para consumo directo o preparación de jugos y ensaladas.',
    regular_price_cop: 5900,
    sale_price_cop: 4900,
    unit: 'kg',
    stock_available: 45,
    images: [
      {
        key: 'products/manzana-roja-1.jpg',
        url: 'https://images.merkee.shop/products/manzana-roja-1.jpg',
        alt_text: 'Manzana roja fresca',
        position: 0,
      },
    ],
  },
  {
    ...mockProductBase,
    id: '660e8400-e29b-41d4-a716-446655440002',
    category: mockCategories[0],
    name: 'Plátano Hartón',
    description: 'Plátano hartón maduro, perfecto para preparar tajadas, patacones o como acompañamiento.',
    regular_price_cop: 3200,
    sale_price_cop: 3200,
    unit: 'kg',
    stock_available: 60,
    images: [
      {
        key: 'products/platano-harton-1.jpg',
        url: 'https://images.merkee.shop/products/platano-harton-1.jpg',
        alt_text: 'Plátano hartón maduro',
        position: 0,
      },
    ],
  },
  {
    ...mockProductBase,
    id: '660e8400-e29b-41d4-a716-446655440003',
    category: mockCategories[0],
    name: 'Tomate Chonto',
    description: 'Tomate chonto fresco, ideal para salsas, ensaladas y cocina colombiana.',
    regular_price_cop: 4500,
    sale_price_cop: 3800,
    unit: 'kg',
    stock_available: 35,
    images: [
      {
        key: 'products/tomate-chonto-1.jpg',
        url: 'https://images.merkee.shop/products/tomate-chonto-1.jpg',
        alt_text: 'Tomate chonto fresco',
        position: 0,
      },
    ],
  },
  {
    ...mockProductBase,
    id: '660e8400-e29b-41d4-a716-446655440004',
    category: mockCategories[1],
    name: 'Leche Entera Alpura',
    description: 'Leche entera pasteurizada de alta calidad. Rica en calcio y proteínas.',
    regular_price_cop: 3800,
    sale_price_cop: 3800,
    unit: 'unidad',
    stock_available: 80,
    images: [
      {
        key: 'products/leche-alpura-1.jpg',
        url: 'https://images.merkee.shop/products/leche-alpura-1.jpg',
        alt_text: 'Leche entera Alpura',
        position: 0,
      },
    ],
  },
  {
    ...mockProductBase,
    id: '660e8400-e29b-41d4-a716-446655440005',
    category: mockCategories[1],
    name: 'Huevos AA Docena',
    description: 'Huevos frescos clase AA, empacados en docena. Ideales para el desayuno y repostería.',
    regular_price_cop: 12500,
    sale_price_cop: 11000,
    unit: 'docena',
    stock_available: 50,
    images: [
      {
        key: 'products/huevos-aa-1.jpg',
        url: 'https://images.merkee.shop/products/huevos-aa-1.jpg',
        alt_text: 'Huevos AA docena',
        position: 0,
      },
    ],
  },
  {
    ...mockProductBase,
    id: '660e8400-e29b-41d4-a716-446655440006',
    category: mockCategories[2],
    name: 'Pechuga de Pollo',
    description: 'Pechuga de pollo fresca sin hueso ni piel. Perfecta para plancha, horno o salteados.',
    regular_price_cop: 18500,
    sale_price_cop: 16900,
    unit: 'kg',
    stock_available: 25,
    images: [
      {
        key: 'products/pechuga-pollo-1.jpg',
        url: 'https://images.merkee.shop/products/pechuga-pollo-1.jpg',
        alt_text: 'Pechuga de pollo fresca',
        position: 0,
      },
    ],
  },
  {
    ...mockProductBase,
    id: '660e8400-e29b-41d4-a716-446655440007',
    category: mockCategories[2],
    name: 'Carne Molida Res',
    description: 'Carne molida de res, ideal para preparar albóndigas, pastel de carne o ragú.',
    regular_price_cop: 28000,
    sale_price_cop: 25900,
    unit: 'kg',
    stock_available: 20,
    images: [
      {
        key: 'products/carne-molida-1.jpg',
        url: 'https://images.merkee.shop/products/carne-molida-1.jpg',
        alt_text: 'Carne molida de res',
        position: 0,
      },
    ],
  },
  {
    ...mockProductBase,
    id: '660e8400-e29b-41d4-a716-446655440008',
    category: mockCategories[3],
    name: 'Pan Francés',
    description: 'Pan francés recién horneado, crujiente por fuera y suave por dentro.',
    regular_price_cop: 1200,
    sale_price_cop: 1200,
    unit: 'unidad',
    stock_available: 100,
    images: [
      {
        key: 'products/pan-frances-1.jpg',
        url: 'https://images.merkee.shop/products/pan-frances-1.jpg',
        alt_text: 'Pan francés',
        position: 0,
      },
    ],
  },
  {
    ...mockProductBase,
    id: '660e8400-e29b-41d4-a716-446655440009',
    category: mockCategories[4],
    name: 'Agua Cristalina 600ml',
    description: 'Agua purificada embotellada, ideal para hidratación diaria.',
    regular_price_cop: 2500,
    sale_price_cop: 2500,
    unit: 'unidad',
    stock_available: 120,
    images: [
      {
        key: 'products/agua-cristalina-1.jpg',
        url: 'https://images.merkee.shop/products/agua-cristalina-1.jpg',
        alt_text: 'Agua Cristalina 600ml',
        position: 0,
      },
    ],
  },
  {
    ...mockProductBase,
    id: '660e8400-e29b-41d4-a716-446655440010',
    category: mockCategories[4],
    name: 'Jugo Colombiano Mango',
    description: 'Jugo de mango natural sin azúcar adicionada, sabor tropical auténtico.',
    regular_price_cop: 4200,
    sale_price_cop: 3900,
    unit: 'unidad',
    stock_available: 70,
    images: [
      {
        key: 'products/jugo-mango-1.jpg',
        url: 'https://images.merkee.shop/products/jugo-mango-1.jpg',
        alt_text: 'Jugo Colombiano Mango',
        position: 0,
      },
    ],
  },
];

// === Banners mock ===
export const mockBanners: BannerResponse[] = [
  {
    id: '770e8400-e29b-41d4-a716-446655440001',
    name: 'Bienvenido a merkee.shop',
    image: {
      key: 'banners/welcome-banner.jpg',
      url: 'https://images.merkee.shop/banners/welcome-banner.jpg',
      alt_text: 'Bienvenido a merkee.shop - Tu supermercado digital',
      position: 0,
    },
    target_path: '/productos',
    display_order: 0,
    active: true,
    version: 1,
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440002',
    name: 'Ofertas de la semana',
    image: {
      key: 'banners/ofertas-semana.jpg',
      url: 'https://images.merkee.shop/banners/ofertas-semana.jpg',
      alt_text: 'Ofertas especiales de la semana',
      position: 0,
    },
    target_path: '/productos',
    display_order: 1,
    active: true,
    version: 1,
  },
];

// === Carrito mock ===
export const mockEmptyCart: CartResponse = {
  id: '880e8400-e29b-41d4-a716-446655440001',
  status: 'ACTIVE',
  items: [],
  items_subtotal_cop: 0,
  delivery_fee_cop: 5000,
  iva_cop: 0,
  tax_rate_basis_points: 1900,
  total_cop: 5000,
  reservation_expires_at: null,
};

// === Helper: generar respuesta paginada de productos ===
export function getMockPagedProducts(
  page: number = 1,
  size: number = 20,
  categoryId?: string,
  query?: string,
): PagedProductResponse {
  let filtered = [...mockProducts];

  if (categoryId) {
    filtered = filtered.filter((p) => p.category.id === categoryId);
  }

  if (query) {
    const lowerQuery = query.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery),
    );
  }

  const total = filtered.length;
  const start = (page - 1) * size;
  const items = filtered.slice(start, start + size);

  return {
    items,
    page: { page, size, total },
  };
}

// === Helper: generar carrito con items mock ===
export function getMockCartWithItems(): CartResponse {
  const items = [
    {
      product: mockProducts[0], // Manzana Roja
      quantity: 2,
      reservation_status: 'ACTIVE' as const,
      reservation_expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    },
    {
      product: mockProducts[3], // Leche
      quantity: 3,
      reservation_status: 'ACTIVE' as const,
      reservation_expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    },
  ];

  const itemsSubtotal = items.reduce(
    (sum, item) => sum + item.product.sale_price_cop * item.quantity,
    0,
  );
  const iva = Math.floor((itemsSubtotal * 19 + 50) / 100);
  const deliveryFee = 5000;

  return {
    id: '880e8400-e29b-41d4-a716-446655440002',
    status: 'ACTIVE',
    items,
    items_subtotal_cop: itemsSubtotal,
    delivery_fee_cop: deliveryFee,
    iva_cop: iva,
    tax_rate_basis_points: 1900,
    total_cop: itemsSubtotal + deliveryFee + iva,
    reservation_expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  };
}
