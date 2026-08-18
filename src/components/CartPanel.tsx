/**
 * Panel lateral del carrito.
 * Se desliza desde la derecha y muestra los items del carrito.
 * Estado derivado del servidor, sin persistencia en navegador.
 */

import { useAppSelector, useAppDispatch } from '../store/hooks';
import { closeCart } from '../store/cartSlice';
import { CartItem } from './CartItem';
import { Loading } from './Loading';
import { EmptyState } from './EmptyState';

function formatCOP(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function CartPanel() {
  const dispatch = useAppDispatch();
  const { data: cart, isOpen, loading, error } = useAppSelector((state) => state.cart);

  const handleClose = () => {
    dispatch(closeCart());
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="cart-panel__overlay" onClick={handleClose} aria-hidden="true" />

      {/* Panel */}
      <aside className="cart-panel" role="dialog" aria-label="Carrito de compras">
        <div className="cart-panel__header">
          <h2 className="cart-panel__title">Tu Carrito</h2>
          <button
            className="cart-panel__close"
            onClick={handleClose}
            aria-label="Cerrar carrito"
            type="button"
          >
            ✕
          </button>
        </div>

        <div className="cart-panel__content">
          {loading && !cart && <Loading message="Cargando carrito..." />}

          {error && (
            <div className="cart-panel__error">
              <p>{error}</p>
            </div>
          )}

          {cart && cart.items.length === 0 && (
            <EmptyState
              title="Carrito vacío"
              message="Agrega productos del catálogo para comenzar tu compra."
              actionLabel="Ver productos"
              onAction={() => {
                handleClose();
                window.location.href = '/productos';
              }}
            />
          )}

          {cart && cart.items.length > 0 && (
            <>
              <div className="cart-panel__items">
                {cart.items.map((item) => (
                  <CartItem key={item.product.id} item={item} />
                ))}
              </div>

              <div className="cart-panel__summary">
                <div className="cart-panel__summary-row">
                  <span>Subtotal</span>
                  <span>{formatCOP(cart.items_subtotal_cop)}</span>
                </div>
                <div className="cart-panel__summary-row">
                  <span>Envío</span>
                  <span>{formatCOP(cart.delivery_fee_cop)}</span>
                </div>
                <div className="cart-panel__summary-row">
                  <span>IVA (19%)</span>
                  <span>{formatCOP(cart.iva_cop)}</span>
                </div>
                <div className="cart-panel__summary-row cart-panel__summary-row--total">
                  <span>Total</span>
                  <span>{formatCOP(cart.total_cop)}</span>
                </div>
              </div>

              <button className="cart-panel__checkout-btn" type="button">
                Continuar al checkout
              </button>

              {cart.reservation_expires_at && (
                <p className="cart-panel__reservation-note">
                  ⏱️ Tus productos están reservados por 10 minutos.
                </p>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}
