/**
 * Header del storefront.
 * Navegación principal, búsqueda y acceso al carrito.
 * Diseño responsive: hamburger en móvil.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setSearchQuery } from '../store/catalogSlice';
import { openCart, selectCartItemCount } from '../store/cartSlice';
import { selectIsAuthenticated, logoutUser } from '../store/authSlice';

export function Header() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const cartItemCount = useAppSelector(selectCartItemCount);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [localSearch, setLocalSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = localSearch.trim();
    if (trimmed.length >= 2) {
      dispatch(setSearchQuery(trimmed));
      navigate(`/productos?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleCartClick = () => {
    dispatch(openCart());
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header__container">
        {/* Logo */}
        <Link to="/" className="header__logo" aria-label="merkee.shop - Inicio">
          <span className="header__logo-text">merkee</span>
          <span className="header__logo-dot">.</span>
          <span className="header__logo-text header__logo-text--shop">shop</span>
        </Link>

        {/* Búsqueda */}
        <form className="header__search" onSubmit={handleSearchSubmit} role="search">
          <input
            type="search"
            className="header__search-input"
            placeholder="Buscar productos..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            minLength={2}
            maxLength={100}
            aria-label="Buscar productos"
          />
          <button
            type="submit"
            className="header__search-button"
            aria-label="Buscar"
          >
            🔍
          </button>
        </form>

        {/* Navegación desktop */}
        <nav className="header__nav" aria-label="Navegación principal">
          <Link to="/" className="header__nav-link">
            Inicio
          </Link>
          <Link to="/categorias" className="header__nav-link">
            Categorías
          </Link>
          <Link to="/productos" className="header__nav-link">
            Productos
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/mi-cuenta" className="header__nav-link header__nav-link--auth">
                Mi cuenta
              </Link>
              <button
                type="button"
                className="header__nav-link header__nav-link--auth"
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link to="/login" className="header__nav-link header__nav-link--auth">
              Iniciar sesión
            </Link>
          )}
        </nav>

        {/* Carrito */}
        <button
          className="header__cart"
          onClick={handleCartClick}
          aria-label={`Carrito de compras, ${cartItemCount} artículos`}
          type="button"
        >
          <span className="header__cart-icon">🛒</span>
          {cartItemCount > 0 && (
            <span className="header__cart-badge">{cartItemCount}</span>
          )}
        </button>

        {/* Menú móvil */}
        <button
          className="header__mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menú de navegación"
          aria-expanded={mobileMenuOpen}
          type="button"
        >
          <span className="header__hamburger" />
        </button>
      </div>

      {/* Menú móvil desplegable */}
      {mobileMenuOpen && (
        <nav className="header__mobile-nav" aria-label="Navegación móvil">
          <Link
            to="/"
            className="header__mobile-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Inicio
          </Link>
          <Link
            to="/categorias"
            className="header__mobile-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Categorías
          </Link>
          <Link
            to="/productos"
            className="header__mobile-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Productos
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/mi-cuenta"
                className="header__mobile-nav-link header__mobile-nav-link--auth"
                onClick={() => setMobileMenuOpen(false)}
              >
                Mi cuenta
              </Link>
              <button
                type="button"
                className="header__mobile-nav-link header__mobile-nav-link--auth"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="header__mobile-nav-link header__mobile-nav-link--auth"
              onClick={() => setMobileMenuOpen(false)}
            >
              Iniciar sesión
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
