import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import useAuthStore from '../store/authStore';

export default function ProtectedRoute({ children }) {
    // ── 1. Read auth state ────────────────────────────────────────────────────
    const isAuthLoading = useAuthStore((s) => s.isAuthLoading);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    // ── 2. While Firebase is still resolving the session, show a blocker ──────
    //       This is the CRITICAL fix for the race condition:
    //       We never evaluate isAuthenticated until Firebase has confirmed
    //       the auth state (i.e., isAuthLoading === false).
    if (isAuthLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5DC] gap-4">
                {/* Wordmark */}
                <span
                    className="font-black text-[#800000] tracking-tighter select-none"
                    style={{ fontSize: '2.5rem', letterSpacing: '-0.04em' }}
                >
                    KIXX
                </span>
                <Loader2 className="animate-spin h-9 w-9 text-[#800000]" />
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">
                    Loading your profile…
                </p>
            </div>
        );
    }

    // ── 3. Auth resolved → redirect guests ───────────────────────────────────
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // ── 4. Authenticated → render the protected content ──────────────────────
    return children ? children : <Outlet />;
}
