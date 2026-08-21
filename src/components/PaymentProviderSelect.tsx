/**
 * Selección de proveedor de pago para checkout.
 * Al confirmar, dispara `POST /v1/checkouts` real y solo avanza a confirmación
 * cuando la API responde (no se avanza sin respuesta).
 * Responsive móvil primero (iPhone SE 2020).
 * Accesible, es-CO, sin textos ingleses visibles.
 */

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setPaymentProvider,
  selectPaymentProvider,
  selectDeliveryAddress,
  prevStep,
  submitCheckout,
  selectCheckoutLoading,
  selectCheckoutError,
} from '../store/checkoutSlice';
import type { PaymentProvider } from '../types/api';

export function PaymentProviderSelect() {
  const dispatch = useAppDispatch();
  const existingProvider = useAppSelector(selectPaymentProvider);
  const deliveryAddress = useAppSelector(selectDeliveryAddress);
  const loading = useAppSelector(selectCheckoutLoading);
  const checkoutError = useAppSelector(selectCheckoutError);

  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(existingProvider);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider) return;

    // Sin dirección no se puede crear el checkout.
    if (!deliveryAddress) {
      setLocalError('Completa la dirección de entrega antes de continuar.');
      return;
    }

    setLocalError(null);
    dispatch(setPaymentProvider(selectedProvider));

    // Llamada real a POST /checkouts. `submitCheckout.fulfilled` avanza a
    // 'confirmation'; en error permanecemos en el paso de pago.
    try {
      await dispatch(
        submitCheckout({
          delivery_address: deliveryAddress,
          payment_provider: selectedProvider,
        }),
      ).unwrap();
    } catch {
      // El error ya queda reflejado en selectCheckoutError.
    }
  };

  const error = localError ?? checkoutError;

  return (
    <form onSubmit={handleSubmit} className="checkout-form" aria-label="Selección de proveedor de pago">
      <h2>Método de Pago</h2>

      {error && (
        <div className="form-error" role="alert" aria-live="polite">
          {error}
        </div>
      )}

      <div className="payment-options" role="radiogroup" aria-label="Proveedores de pago disponibles">
        <label className="payment-option">
          <input
            type="radio"
            name="payment-provider"
            value="WOMPI"
            checked={selectedProvider === 'WOMPI'}
            onChange={() => setSelectedProvider('WOMPI')}
          />
          <span className="payment-option-label">Wompi</span>
          <span className="payment-option-description">Pago seguro con tarjeta, PSE y más</span>
        </label>

        <label className="payment-option">
          <input
            type="radio"
            name="payment-provider"
            value="MERCADO_PAGO"
            checked={selectedProvider === 'MERCADO_PAGO'}
            onChange={() => setSelectedProvider('MERCADO_PAGO')}
          />
          <span className="payment-option-label">Mercado Pago</span>
          <span className="payment-option-description">Pago con tarjeta, efectivo y transferencia</span>
        </label>
      </div>

      <div className="form-actions">
        <button type="button" onClick={() => dispatch(prevStep())} className="btn-secondary">
          Anterior
        </button>
        <button type="submit" disabled={!selectedProvider || loading} className="btn-primary">
          {loading ? 'Procesando pago...' : 'Pagar'}
        </button>
      </div>
    </form>
  );
}
