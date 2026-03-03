import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from './config/firebase';
import useAuthStore from './store/authStore';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import OrderDetailPage from './pages/OrderDetailPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';

export default function App() {
  const { setAuth, setAuthLoading, clearAuth } = useAuthStore();

  useEffect(() => {
    // Listen for Firebase Auth state changes globally
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Bypass DB validation on initial load for speed, store firebase user.
        // We pass null for the DB user to immediately unlock ProtectedRoutes.
        setAuth(firebaseUser, null);
      } else {
        clearAuth();
      }
      setAuthLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [setAuth, clearAuth, setAuthLoading]);

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-[#F5F5DC]">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<OrderHistoryPage />} />
              <Route path="/order/:id" element={<OrderDetailPage />} />
              <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
            </Route>

            {/* Fallback 404 Route */}
            <Route
              path="*"
              element={
                <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
                  <h1 className="text-8xl font-black text-[#800000] mb-6 tracking-tighter drop-shadow-md">
                    404
                  </h1>
                  <p className="text-2xl text-gray-900 font-black mb-8 uppercase tracking-widest">
                    Out of Bounds
                  </p>
                  <p className="text-gray-500 font-medium mb-10 max-w-md">
                    The page you are looking for has been moved, removed, or never existed in the first place.
                  </p>
                  <a
                    href="/"
                    className="inline-flex items-center justify-center px-8 py-4 bg-[#800000] hover:bg-[#600000] text-white font-black rounded-xl transition-all hover:scale-105 shadow-xl uppercase tracking-wider"
                  >
                    Back to Headquarters
                  </a>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
