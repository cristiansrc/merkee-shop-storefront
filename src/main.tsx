/**
 * Punto de entrada de la aplicación.
 * Renderiza el componente raíz de React.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { store } from './store';
import { refreshUser } from './store/authSlice';
import './styles/index.css';

// Arranque: restaurar sesión con refresh silencioso (cookie HttpOnly).
// Si no hay cookie de refresh válida, la sesión permanece como guest.
store.dispatch(refreshUser());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
