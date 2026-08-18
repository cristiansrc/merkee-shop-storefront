/**
 * Detalle de una orden específica.
 * Solo lectura.
 * Responsive móvil primero (iPhone SE 2020).
 * Accesible, es-CO, sin textos ingleses visibles.
 */

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchOrderById, clearSelectedOrder, selectSelectedOrder, selectOrdersLoading, selectOrdersError } from '../store/ordersSlice';

const FORMAT_COP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const STATUS_MESSAGES: Record<string, string> = {
  PENDING_PAYMENT: 'Pago pendiente',
  PAID: 'Pagado',
  PAYMENT_FAILED: 'Pago fallido',
  PAYMENT_EXPIRED: 'Pago expirado',
  RESERVATION_EXPIRED: 'Reserva expirada',
  PAYMENT_REFUND_PENDING: 'Reembolso pendiente',
  PAYMENT_REFUNDED: 'Reembolsado',
  PAYMENT_REFUND_FAILED: 'Error en reembolso',
};

export function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const order = useAppSelector(selectSelectedOrder);
  const loading = useAppSelector(selectOrdersLoading);
  const error = useAppSelector(selectOrdersError);

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderById(orderId));
    }
    return () => {
      dispatch(clearSelectedOrder());
    };
  }, [orderId, dispatch]);

  if (loading) {
    return (
      <div className="order-detail" role="status" aria-live="polite">
        <h2>Cargando pedido...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-detail" role="alert" aria-live="polite">
        <h2>Error</h2>
        <p className="error-message">{error}</p>
        <button onClick={() => navigate('/pedidos')} className="btn-secondary">
          Volver a mis pedidos
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail">
        <h2>Pedido no encontrado</h2>
        <button onClick={() => navigate('/pedidos')} className="btn-secondary">
          Volver a mis pedidos
        </button>
      </div>
    );
  }

  return (
    <div className="order-detail" aria-label={`Detalle del pedido ${order.order_number}`}>
      <button onClick={() => navigate('/pedidos')} className="btn-back">
        ← Volver a mis pedidos
      </button>

      <h2>Pedido #{order.order_number}</h2>

      <div className="order-info">
        <div className="order-info-row">
          <span>Estado</span>
          <span className={`order-status status-${order.status.toLowerCase()}`}>
            {STATUS_MESSAGES[order.status] || order.status}
          </span>
        </div>
        <div className="order-info-row">
          <span>Fecha</span>
          <span>{new Date(order.created_at).toLocaleDateString('es-CO')}</span>
        </div>
        <div className="order-info-row">
          <span>Proveedor</span>
          <span>{order.payment.provider === 'WOMPI' ? 'Wompi' : 'Mercado Pago'}</span>
        </div>
      </div>

      <div className="order-totals">
        <div className="order-total-row">
          <span>Subtotal</span>
          <span>{FORMAT_COP.format(order.items_subtotal_cop)}</span>
        </div>
        <div className="order-total-row">
          <span>IVA (19%)</span>
          <span>{FORMAT_COP.format(order.iva_cop)}</span>
        </div>
        <div className="order-total-row">
          <span>Entrega</span>
          <span>{FORMAT_COP.format(order.delivery_fee_cop)}</span>
        </div>
        <div className="order-total-row order-total-final">
          <span>Total</span>
          <span>{FORMAT_COP.format(order.total_cop)}</span>
        </div>
      </div>

      <div className="order-items">
        <h3>Artículos</h3>
        <ul>
          {order.items.map((item, index) => (
            <li key={index} className="order-item">
              <div className="order-item-info">
                <span className="order-item-name">{item.product_name}</span>
                <span className="order-item-unit">{item.unit}</span>
              </div>
              <div className="order-item-quantity">
                x{item.quantity} @ {FORMAT_COP.format(item.unit_price_cop)}
              </div>
              <div className="order-item-subtotal">
                {FORMAT_COP.format(item.subtotal_cop)}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="delivery-info">
        <h3>Dirección de Entrega</h3>
        <p><strong>{order.delivery_recipient_name}</strong></p>
        <p>{order.delivery_line1}</p>
        <p>{order.delivery_city}</p>
        <p>{order.delivery_phone}</p>
      </div>
    </div>
  );
}
