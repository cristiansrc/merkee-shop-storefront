/**
 * Confirmación de checkout.
 * Muestra estado de la orden y enlace al proveedor de pago.
 * Responsive móvil primero (iPhone SE 2020).
 * Accesible, es-CO, sin textos ingleses visibles.
 */

import { useAppSelector } from '../store/hooks';
import { selectCheckoutResult, selectCheckoutLoading } from '../store/checkoutSlice';

const FORMAT_COP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function CheckoutConfirmation() {
  const result = useAppSelector(selectCheckoutResult);
  const loading = useAppSelector(selectCheckoutLoading);

  if (loading) {
    return (
      <div className="checkout-confirmation" role="status" aria-live="polite">
        <h2>Procesando Pedido</h2>
        <p>Por favor espera mientras procesamos tu pedido...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="checkout-confirmation">
        <h2>Error</h2>
        <p>No se pudo procesar el pedido. Por favor intenta nuevamente.</p>
      </div>
    );
  }

  const { order, payment, provider_checkout_url } = result;

  const statusMessages: Record<string, string> = {
    PENDING_PAYMENT: 'Pago pendiente',
    PAID: 'Pago aprobado',
    PAYMENT_FAILED: 'Pago fallido',
    PAYMENT_EXPIRED: 'Pago expirado',
    RESERVATION_EXPIRED: 'Reserva expirada',
    PAYMENT_REFUND_PENDING: 'Reembolso pendiente',
    PAYMENT_REFUNDED: 'Reembolsado',
    PAYMENT_REFUND_FAILED: 'Error en reembolso',
  };

  return (
    <div className="checkout-confirmation" aria-label="Confirmación de pedido">
      <h2>Pedido Creado</h2>

      <div className="order-details">
        <div className="order-detail-row">
          <span>Número de orden</span>
          <span>{order.order_number}</span>
        </div>
        <div className="order-detail-row">
          <span>Estado</span>
          <span>{statusMessages[order.status] || order.status}</span>
        </div>
        <div className="order-detail-row">
          <span>Total</span>
          <span>{FORMAT_COP.format(order.total_cop)}</span>
        </div>
        <div className="order-detail-row">
          <span>Proveedor</span>
          <span>{payment.provider === 'WOMPI' ? 'Wompi' : 'Mercado Pago'}</span>
        </div>
      </div>

      {provider_checkout_url && (
        <div className="payment-action">
          <p>Para completar el pago, haz clic en el siguiente enlace:</p>
          <a
            href={provider_checkout_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Ir a Pagar
          </a>
        </div>
      )}

      <div className="order-items">
        <h3>Artículos</h3>
        <ul>
          {order.items.map((item, index) => (
            <li key={index}>
              <span>{item.product_name}</span>
              <span>x{item.quantity}</span>
              <span>{FORMAT_COP.format(item.subtotal_cop)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="delivery-info">
        <h3>Dirección de Entrega</h3>
        <p>{order.delivery_recipient_name}</p>
        <p>{order.delivery_line1}</p>
        <p>{order.delivery_city}</p>
        <p>{order.delivery_phone}</p>
      </div>
    </div>
  );
}
