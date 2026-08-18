/**
 * Componente de indicador de carga.
 * Muestra un spinner animado con mensaje opcional.
 */

interface LoadingProps {
  message?: string;
  fullPage?: boolean;
}

export function Loading({ message = 'Cargando...', fullPage = false }: LoadingProps) {
  return (
    <div
      className={`loading ${fullPage ? 'loading--fullpage' : ''}`}
      role="status"
      aria-live="polite"
    >
      <div className="loading__spinner" aria-hidden="true">
        <div className="loading__dot" />
        <div className="loading__dot" />
        <div className="loading__dot" />
      </div>
      <p className="loading__message">{message}</p>
    </div>
  );
}
