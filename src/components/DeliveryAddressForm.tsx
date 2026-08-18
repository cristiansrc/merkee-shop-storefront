/**
 * Formulario de dirección de entrega para checkout.
 * Responsive móvil primero (iPhone SE 2020).
 * Accesible, es-CO, sin textos ingleses visibles.
 */

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setDeliveryAddress, selectDeliveryAddress, nextStep, prevStep } from '../store/checkoutSlice';
import type { DeliveryAddressRequest } from '../types/api';

export function DeliveryAddressForm() {
  const dispatch = useAppDispatch();
  const existingAddress = useAppSelector(selectDeliveryAddress);

  const [form, setForm] = useState<DeliveryAddressRequest>({
    recipient_name: existingAddress?.recipient_name || '',
    line1: existingAddress?.line1 || '',
    city: existingAddress?.city || '',
    phone: existingAddress?.phone || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof DeliveryAddressRequest, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof DeliveryAddressRequest, string>> = {};

    if (form.recipient_name.length < 2 || form.recipient_name.length > 100) {
      newErrors.recipient_name = 'El nombre debe tener entre 2 y 100 caracteres';
    }

    if (form.line1.length < 5 || form.line1.length > 180) {
      newErrors.line1 = 'La dirección debe tener entre 5 y 180 caracteres';
    }

    if (form.city.length < 2 || form.city.length > 100) {
      newErrors.city = 'La ciudad debe tener entre 2 y 100 caracteres';
    }

    if (form.phone.length < 7 || form.phone.length > 30) {
      newErrors.phone = 'El teléfono debe tener entre 7 y 30 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      dispatch(setDeliveryAddress(form));
      dispatch(nextStep());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form" aria-label="Formulario de dirección de entrega">
      <h2>Dirección de Entrega</h2>

      <div className="form-group">
        <label htmlFor="recipient-name">Nombre del destinatario</label>
        <input
          id="recipient-name"
          type="text"
          value={form.recipient_name}
          onChange={(e) => setForm({ ...form, recipient_name: e.target.value })}
          required
          minLength={2}
          maxLength={100}
          aria-describedby={errors.recipient_name ? 'recipient-name-error' : undefined}
        />
        {errors.recipient_name && (
          <span id="recipient-name-error" className="form-error" role="alert">
            {errors.recipient_name}
          </span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="address-line1">Dirección</label>
        <input
          id="address-line1"
          type="text"
          value={form.line1}
          onChange={(e) => setForm({ ...form, line1: e.target.value })}
          required
          minLength={5}
          maxLength={180}
          placeholder="Calle, número, apartamento"
          aria-describedby={errors.line1 ? 'address-line1-error' : undefined}
        />
        {errors.line1 && (
          <span id="address-line1-error" className="form-error" role="alert">
            {errors.line1}
          </span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="address-city">Ciudad</label>
        <input
          id="address-city"
          type="text"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          required
          minLength={2}
          maxLength={100}
          aria-describedby={errors.city ? 'address-city-error' : undefined}
        />
        {errors.city && (
          <span id="address-city-error" className="form-error" role="alert">
            {errors.city}
          </span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="address-phone">Teléfono</label>
        <input
          id="address-phone"
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
          minLength={7}
          maxLength={30}
          autoComplete="tel"
          aria-describedby={errors.phone ? 'address-phone-error' : undefined}
        />
        {errors.phone && (
          <span id="address-phone-error" className="form-error" role="alert">
            {errors.phone}
          </span>
        )}
      </div>

      <div className="form-actions">
        <button type="button" onClick={() => dispatch(prevStep())} className="btn-secondary">
          Anterior
        </button>
        <button type="submit" className="btn-primary">
          Continuar
        </button>
      </div>
    </form>
  );
}
