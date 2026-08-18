/**
 * Item del carrito visual.
 * Muestra producto, cantidad, precio y controles de cantidad.
 */

import type { CartItemResponse } from '../types/api';
import { useAppDispatch } from '../store/hooks';
import { updateCartItem, removeFromCart } from '../store/cartSlice';

interface CartItemProps {
  item: CartItemResponse;
}

function formatCOP(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function CartItem({ item }: CartItemProps) {
  const dispatch = useAppDispatch();
  const { product, quantity } = item;
  const subtotal = product.sale_price_cop * quantity;

  const handleIncrease = () => {
    dispatch(
      updateCartItem({ productId: product.id, quantity: quantity + 1 }),
    );
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      dispatch(
        updateCartItem({ productId: product.id, quantity: quantity - 1 }),
      );
    } else {
      dispatch(removeFromCart(product.id));
    }
  };

  const handleRemove = () => {
    dispatch(removeFromCart(product.id));
  };

  return (
    <div className="cart-item">
      <img
        src={product.images[0]?.url}
        alt={product.images[0]?.alt_text || product.name}
        className="cart-item__image"
      />

      <div className="cart-item__details">
        <h4 className="cart-item__name">{product.name}</h4>
        <p className="cart-item__unit-price">
          {formatCOP(product.sale_price_cop)} / {product.unit}
        </p>
      </div>

      <div className="cart-item__controls">
        <div className="cart-item__quantity">
          <button
            className="cart-item__quantity-btn"
            onClick={handleDecrease}
            aria-label={`Reducir cantidad de ${product.name}`}
            type="button"
          >
            −
          </button>
          <span className="cart-item__quantity-value">{quantity}</span>
          <button
            className="cart-item__quantity-btn"
            onClick={handleIncrease}
            aria-label={`Aumentar cantidad de ${product.name}`}
            type="button"
          >
            +
          </button>
        </div>

        <span className="cart-item__subtotal">{formatCOP(subtotal)}</span>

        <button
          className="cart-item__remove"
          onClick={handleRemove}
          aria-label={`Eliminar ${product.name} del carrito`}
          type="button"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
