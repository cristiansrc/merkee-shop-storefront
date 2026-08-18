/**
 * Página de categorías.
 * Lista todas las categorías disponibles para navegación.
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadCategories } from '../store/catalogSlice';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';

export function CategoriesPage() {
  const dispatch = useAppDispatch();
  const { categories, categoriesLoading, categoriesError } = useAppSelector(
    (state) => state.catalog,
  );

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(loadCategories());
    }
  }, [dispatch, categories.length]);

  return (
    <div className="categories-page">
      <h1 className="categories-page__title">Categorías</h1>
      <p className="categories-page__subtitle">
        Encuentra lo que buscas por categoría
      </p>

      {categoriesLoading && <Loading message="Cargando categorías..." />}

      {categoriesError && (
        <ErrorMessage
          message={categoriesError}
          onRetry={() => dispatch(loadCategories())}
        />
      )}

      {!categoriesLoading && !categoriesError && categories.length === 0 && (
        <EmptyState
          title="No hay categorías"
          message="No se encontraron categorías disponibles en este momento."
          actionLabel="Volver al inicio"
          onAction={() => (window.location.href = '/')}
        />
      )}

      {!categoriesLoading && !categoriesError && categories.length > 0 && (
        <div className="categories-page__grid">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/productos?category_id=${category.id}`}
              className="categories-page__card"
            >
              <img
                src={category.image.url}
                alt={category.image.alt_text}
                className="categories-page__card-image"
                loading="lazy"
              />
              <div className="categories-page__card-content">
                <h2 className="categories-page__card-name">{category.name}</h2>
                <span className="categories-page__card-action">
                  Ver productos →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
