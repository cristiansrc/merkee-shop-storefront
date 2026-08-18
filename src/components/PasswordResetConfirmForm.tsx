/**
 * Formulario de confirmación de restablecimiento de contraseña.
 * Consume token de un solo uso.
 * Responsive móvil primero (iPhone SE 2020).
 * Accesible, es-CO, sin textos ingleses visibles.
 */

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { confirmPasswordReset, selectProfileLoading, selectProfileError, selectProfileSuccess } from '../store/profileSlice';

interface PasswordResetConfirmFormProps {
  token: string;
  onSuccess?: () => void;
}

export function PasswordResetConfirmForm({ token, onSuccess }: PasswordResetConfirmFormProps) {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectProfileLoading);
  const error = useAppSelector(selectProfileError);
  const success = useAppSelector(selectProfileSuccess);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return;
    }

    if (newPassword.length < 12) {
      return;
    }

    try {
      await dispatch(confirmPasswordReset({ token, new_password: newPassword })).unwrap();
      onSuccess?.();
    } catch {
      // Error manejado por el slice
    }
  };

  if (success) {
    return (
      <div className="auth-form" role="status" aria-live="polite">
        <h2>Contraseña Restablecida</h2>
        <p>Tu contraseña ha sido restablecida correctamente.</p>
        <button onClick={onSuccess} className="btn-primary">
          Iniciar Sesión
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form" aria-label="Formulario de nueva contraseña">
      <h2>Nueva Contraseña</h2>

      {error && (
        <div className="form-error" role="alert" aria-live="polite">
          {error}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="reset-new-password">Nueva contraseña</label>
        <input
          id="reset-new-password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={12}
          maxLength={128}
          autoComplete="new-password"
          placeholder="Mínimo 12 caracteres"
        />
      </div>

      <div className="form-group">
        <label htmlFor="reset-confirm-password">Confirmar contraseña</label>
        <input
          id="reset-confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={12}
          maxLength={128}
          autoComplete="new-password"
          placeholder="Repite tu contraseña"
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
      </button>
    </form>
  );
}
