/**
 * Formulario de cambio de contraseña.
 * Requiere contraseña actual.
 * Responsive móvil primero (iPhone SE 2020).
 * Accesible, es-CO, sin textos ingleses visibles.
 */

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { changeUserPassword, clearPasswordChangeError, selectPasswordChangeLoading, selectPasswordChangeError } from '../store/profileSlice';

interface PasswordChangeFormProps {
  onSuccess?: () => void;
}

export function PasswordChangeForm({ onSuccess }: PasswordChangeFormProps) {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectPasswordChangeLoading);
  const error = useAppSelector(selectPasswordChangeError);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearPasswordChangeError());

    if (newPassword !== confirmPassword) {
      return;
    }

    if (newPassword.length < 12) {
      return;
    }

    try {
      await dispatch(changeUserPassword({ current_password: currentPassword, new_password: newPassword })).unwrap();
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onSuccess?.();
    } catch (err) {
      // Error manejado por el slice
      void err;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="password-form" aria-label="Formulario de cambio de contraseña">
      <h2>Cambiar Contraseña</h2>

      {error && (
        <div className="form-error" role="alert" aria-live="polite">
          {error}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="current-password">Contraseña actual</label>
        <input
          id="current-password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          autoComplete="current-password"
          minLength={1}
        />
      </div>

      <div className="form-group">
        <label htmlFor="new-password">Nueva contraseña</label>
        <input
          id="new-password"
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
        <label htmlFor="confirm-password">Confirmar nueva contraseña</label>
        <input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={12}
          maxLength={128}
          autoComplete="new-password"
          placeholder="Repite tu nueva contraseña"
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
      </button>
    </form>
  );
}
