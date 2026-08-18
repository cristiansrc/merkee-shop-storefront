/**
 * Layout principal del storefront.
 * Estructura responsive: header + contenido + footer.
 * Incluye el panel lateral del carrito.
 */

import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { CartPanel } from './CartPanel';
import { useAppDispatch } from '../store/hooks';
import { loadCart } from '../store/cartSlice';

export function Layout() {
  const dispatch = useAppDispatch();

  // Cargar carrito al montar el layout
  useEffect(() => {
    dispatch(loadCart());
  }, [dispatch]);

  return (
    <div className="layout">
      <Header />
      <main className="layout__main">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="footer__container">
          <p className="footer__text">
            © {new Date().getFullYear()} merkee.shop — Tu supermercado digital
          </p>
          <p className="footer__text footer__text--small">
            Todos los precios incluyen IVA cuando aplica. Envío: $5.000 COP.
          </p>
        </div>
      </footer>
      <CartPanel />
    </div>
  );
}
