/**
 * Formulario de solicitud de restablecimiento de contraseña.
 * Respuesta neutra 202 siempre.
 * Responsive móvil primero (iPhone SE 2020).
 * Accesible, es-CO, sin textos ingleses visibles.
 */

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { sendPasswordResetRequest, selectProfileLoading, selectProfileError } from '../store/profileSlice';

interface PasswordResetRequestFormProps {
  onBackToLogin?: () => void;
}

export function PasswordResetRequestForm({ onBackToLogin }: PasswordResetRequestFormProps) {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectProfileLoading);
  const error = useAppSelector(selectProfileError);

  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await dispatch(sendPasswordResetRequest(email)).unwrap();
      setSent(true);
    } catch {
      // Error manejado por el slice
    }
  };

  if (sent) {
    return (
      <div className="auth-form" role="status" aria-live="polite">
        <h2>Solicitud Enviada</h2>
        <p>
          Si el correo electrónico está registrado, recibirás un enlace para restablecer tu contraseña.
        </p>
        <button onClick={onBackToLogin} className="btn-secondary">
          Volver al inicio de sesión
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form" aria-label="Formulario de restablecimiento de contraseña">
      <h2>Restablecer Contraseña</h2>
      <p>
        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
      </p>

      {error && (
        <div className="form-error" role="alert" aria-live="polite">
          {error}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="reset-email">Correo electrónico</label>
        <input
          id="reset-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="tu@ejemplo.com"
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? 'Enviando...' : 'Enviar Enlace'}
      </button>

      <div className="auth-links">
        <button
          type="button"
          onClick={onBackToLogin}
          className="link-button"
        >
          Volver al inicio de sesión
        </button>
      </div>
    </form>
  );
}
