/**
 * Página de detalle de producto.
 * Muestra información completa del producto, imágenes y opción de agregar al carrito.
 */

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadProduct, clearSelectedProduct } from '../store/catalogSlice';
import { addToCart } from '../store/cartSlice';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';

function formatCOP(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const dispatch = useAppDispatch();
  const {
    selectedProduct: product,
    selectedProductLoading: loading,
    selectedProductError: error,
  } = useAppSelector((state) => state.catalog);

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (productId) {
      dispatch(loadProduct(productId));
    }
    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [dispatch, productId]);

  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCart({ productId: product.id, quantity }));
    }
  };

  if (loading) {
    return <Loading message="Cargando producto..." fullPage />;
  }

  if (error) {
    return (
      <div className="product-detail-page">
        <ErrorMessage
          message={error}
          onRetry={() => productId && dispatch(loadProduct(productId))}
        />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const hasDiscount = product.sale_price_cop < product.regular_price_cop;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.regular_price_cop - product.sale_price_cop) /
          product.regular_price_cop) *
          100,
      )
    : 0;

  return (
    <div className="product-detail-page">
      {/* Breadcrumb */}
      <nav className="product-detail-page__breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Inicio</Link>
        <span aria-hidden="true">/</span>
        <Link to="/productos">Productos</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/productos?category_id=${product.category.id}`}>
          {product.category.name}
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{product.name}</span>
      </nav>

      <div className="product-detail-page__content">
        {/* Galería de imágenes */}
        <div className="product-detail-page__gallery">
          <div className="product-detail-page__main-image">
            <img
              src={product.images[selectedImageIndex]?.url}
              alt={product.images[selectedImageIndex]?.alt_text || product.name}
              className="product-detail-page__image"
            />
            {hasDiscount && (
              <span className="product-detail-page__badge">
                -{discountPercent}%
              </span>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="product-detail-page__thumbnails">
              {product.images.map((image, index) => (
                <button
                  key={image.key}
                  className={`product-detail-page__thumbnail ${
                    index === selectedImageIndex
                      ? 'product-detail-page__thumbnail--active'
                      : ''
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                  type="button"
                  aria-label={`Ver imagen ${index + 1}`}
                >
                  <img src={image.url} alt={image.alt_text} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div className="product-detail-page__info">
          <span className="product-detail-page__category">
            {product.category.name}
          </span>

          <h1 className="product-detail-page__name">{product.name}</h1>

          <div className="product-detail-page__pricing">
            <span className="product-detail-page__price">
              {formatCOP(product.sale_price_cop)}
            </span>
            {hasDiscount && (
              <span className="product-detail-page__price product-detail-page__price--original">
                {formatCOP(product.regular_price_cop)}
              </span>
            )}
            <span className="product-detail-page__unit">
              / {product.unit}
            </span>
          </div>

          <div className="product-detail-page__stock">
            {product.stock_available > 0 ? (
              <span className="product-detail-page__stock-available">
                ✓ Disponible ({product.stock_available} {product.unit}
                {product.stock_available !== 1 ? 's' : ''})
              </span>
            ) : (
              <span className="product-detail-page__stock-out">
                ✕ Agotado
              </span>
            )}
          </div>

          <div className="product-detail-page__description">
            <h2>Descripción</h2>
            <p>{product.description}</p>
          </div>

          {/* Agregar al carrito */}
          {product.stock_available > 0 && (
            <div className="product-detail-page__add-to-cart">
              <div className="product-detail-page__quantity">
                <button
                  className="product-detail-page__quantity-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  type="button"
                  aria-label="Reducir cantidad"
                >
                  −
                </button>
                <span className="product-detail-page__quantity-value">
                  {quantity}
                </span>
                <button
                  className="product-detail-page__quantity-btn"
                  onClick={() =>
                    setQuantity(Math.min(product.stock_available, quantity + 1))
                  }
                  disabled={quantity >= product.stock_available}
                  type="button"
                  aria-label="Aumentar cantidad"
                >
                  +
                </button>
              </div>

              <button
                className="product-detail-page__add-button"
                onClick={handleAddToCart}
                type="button"
              >
                Agregar al carrito
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
