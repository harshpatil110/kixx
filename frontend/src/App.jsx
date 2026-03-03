import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from './config/firebase';
import useAuthStore from './store/authStore';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import {
  HomePageSkeleton,
  ProductDetailSkeleton,
  GenericPageSkeleton,
  ListPageSkeleton,
} from './components/PageSkeleton';

import { Toaster } from 'react-hot-toast';

// ---------------------------------------------------------------------------
// Route-Based Code Splitting via React.lazy()
// Each page becomes its own JS chunk — only downloaded when the user
// navigates to that route, dramatically reducing the initial bundle size.
// ---------------------------------------------------------------------------

// Critical path (likely first visit) — split but kept together
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));

// Auth pages — only needed when not logged in
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

// Cart (public but rarely the entry point)
const CartPage = lazy(() => import('./pages/CartPage'));

// Protected / post-order pages — lowest priority
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderHistoryPage = lazy(() => import('./pages/OrderHistoryPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage'));

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
      <Toaster position="bottom-right" />
      <div className="flex flex-col min-h-screen bg-[#F5F5DC]">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <Suspense fallback={<HomePageSkeleton />}>
                  <HomePage />
                </Suspense>
              }
            />
            <Route
              path="/login"
              element={
                <Suspense fallback={<GenericPageSkeleton />}>
                  <LoginPage />
                </Suspense>
              }
            />
            <Route
              path="/register"
              element={
                <Suspense fallback={<GenericPageSkeleton />}>
                  <RegisterPage />
                </Suspense>
              }
            />
            <Route
              path="/product/:id"
              element={
                <Suspense fallback={<ProductDetailSkeleton />}>
                  <ProductDetailPage />
                </Suspense>
              }
            />
            <Route
              path="/cart"
              element={
                <Suspense fallback={<ListPageSkeleton />}>
                  <CartPage />
                </Suspense>
              }
            />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route
                path="/checkout"
                element={
                  <Suspense fallback={<GenericPageSkeleton />}>
                    <CheckoutPage />
                  </Suspense>
                }
              />
              <Route
                path="/orders"
                element={
                  <Suspense fallback={<ListPageSkeleton />}>
                    <OrderHistoryPage />
                  </Suspense>
                }
              />
              <Route
                path="/order/:id"
                element={
                  <Suspense fallback={<ListPageSkeleton />}>
                    <OrderDetailPage />
                  </Suspense>
                }
              />
              <Route
                path="/order-confirmation/:id"
                element={
                  <Suspense fallback={<GenericPageSkeleton />}>
                    <OrderConfirmationPage />
                  </Suspense>
                }
              />
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
