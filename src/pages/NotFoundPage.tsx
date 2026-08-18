/**
 * Página 404 - No encontrado.
 * Muestra un mensaje amigable y enlace para volver al inicio.
 */

import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="not-found-page">
      <h1 className="not-found-page__title">404</h1>
      <p className="not-found-page__subtitle">Página no encontrada</p>
      <p className="not-found-page__text">
        Lo sentimos, la página que buscas no existe o ha sido movida.
      </p>
      <Link to="/" className="not-found-page__link">
        Volver al inicio
      </Link>
    </div>
  );
}
