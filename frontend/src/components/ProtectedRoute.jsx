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
            <div className="min-h-screen flex items-center justify-center bg-[#F7F5F0]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-900 animate-pulse">
                    Re-authenticating...
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
