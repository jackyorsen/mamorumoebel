import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AppShell } from './components/AppShell';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { CategoryPage } from './pages/CategoryPage';

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
          
          {/* New Category Route */}
          <Route path="/kategorie/:slug" element={<LayoutRoute><CategoryPage /></LayoutRoute>} />
          
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </CartProvider>
  );
};

export default App;
