import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Loader2 } from 'lucide-react';

export default function AdminRoute() {
    const { isAuthenticated, userRole, isAuthLoading } = useAuthStore();

    if (isAuthLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F7F5F0]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-900 animate-pulse">
                    Re-authenticating...
                </p>
            </div>
        );
    }

    if (!isAuthenticated || userRole !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
