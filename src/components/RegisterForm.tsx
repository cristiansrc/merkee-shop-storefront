/**
 * Formulario de registro de cliente.
 * Responsive móvil primero (iPhone SE 2020).
 * Accesible, es-CO, sin textos ingleses visibles.
 */

import { useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import { registerUser } from '../store/authSlice';

interface RegisterFormProps {
  onSuccess?: () => void;
  onLoginClick?: () => void;
}

export function RegisterForm({ onSuccess, onLoginClick }: RegisterFormProps) {
  const dispatch = useAppDispatch();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 12) {
      setError('La contraseña debe tener al menos 12 caracteres');
      return;
    }

    setLoading(true);

    try {
      await dispatch(registerUser({ display_name: displayName, email, password })).unwrap();
      onSuccess?.();
    } catch (err) {
      setError(err as string);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form" aria-label="Formulario de registro">
      <h2>Crear Cuenta</h2>

      {error && (
        <div className="form-error" role="alert" aria-live="polite">
          {error}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="register-name">Nombre visible</label>
        <input
          id="register-name"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          minLength={2}
          maxLength={100}
          autoComplete="name"
          placeholder="Tu nombre"
        />
      </div>

      <div className="form-group">
        <label htmlFor="register-email">Correo electrónico</label>
        <input
          id="register-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="tu@ejemplo.com"
        />
      </div>

      <div className="form-group">
        <label htmlFor="register-password">Contraseña</label>
        <input
          id="register-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={12}
          maxLength={128}
          autoComplete="new-password"
          placeholder="Mínimo 12 caracteres"
        />
      </div>

      <div className="form-group">
        <label htmlFor="register-confirm">Confirmar contraseña</label>
        <input
          id="register-confirm"
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
        {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
      </button>

      <div className="auth-links">
        <button
          type="button"
          onClick={onLoginClick}
          className="link-button"
        >
          ¿Ya tienes cuenta? Inicia sesión
        </button>
      </div>
    </form>
  );
}
