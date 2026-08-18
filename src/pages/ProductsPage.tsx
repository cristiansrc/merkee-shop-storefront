/**
 * Página de productos paginados.
 * Soporta filtrado por categoría, búsqueda y paginación.
 * Estados: loading, error, empty, lista con productos.
 */

import { useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadProducts, setActiveCategoryId, setSearchQuery } from '../store/catalogSlice';
import { ProductCard } from '../components/ProductCard';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';

const PRODUCTS_PER_PAGE = 20;

export function ProductsPage() {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    products,
    productsPage,
    productsLoading,
    productsError,
    activeCategoryId,
    searchQuery,
  } = useAppSelector((state) => state.catalog);

  // Leer parámetros de URL
  const urlCategoryId = searchParams.get('category_id') || undefined;
  const urlQuery = searchParams.get('q') || '';
  const urlPage = parseInt(searchParams.get('page') || '1', 10);

  // Sincronizar URL con estado de Redux
  useEffect(() => {
    if (urlCategoryId !== activeCategoryId) {
      dispatch(setActiveCategoryId(urlCategoryId));
    }
    if (urlQuery !== searchQuery) {
      dispatch(setSearchQuery(urlQuery));
    }
  }, [urlCategoryId, urlQuery, activeCategoryId, searchQuery, dispatch]);

  // Cargar productos cuando cambian los filtros
  const loadProductsData = useCallback(() => {
    dispatch(
      loadProducts({
        page: urlPage,
        size: PRODUCTS_PER_PAGE,
        category_id: urlCategoryId,
        q: urlQuery || undefined,
      }),
    );
  }, [dispatch, urlPage, urlCategoryId, urlQuery]);

  useEffect(() => {
    loadProductsData();
  }, [loadProductsData]);

  // Manejar cambio de página
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    setSearchParams(params);
  };

  // Calcular páginas totales
  const totalPages = productsPage
    ? Math.ceil(productsPage.total / productsPage.size)
    : 0;

  // Título dinámico
  const pageTitle = urlQuery
    ? `Resultados para "${urlQuery}"`
    : urlCategoryId
      ? 'Productos por categoría'
      : 'Todos los productos';

  return (
    <div className="products-page">
      <h1 className="products-page__title">{pageTitle}</h1>

      {productsPage && (
        <p className="products-page__count">
          {productsPage.total} producto{productsPage.total !== 1 ? 's' : ''} encontrado
          {productsPage.total !== 1 ? 's' : ''}
        </p>
      )}

      {productsLoading && <Loading message="Cargando productos..." />}

      {productsError && (
        <ErrorMessage
          message={productsError}
          onRetry={loadProductsData}
        />
      )}

      {!productsLoading && !productsError && products.length === 0 && (
        <EmptyState
          title="No se encontraron productos"
          message={
            urlQuery
              ? `No hay productos que coincidan con "${urlQuery}".`
              : 'No hay productos disponibles en este momento.'
          }
          actionLabel={urlQuery ? 'Limpiar búsqueda' : 'Volver al inicio'}
          onAction={() => {
            if (urlQuery) {
              setSearchParams({});
              dispatch(setSearchQuery(''));
            } else {
              window.location.href = '/';
            }
          }}
        />
      )}

      {!productsLoading && !productsError && products.length > 0 && (
        <>
          <div className="products-page__grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <nav className="products-page__pagination" aria-label="Paginación">
              <button
                className="products-page__pagination-btn"
                onClick={() => handlePageChange(urlPage - 1)}
                disabled={urlPage <= 1}
                type="button"
              >
                ← Anterior
              </button>

              <span className="products-page__pagination-info">
                Página {urlPage} de {totalPages}
              </span>

              <button
                className="products-page__pagination-btn"
                onClick={() => handlePageChange(urlPage + 1)}
                disabled={urlPage >= totalPages}
                type="button"
              >
                Siguiente →
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
