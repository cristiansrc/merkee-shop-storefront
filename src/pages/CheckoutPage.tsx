/**
 * Página de checkout en 5 pasos.
 * Pasos: carrito, autenticación, dirección, proveedor, confirmación/estado.
 * Responsive móvil primero (iPhone SE 2020).
 * Accesible, es-CO, sin textos ingleses visibles.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectIsAuthenticated } from '../store/authSlice';
import { selectCartItems, loadCart } from '../store/cartSlice';
import { selectCheckoutStep, setCheckoutStep, selectCheckoutError } from '../store/checkoutSlice';
import { CheckoutSteps } from '../components/CheckoutSteps';
import { CartSummary } from '../components/CartSummary';
import { LoginForm } from '../components/LoginForm';
import { DeliveryAddressForm } from '../components/DeliveryAddressForm';
import { PaymentProviderSelect } from '../components/PaymentProviderSelect';
import { CheckoutConfirmation } from '../components/CheckoutConfirmation';

export function CheckoutPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentStep = useAppSelector(selectCheckoutStep);
  const cartItems = useAppSelector(selectCartItems);
  const error = useAppSelector(selectCheckoutError);
  const cartLoading = useAppSelector((state) => state.cart.loading);
  const cartData = useAppSelector((state) => state.cart.data);

  // Cargar carrito al montar
  useEffect(() => {
    dispatch(loadCart());
  }, [dispatch]);

  // Redirigir si no hay items en el carrito después de cargar (excepto en confirmación)
  useEffect(() => {
    // No redirigir mientras el carrito está cargando
    if (cartLoading) return;
    
    // Solo redirigir si ya se cargó el carrito y está vacío
    if (currentStep !== 'confirmation' && cartData && cartItems.length === 0) {
      navigate('/productos');
    }
  }, [cartLoading, cartData, cartItems.length, currentStep, navigate]);

  // Avanzar al paso de autenticación si no está autenticado
  useEffect(() => {
    if (currentStep === 'cart' && !isAuthenticated) {
      dispatch(setCheckoutStep('auth'));
    } else if (currentStep === 'auth' && isAuthenticated) {
      dispatch(setCheckoutStep('address'));
    }
  }, [currentStep, isAuthenticated, dispatch]);

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      <CheckoutSteps />

      {error && (
        <div className="checkout-error" role="alert" aria-live="polite">
          {error}
        </div>
      )}

      <div className="checkout-content">
        {currentStep === 'cart' && (
          <CartSummary />
        )}

        {currentStep === 'auth' && (
          <LoginForm
            onSuccess={() => dispatch(setCheckoutStep('address'))}
            onRegisterClick={() => navigate('/auth?view=register')}
          />
        )}

        {currentStep === 'address' && (
          <DeliveryAddressForm />
        )}

        {currentStep === 'provider' && (
          <PaymentProviderSelect />
        )}

        {currentStep === 'confirmation' && (
          <>
            <CheckoutConfirmation />
            <div className="checkout-actions">
              <button onClick={() => navigate('/')} className="btn-secondary">
                Volver al Inicio
              </button>
              <button onClick={() => navigate('/pedidos')} className="btn-secondary">
                Ver Mis Pedidos
              </button>
            </div>
          </>
        )}
      </div>

      {currentStep === 'provider' && (
        <div className="checkout-summary">
          <CartSummary />
        </div>
      )}
    </div>
  );
}
