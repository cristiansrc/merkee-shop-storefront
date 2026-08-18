/**
 * Componente de mensaje de error.
 * Muestra error con opción de reintentar.
 */

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="error-message" role="alert">
      <div className="error-message__icon" aria-hidden="true">
        ⚠️
      </div>
      <p className="error-message__text">{message}</p>
      {onRetry && (
        <button className="error-message__retry" onClick={onRetry} type="button">
          Reintentar
        </button>
      )}
    </div>
  );
}
