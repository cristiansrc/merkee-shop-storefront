/**
 * Indicador de pasos del checkout.
 * Muestra progreso visual de 5 pasos.
 * Responsive móvil primero (iPhone SE 2020).
 * Accesible, es-CO, sin textos ingleses visibles.
 */

import { useAppSelector } from '../store/hooks';
import { selectCheckoutStep } from '../store/checkoutSlice';
import type { CheckoutStep } from '../store/checkoutSlice';

const steps: { key: CheckoutStep; label: string }[] = [
  { key: 'cart', label: 'Carrito' },
  { key: 'auth', label: 'Autenticación' },
  { key: 'address', label: 'Dirección' },
  { key: 'provider', label: 'Pago' },
  { key: 'confirmation', label: 'Confirmación' },
];

export function CheckoutSteps() {
  const currentStep = useAppSelector(selectCheckoutStep);
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <nav className="checkout-steps" aria-label="Pasos del checkout">
      <ol>
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isUpcoming = index > currentIndex;

          return (
            <li
              key={step.key}
              className={`checkout-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isUpcoming ? 'upcoming' : ''}`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span className="step-number" aria-hidden="true">
                {isCompleted ? '✓' : index + 1}
              </span>
              <span className="step-label">{step.label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
