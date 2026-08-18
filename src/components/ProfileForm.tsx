/**
 * Formulario de perfil de usuario.
 * Permite editar display_name y phone.
 * Responsive móvil primero (iPhone SE 2020).
 * Accesible, es-CO, sin textos ingleses visibles.
 */

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateProfile, clearSuccessMessage, selectProfileLoading, selectProfileError, selectProfileSuccess } from '../store/profileSlice';
import { selectCurrentUser } from '../store/authSlice';

export function ProfileForm() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const loading = useAppSelector(selectProfileLoading);
  const error = useAppSelector(selectProfileError);
  const success = useAppSelector(selectProfileSuccess);

  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name);
      setPhone(user.phone || '');
    }
  }, [user]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(updateProfile({ display_name: displayName, phone: phone || null }));
  };

  if (!user) return null;

  return (
    <form onSubmit={handleSubmit} className="profile-form" aria-label="Formulario de perfil">
      <h2>Mi Perfil</h2>

      {error && (
        <div className="form-error" role="alert" aria-live="polite">
          {error}
        </div>
      )}

      {success && (
        <div className="form-success" role="status" aria-live="polite">
          {success}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="profile-email">Correo electrónico</label>
        <input
          id="profile-email"
          type="email"
          value={user.email}
          disabled
          aria-describedby="email-hint"
        />
        <small id="email-hint" className="form-hint">
          El correo no se puede modificar
        </small>
      </div>

      <div className="form-group">
        <label htmlFor="profile-role">Rol</label>
        <input
          id="profile-role"
          type="text"
          value={user.role === 'admin' ? 'Administrador' : 'Cliente'}
          disabled
        />
      </div>

      <div className="form-group">
        <label htmlFor="profile-name">Nombre visible</label>
        <input
          id="profile-name"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          minLength={2}
          maxLength={100}
          autoComplete="name"
        />
      </div>

      <div className="form-group">
        <label htmlFor="profile-phone">Teléfono</label>
        <input
          id="profile-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          maxLength={30}
          autoComplete="tel"
          placeholder="Opcional"
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? 'Guardando...' : 'Guardar Cambios'}
      </button>
    </form>
  );
}
