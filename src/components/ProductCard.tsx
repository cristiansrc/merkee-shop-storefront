/**
 * Tarjeta de producto para listados.
 * Muestra imagen, nombre, precio y unidad.
 * Formato COP colombiano.
 */

import { Link } from 'react-router-dom';
import type { ProductResponse } from '../types/api';
import { useAppDispatch } from '../store/hooks';
import { addToCart } from '../store/cartSlice';

interface ProductCardProps {
  product: ProductResponse;
}

function formatCOP(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function ProductCard({ product }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const hasDiscount = product.sale_price_cop < product.regular_price_cop;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.regular_price_cop - product.sale_price_cop) /
          product.regular_price_cop) *
          100,
      )
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({ productId: product.id, quantity: 1 }));
  };

  return (
    <article className="product-card">
      <Link to={`/productos/${product.id}`} className="product-card__link">
        <div className="product-card__image-container">
          <img
            src={product.images[0]?.url}
            alt={product.images[0]?.alt_text || product.name}
            className="product-card__image"
            loading="lazy"
          />
          {hasDiscount && (
            <span className="product-card__badge product-card__badge--discount">
              -{discountPercent}%
            </span>
          )}
          {product.stock_available === 0 && (
            <span className="product-card__badge product-card__badge--out-of-stock">
              Agotado
            </span>
          )}
        </div>

        <div className="product-card__content">
          <span className="product-card__category">{product.category.name}</span>
          <h3 className="product-card__name">{product.name}</h3>

          <div className="product-card__pricing">
            <span className="product-card__price">
              {formatCOP(product.sale_price_cop)}
            </span>
            {hasDiscount && (
              <span className="product-card__price product-card__price--original">
                {formatCOP(product.regular_price_cop)}
              </span>
            )}
            <span className="product-card__unit">/ {product.unit}</span>
          </div>
        </div>
      </Link>

      <button
        className="product-card__add-button"
        onClick={handleAddToCart}
        disabled={product.stock_available === 0}
        aria-label={`Agregar ${product.name} al carrito`}
        type="button"
      >
        {product.stock_available === 0 ? 'Agotado' : 'Agregar'}
      </button>
    </article>
  );
}
