import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import useAuthStore from '../store/authStore';

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, isAuthLoading } = useAuthStore();

    if (isAuthLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F5F5DC]">
                <div className="flex flex-col items-center">
                    <Loader2 className="animate-spin h-10 w-10 text-[#800000] mb-4" />
                    <p className="text-gray-600 font-medium">Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children ? children : <Outlet />;
}
