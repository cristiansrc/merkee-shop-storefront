/**
 * Componente raíz de la aplicación.
 * Configura las rutas del storefront.
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { AuthPage } from './pages/AuthPage';
import { ProfilePage } from './pages/ProfilePage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="categorias" element={<CategoriesPage />} />
            <Route path="productos" element={<ProductsPage />} />
            <Route path="productos/:productId" element={<ProductDetailPage />} />
            <Route path="auth" element={<AuthPage />} />
            <Route path="mi-cuenta" element={<ProfilePage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="pedidos" element={<OrdersPage />} />
            <Route path="pedidos/:orderId" element={<OrderDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}
