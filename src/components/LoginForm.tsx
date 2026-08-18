/**
 * Formulario de inicio de sesión.
 * Responsive móvil primero (iPhone SE 2020).
 * Accesible, es-CO, sin textos ingleses visibles.
 */

import { useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import { loginUser } from '../store/authSlice';

interface LoginFormProps {
  onSuccess?: () => void;
  onRegisterClick?: () => void;
  onForgotPasswordClick?: () => void;
}

export function LoginForm({ onSuccess, onRegisterClick, onForgotPasswordClick }: LoginFormProps) {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await dispatch(loginUser({ email, password })).unwrap();
      onSuccess?.();
    } catch (err) {
      setError(err as string);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form" aria-label="Formulario de inicio de sesión">
      <h2>Iniciar Sesión</h2>

      {error && (
        <div className="form-error" role="alert" aria-live="polite">
          {error}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="login-email">Correo electrónico</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="tu@ejemplo.com"
          aria-describedby={error ? 'login-error' : undefined}
        />
      </div>

      <div className="form-group">
        <label htmlFor="login-password">Contraseña</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          placeholder="Mínimo 12 caracteres"
          minLength={12}
          aria-describedby={error ? 'login-error' : undefined}
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? 'Ingresando...' : 'Iniciar Sesión'}
      </button>

      <div className="auth-links">
        <button
          type="button"
          onClick={onForgotPasswordClick}
          className="link-button"
        >
          ¿Olvidaste tu contraseña?
        </button>
        <button
          type="button"
          onClick={onRegisterClick}
          className="link-button"
        >
          Crear una cuenta
        </button>
      </div>
    </form>
  );
}
