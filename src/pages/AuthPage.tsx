/**
 * Página de autenticación.
 * Muestra login, registro, reset de contraseña según el query param `view`.
 * La vista se sincroniza con la URL: ?view=login | ?view=register | ?view=reset-request
 * Responsive móvil primero (iPhone SE 2020).
 * Accesible, es-CO, sin textos ingleses visibles.
 */

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { selectIsAuthenticated } from '../store/authSlice';
import { LoginForm } from '../components/LoginForm';
import { RegisterForm } from '../components/RegisterForm';
import { PasswordResetRequestForm } from '../components/PasswordResetRequestForm';

type AuthView = 'login' | 'register' | 'reset-request';

const VALID_VIEWS: AuthView[] = ['login', 'register', 'reset-request'];

function parseView(value: string | null): AuthView {
  if (value && VALID_VIEWS.includes(value as AuthView)) {
    return value as AuthView;
  }
  return 'login';
}

export function AuthPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const view = parseView(searchParams.get('view'));

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null;
  }

  const setView = (next: AuthView) => {
    setSearchParams({ view: next }, { replace: true });
  };

  const handleSuccess = () => {
    navigate('/');
  };

  return (
    <div className="auth-page">
      {view === 'login' && (
        <LoginForm
          onSuccess={handleSuccess}
          onRegisterClick={() => setView('register')}
          onForgotPasswordClick={() => setView('reset-request')}
        />
      )}

      {view === 'register' && (
        <RegisterForm
          onSuccess={handleSuccess}
          onLoginClick={() => setView('login')}
        />
      )}

      {view === 'reset-request' && (
        <PasswordResetRequestForm
          onBackToLogin={() => setView('login')}
        />
      )}
    </div>
  );
}
