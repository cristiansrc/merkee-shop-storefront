/**
 * Página de detalle de pedido.
 * Solo lectura.
 * Responsive móvil primero (iPhone SE 2020).
 * Accesible, es-CO, sin textos ingleses visibles.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { selectIsAuthenticated } from '../store/authSlice';
import { OrderDetail } from '../components/OrderDetail';

export function OrderDetailPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="order-detail-page">
      <OrderDetail />
    </div>
  );
}
