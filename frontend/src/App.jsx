import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from './config/firebase';
import useAuthStore from './store/authStore';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import {
  HomePageSkeleton,
  ProductDetailSkeleton,
  GenericPageSkeleton,
  ListPageSkeleton,
} from './components/PageSkeleton';

import { Toaster } from 'react-hot-toast';

// ---------------------------------------------------------------------------
// Route-Based Code Splitting via React.lazy()
// ---------------------------------------------------------------------------

// ── Public / marketing pages ──
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

// ── Shopping ──
const CatalogPage = lazy(() => import('./pages/CatalogPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));

// ── Post-order (protected) ──
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
const OrderHistoryPage = lazy(() => import('./pages/OrderHistoryPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage'));

// ── Account ──
const AccountPage = lazy(() => import('./pages/AccountPage'));

// ── Admin ──
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const InventoryPage = lazy(() => import('./pages/admin/InventoryPage'));
const SalesPage = lazy(() => import('./pages/admin/SalesPage'));
const CustomersPage = lazy(() => import('./pages/admin/CustomersPage'));

// ── Features ──
const OutfitCheckerPage = lazy(() => import('./pages/OutfitCheckerPage'));
const Archive3DPage = lazy(() => import('./pages/Archive3DPage'));
// ---------------------------------------------------------------------------
// Layout component — wraps all routes that need the Navbar
// ---------------------------------------------------------------------------
function NavbarLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5DC]">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 404 fallback
// ---------------------------------------------------------------------------
function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-8xl font-black text-[#800000] mb-6 tracking-tighter drop-shadow-md">
        404
      </h1>
      <p className="text-2xl text-gray-900 font-black mb-8 uppercase tracking-widest">
        Out of Bounds
      </p>
      <p className="text-gray-500 font-medium mb-10 max-w-md">
        The page you are looking for has been moved, removed,
        or never existed in the first place.
      </p>
      <a
        href="/"
        className="inline-flex items-center justify-center px-8 py-4
                           bg-[#800000] hover:bg-[#600000] text-white font-black
                           rounded-xl transition-all hover:scale-105 shadow-xl
                           uppercase tracking-wider"
      >
        Back to Headquarters
      </a>
    </div>
  );
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
export default function App() {
  const { setAuth, setAuthLoading, clearAuth } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Immediately mark as authenticated so protected routes don't flash
        setAuth(firebaseUser, null);
        // Sync with backend to restore DB user (including role)
        try {
          const { syncUserWithBackend } = await import('./services/authService');
          const data = await syncUserWithBackend();
          setAuth(firebaseUser, data.user);
        } catch (err) {
          console.warn('Backend sync on refresh failed:', err.message);
          // Keep firebaseUser auth — role just won't be set
        }
      } else {
        clearAuth();
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [setAuth, clearAuth, setAuthLoading]);

  return (
    <BrowserRouter>
      <Toaster position="bottom-right" />
      <Routes>

        {/* ── Landing page — full-screen, NO Navbar ─────────────── */}
        <Route
          path="/"
          element={
            <Suspense fallback={<HomePageSkeleton />}>
              <LandingPage />
            </Suspense>
          }
        />

        {/* ── Admin Dashboard (Protected by AdminRoute) ─────────── */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route element={
            <Suspense fallback={<GenericPageSkeleton />}>
              <AdminLayout />
            </Suspense>
          }>
            <Route path="dashboard" element={
              <Suspense fallback={<GenericPageSkeleton />}>
                <DashboardPage />
              </Suspense>
            } />
            <Route path="inventory" element={
              <Suspense fallback={<GenericPageSkeleton />}>
                <InventoryPage />
              </Suspense>
            } />
            <Route path="sales" element={
              <Suspense fallback={<GenericPageSkeleton />}>
                <SalesPage />
              </Suspense>
            } />
            <Route path="customers" element={
              <Suspense fallback={<GenericPageSkeleton />}>
                <CustomersPage />
              </Suspense>
            } />
          </Route>
        </Route>

        {/* ── Pages with their OWN custom nav (no global Navbar) ── */}
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
            path="/account"
            element={
              <Suspense fallback={<GenericPageSkeleton />}>
                <AccountPage />
              </Suspense>
            }
          />
          <Route
            path="/payment"
            element={
              <Suspense fallback={<GenericPageSkeleton />}>
                <PaymentPage />
              </Suspense>
            }
          />
        </Route>

        {/* ── All pages that share the Navbar layout ─────────────── */}
        <Route element={<NavbarLayout />}>

          {/* Public */}
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
            path="/outfit-checker"
            element={
              <Suspense fallback={<GenericPageSkeleton />}>
                <OutfitCheckerPage />
              </Suspense>
            }
          />
          <Route
            path="/3d-archive"
            element={
              <Suspense fallback={<GenericPageSkeleton />}>
                <Archive3DPage />
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

          {/* Protected — must be authenticated */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/catalog"
              element={
                <Suspense fallback={<HomePageSkeleton />}>
                  <CatalogPage />
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

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
