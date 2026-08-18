/**
 * Página de autenticación.
 * Muestra login, registro, reset de contraseña según el estado.
 * Responsive móvil primero (iPhone SE 2020).
 * Accesible, es-CO, sin textos ingleses visibles.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { selectIsAuthenticated } from '../store/authSlice';
import { LoginForm } from '../components/LoginForm';
import { RegisterForm } from '../components/RegisterForm';
import { PasswordResetRequestForm } from '../components/PasswordResetRequestForm';

type AuthView = 'login' | 'register' | 'reset-request';

export function AuthPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [view, setView] = useState<AuthView>('login');

  // Si ya está autenticado, redirigir al inicio
  if (isAuthenticated) {
    navigate('/');
    return null;
  }

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
