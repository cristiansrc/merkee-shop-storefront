/**
 * Página de perfil de usuario.
 * Muestra perfil y cambio de contraseña.
 * Responsive móvil primero (iPhone SE 2020).
 * Accesible, es-CO, sin textos ingleses visibles.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectIsAuthenticated, selectMustChangePassword, logoutUser } from '../store/authSlice';
import { selectProfile } from '../store/profileSlice';
import { ProfileForm } from '../components/ProfileForm';
import { PasswordChangeForm } from '../components/PasswordChangeForm';

export function ProfilePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const mustChangePassword = useAppSelector(selectMustChangePassword);
  const user = useAppSelector(selectProfile);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Cargar perfil si no está cargado
    if (isAuthenticated && !user) {
      // El perfil se carga automáticamente al autenticarse
    }
  }, [isAuthenticated, user]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="profile-page">
      <h1>Mi Cuenta</h1>

      {mustChangePassword && (
        <div className="password-change-required" role="alert">
          <p>Debes cambiar tu contraseña antes de continuar.</p>
          <PasswordChangeForm />
        </div>
      )}

      {!mustChangePassword && (
        <>
          <ProfileForm />
          <PasswordChangeForm />
        </>
      )}

      <div className="profile-actions">
        <button onClick={handleLogout} className="btn-secondary">
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
