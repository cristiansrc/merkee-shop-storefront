/**
 * Selección de proveedor de pago para checkout.
 * Responsive móvil primero (iPhone SE 2020).
 * Accesible, es-CO, sin textos ingleses visibles.
 */

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setPaymentProvider, selectPaymentProvider, nextStep, prevStep } from '../store/checkoutSlice';
import type { PaymentProvider } from '../types/api';

export function PaymentProviderSelect() {
  const dispatch = useAppDispatch();
  const existingProvider = useAppSelector(selectPaymentProvider);

  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(existingProvider);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProvider) {
      dispatch(setPaymentProvider(selectedProvider));
      dispatch(nextStep());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form" aria-label="Selección de proveedor de pago">
      <h2>Método de Pago</h2>

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
        <button type="submit" disabled={!selectedProvider} className="btn-primary">
          Continuar
        </button>
      </div>
    </form>
  );
}
