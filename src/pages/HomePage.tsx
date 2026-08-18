/**
 * Página de inicio del storefront.
 * Muestra banners promocionales y categorías destacadas.
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadBanners, loadCategories, loadProducts } from '../store/catalogSlice';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { ProductCard } from '../components/ProductCard';

export function HomePage() {
  const dispatch = useAppDispatch();
  const { banners, bannersLoading, bannersError } = useAppSelector(
    (state) => state.catalog,
  );
  const { categories, categoriesLoading, categoriesError } = useAppSelector(
    (state) => state.catalog,
  );
  const { products, productsLoading, productsError } = useAppSelector(
    (state) => state.catalog,
  );

  useEffect(() => {
    if (banners.length === 0) {
      dispatch(loadBanners());
    }
    if (categories.length === 0) {
      dispatch(loadCategories());
    }
    if (products.length === 0) {
      dispatch(loadProducts({ page: 1, size: 6 }));
    }
  }, [dispatch, banners.length, categories.length, products.length]);

  return (
    <div className="home-page">
      {/* Hero / Banners */}
      <section className="home-page__hero" aria-label="Promociones destacadas">
        {bannersLoading && <Loading message="Cargando promociones..." />}

        {bannersError && (
          <ErrorMessage
            message={bannersError}
            onRetry={() => dispatch(loadBanners())}
          />
        )}

        {!bannersLoading && !bannersError && banners.length > 0 && (
          <div className="home-page__banners">
            {banners.map((banner) => (
              <Link
                key={banner.id}
                to={banner.target_path || '/'}
                className="home-page__banner"
              >
                <img
                  src={banner.image.url}
                  alt={banner.image.alt_text}
                  className="home-page__banner-image"
                />
                <div className="home-page__banner-overlay">
                  <h2 className="home-page__banner-title">{banner.name}</h2>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Categorías */}
      <section className="home-page__categories" aria-label="Categorías">
        <h2 className="home-page__section-title">Explora nuestras categorías</h2>

        {categoriesLoading && <Loading message="Cargando categorías..." />}

        {categoriesError && (
          <ErrorMessage
            message={categoriesError}
            onRetry={() => dispatch(loadCategories())}
          />
        )}

        {!categoriesLoading && !categoriesError && categories.length > 0 && (
          <div className="home-page__category-grid">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/productos?category_id=${category.id}`}
                className="home-page__category-card"
              >
                <img
                  src={category.image.url}
                  alt={category.image.alt_text}
                  className="home-page__category-image"
                  loading="lazy"
                />
                <h3 className="home-page__category-name">{category.name}</h3>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Productos destacados */}
      <section className="home-page__featured" aria-label="Productos destacados">
        <h2 className="home-page__section-title">Productos destacados</h2>

        {productsLoading && <Loading message="Cargando productos destacados..." />}

        {productsError && (
          <ErrorMessage
            message={productsError}
            onRetry={() => dispatch(loadProducts({ page: 1, size: 6 }))}
          />
        )}

        {!productsLoading && !productsError && products.length > 0 && (
          <div className="home-page__products-grid">
            {products.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="home-page__cta">
        <h2 className="home-page__cta-title">¿Listo para comprar?</h2>
        <p className="home-page__cta-text">
          Explora nuestro catálogo completo de productos frescos y de calidad.
        </p>
        <Link to="/productos" className="home-page__cta-button">
          Ver todos los productos
        </Link>
      </section>
    </div>
  );
}
