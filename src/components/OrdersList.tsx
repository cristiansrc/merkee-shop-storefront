/**
 * Lista de órdenes propias paginadas.
 * Solo lectura.
 * Responsive móvil primero (iPhone SE 2020).
 * Accesible, es-CO, sin textos ingleses visibles.
 */

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchOrders, selectOrders, selectOrdersPage, selectOrdersLoading, selectOrdersError } from '../store/ordersSlice';
import { useNavigate } from 'react-router-dom';

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

export function OrdersList() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const orders = useAppSelector(selectOrders);
  const page = useAppSelector(selectOrdersPage);
  const loading = useAppSelector(selectOrdersLoading);
  const error = useAppSelector(selectOrdersError);

  useEffect(() => {
    dispatch(fetchOrders({ page: 1, size: 10 }));
  }, [dispatch]);

  const handlePageChange = (newPage: number) => {
    dispatch(fetchOrders({ page: newPage, size: 10 }));
  };

  if (loading && orders.length === 0) {
    return (
      <div className="orders-list" role="status" aria-live="polite">
        <h2>Mis Pedidos</h2>
        <p>Cargando pedidos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-list" role="alert" aria-live="polite">
        <h2>Mis Pedidos</h2>
        <p className="error-message">{error}</p>
        <button onClick={() => dispatch(fetchOrders({ page: 1, size: 10 }))} className="btn-secondary">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="orders-list" aria-label="Lista de pedidos">
      <h2>Mis Pedidos</h2>

      {orders.length === 0 ? (
        <p className="empty-message">No tienes pedidos aún</p>
      ) : (
        <>
          <ul className="orders-items">
            {orders.map((order) => (
              <li
                key={order.id}
                className="order-card"
                onClick={() => navigate(`/pedidos/${order.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate(`/pedidos/${order.id}`);
                  }
                }}
              >
                <div className="order-card-header">
                  <span className="order-number">#{order.order_number}</span>
                  <span className={`order-status status-${order.status.toLowerCase()}`}>
                    {STATUS_MESSAGES[order.status] || order.status}
                  </span>
                </div>
                <div className="order-card-body">
                  <span className="order-date">
                    {new Date(order.created_at).toLocaleDateString('es-CO')}
                  </span>
                  <span className="order-total">{FORMAT_COP.format(order.total_cop)}</span>
                </div>
                <div className="order-card-items">
                  {order.items.length} {order.items.length === 1 ? 'artículo' : 'artículos'}
                </div>
              </li>
            ))}
          </ul>

          {page && page.total > page.size && (
            <div className="pagination" role="navigation" aria-label="Paginación de pedidos">
              <button
                onClick={() => handlePageChange(page.page - 1)}
                disabled={page.page <= 1}
                className="btn-secondary"
              >
                Anterior
              </button>
              <span className="page-info">
                Página {page.page} de {Math.ceil(page.total / page.size)}
              </span>
              <button
                onClick={() => handlePageChange(page.page + 1)}
                disabled={page.page * page.size >= page.total}
                className="btn-secondary"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
