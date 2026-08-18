/**
 * Resumen del carrito para checkout.
 * Muestra subtotal, IVA 19%, entrega 5000 y total COP.
 * Responsive móvil primero (iPhone SE 2020).
 * Accesible, es-CO, sin textos ingleses visibles.
 */

import { useAppSelector } from '../store/hooks';
import { selectCartItems, selectCartTotal } from '../store/cartSlice';

const FORMAT_COP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function CartSummary() {
  const items = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.sale_price_cop * item.quantity,
    0,
  );
  const iva = Math.floor((subtotal * 19 + 50) / 100);
  const deliveryFee = 5000;

  return (
    <div className="cart-summary" aria-label="Resumen del carrito">
      <h2>Resumen del Pedido</h2>

      {items.length === 0 ? (
        <p className="empty-message">Tu carrito está vacío</p>
      ) : (
        <>
          <ul className="cart-items-list">
            {items.map((item) => (
              <li key={item.product.id} className="cart-item">
                <span className="cart-item-name">{item.product.name}</span>
                <span className="cart-item-quantity">x{item.quantity}</span>
                <span className="cart-item-price">
                  {FORMAT_COP.format(item.product.sale_price_cop * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="cart-totals">
            <div className="cart-total-row">
              <span>Subtotal</span>
              <span>{FORMAT_COP.format(subtotal)}</span>
            </div>
            <div className="cart-total-row">
              <span>IVA (19%)</span>
              <span>{FORMAT_COP.format(iva)}</span>
            </div>
            <div className="cart-total-row">
              <span>Entrega</span>
              <span>{FORMAT_COP.format(deliveryFee)}</span>
            </div>
            <div className="cart-total-row cart-total-final">
              <span>Total</span>
              <span>{FORMAT_COP.format(total)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
