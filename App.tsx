
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AppShell } from './components/AppShell';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';

// Wrapper for pages that need the standard layout (Header/Footer)
const LayoutRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AppShell>{children}</AppShell>
);

const App: React.FC = () => {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LayoutRoute><HomePage /></LayoutRoute>} />
          <Route path="/shop" element={<LayoutRoute><ShopPage /></LayoutRoute>} />
          <Route path="/product/:sku" element={<LayoutRoute><ProductDetailPage /></LayoutRoute>} />
          {/* Checkout has its own specific layout within the component or can use AppShell if desired, 
              but usually checkout has a simplified header. 
              The requested design implies a full page. 
              We will NOT wrap CheckoutPage in AppShell to give it the "clean" checkout look, 
              or we can minimal wrap it. For now, standalone as per typical checkout flows. */}
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </CartProvider>
  );
};

export default App;
