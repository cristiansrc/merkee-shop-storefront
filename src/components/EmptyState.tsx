/**
 * Componente de estado vacío.
 * Muestra mensaje cuando no hay datos disponibles.
 */

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon" aria-hidden="true">
        📭
      </div>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__message">{message}</p>
      {actionLabel && onAction && (
        <button className="empty-state__action" onClick={onAction} type="button">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
