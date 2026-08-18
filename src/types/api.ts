/**
 * Tipos derivados del contrato OpenAPI canónico de merkee.shop.
 * NO modificar - fuente de verdad: docs/api/openapi.yaml
 */

// === Enums ===
export type Role = 'admin' | 'cliente';
export type PaymentProvider = 'WOMPI' | 'MERCADO_PAGO';
export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_EXPIRED'
  | 'RESERVATION_EXPIRED'
  | 'PAYMENT_REFUND_PENDING'
  | 'PAYMENT_REFUNDED'
  | 'PAYMENT_REFUND_FAILED';
export type PaymentStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'DECLINED'
  | 'ERROR'
  | 'EXPIRED'
  | 'REFUNDED'
  | 'REFUND_FAILED';
export type RefundStatus = 'PENDING' | 'REFUNDED' | 'REFUND_FAILED';
export type CartStatus = 'ACTIVE' | 'CHECKOUT_PENDING' | 'CLOSED' | 'EXPIRED';
export type ReservationStatus =
  | 'ACTIVE'
  | 'CHECKOUT_PENDING'
  | 'CONSUMED'
  | 'RELEASED'
  | 'EXPIRED';

// === Image ===
export interface ImageResponse {
  key: string;
  url: string;
  alt_text: string;
  position: number;
}

// === Category ===
export interface CategoryResponse {
  id: string;
  name: string;
  image: ImageResponse;
  version: number;
}

// === Product ===
export interface ProductResponse {
  id: string;
  category: CategoryResponse;
  name: string;
  description: string;
  regular_price_cop: number;
  sale_price_cop: number;
  unit: string;
  stock_available: number;
  images: ImageResponse[];
  version: number;
}

// === Banner ===
export interface BannerResponse {
  id: string;
  name: string;
  image: ImageResponse;
  target_path: string | null;
  display_order: number;
  active: boolean;
  version: number;
}

// === Cart ===
export interface CartItemResponse {
  product: ProductResponse;
  quantity: number;
  reservation_status: ReservationStatus;
  reservation_expires_at: string | null;
}

export interface CartResponse {
  id: string;
  status: CartStatus;
  items: CartItemResponse[];
  items_subtotal_cop: number;
  delivery_fee_cop: number;
  iva_cop: number;
  tax_rate_basis_points: number;
  total_cop: number;
  reservation_expires_at: string | null;
}

// === Pagination ===
export interface PageMeta {
  page: number;
  size: number;
  total: number;
}

export interface PagedProductResponse {
  items: ProductResponse[];
  page: PageMeta;
}

// === Error ===
export interface ApiErrorDetail {
  field: string;
  reason: string;
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  code: string;
  message: string;
  path: string;
  trace_id: string;
  details: ApiErrorDetail[];
}

// === Auth ===
export interface UserResponse {
  id: string;
  display_name: string;
  email: string;
  role: Role;
  must_change_password: boolean;
  phone: string | null;
}

export interface SessionResponse {
  access_token: string;
  expires_at: string;
  user: UserResponse;
}

export interface RegisterRequest {
  display_name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  new_password: string;
}

export interface UpdateProfileRequest {
  display_name?: string;
  phone?: string | null;
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
}

// === Checkout ===
export interface DeliveryAddressRequest {
  recipient_name: string;
  line1: string;
  city: string;
  phone: string;
}

export interface CreateCheckoutRequest {
  delivery_address: DeliveryAddressRequest;
  payment_provider: PaymentProvider;
}

export interface PaymentResponse {
  id: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  amount_cop: number;
  provider_reference: string | null;
}

export interface PaymentRefundResponse {
  id: string;
  status: RefundStatus;
  amount_cop: number;
  provider_refund_reference: string | null;
}

export interface OrderItemResponse {
  product_id: string | null;
  product_name: string;
  unit: string;
  unit_price_cop: number;
  quantity: number;
  subtotal_cop: number;
}

export interface OrderResponse {
  id: string;
  order_number: string;
  status: OrderStatus;
  items_subtotal_cop: number;
  delivery_fee_cop: number;
  iva_cop: number;
  tax_rate_basis_points: number;
  total_cop: number;
  items: OrderItemResponse[];
  delivery_recipient_name: string;
  delivery_line1: string;
  delivery_city: string;
  delivery_phone: string;
  payment: PaymentResponse;
  refund: PaymentRefundResponse | null;
  created_at: string;
}

export interface CheckoutResponse {
  order: OrderResponse;
  payment: PaymentResponse;
  provider_checkout_url: string;
}

export interface PagedOrderResponse {
  items: OrderResponse[];
  page: PageMeta;
}

// === Request types ===
export interface CartItemMutationRequest {
  product_id: string;
  quantity: number;
}

export interface SetCartItemQuantityRequest {
  quantity: number;
}

// === API Query params ===
export interface ProductQueryParams {
  category_id?: string;
  q?: string;
  page?: number;
  size?: number;
}

export interface OrderQueryParams {
  page?: number;
  size?: number;
}
