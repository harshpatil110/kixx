import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Loader2 } from 'lucide-react';

export default function AdminRoute() {
    const { isAuthenticated, userRole, isAuthLoading } = useAuthStore();

    if (isAuthLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F5F5DC]">
                <Loader2 className="w-8 h-8 animate-spin text-[#800000]" />
            </div>
        );
    }

    if (!isAuthenticated || userRole !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
