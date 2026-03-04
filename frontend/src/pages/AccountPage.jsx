import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import {
    User,
    Package,
    LogOut,
    ChevronRight,
    ShieldCheck,
    Settings,
    Heart,
    Loader2,
} from 'lucide-react';
import { auth } from '../config/firebase';
import useAuthStore from '../store/authStore';

// ─── Sidebar nav item ─────────────────────────────────────────────────────────
function SidebarItem({ icon: Icon, label, description, to, onClick, variant = 'default' }) {
    const base =
        'group flex items-center gap-4 w-full p-4 rounded-2xl border transition-all duration-200 text-left';
    const variants = {
        default: 'bg-white border-gray-100 hover:border-[#800000]/30 hover:shadow-md',
        danger: 'bg-white border-gray-100 hover:border-red-200 hover:bg-red-50',
    };

    const content = (
        <>
            <div
                className={`flex-shrink-0 rounded-xl p-3 transition-colors duration-200 ${variant === 'danger'
                        ? 'bg-red-50 text-red-500 group-hover:bg-red-100'
                        : 'bg-[#F5F5DC] text-[#800000] group-hover:bg-[#800000] group-hover:text-white'
                    }`}
            >
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-grow min-w-0">
                <p className={`font-bold text-sm ${variant === 'danger' ? 'text-red-600' : 'text-[#111]'}`}>
                    {label}
                </p>
                {description && (
                    <p className="text-xs text-gray-400 font-medium mt-0.5 truncate">{description}</p>
                )}
            </div>
            <ChevronRight
                className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-1 ${variant === 'danger' ? 'text-red-300' : 'text-gray-300'
                    }`}
            />
        </>
    );

    if (to) {
        return (
            <Link to={to} className={`${base} ${variants[variant]}`}>
                {content}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className={`${base} ${variants[variant]}`}>
            {content}
        </button>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AccountPage() {
    const [isSigningOut, setIsSigningOut] = useState(false);

    const { user, firebaseUser, clearAuth } = useAuthStore();
    const navigate = useNavigate();

    // Resolve display name and email from whichever source is available
    const displayName = user?.name || firebaseUser?.displayName || 'Sneakerhead';
    const email = user?.email || firebaseUser?.email || '—';
    const initials = displayName
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const handleSignOut = async () => {
        setIsSigningOut(true);
        try {
            await signOut(auth);
            clearAuth();
            navigate('/');
        } catch (err) {
            console.error('Sign-out error:', err);
            setIsSigningOut(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F5DC] py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">

                {/* ── Page header ───────────────────────────────────────────── */}
                <div className="mb-10">
                    <p className="text-xs font-black uppercase tracking-widest text-[#800000] mb-1">
                        Dashboard
                    </p>
                    <h1
                        className="font-black text-[#111] tracking-tighter leading-none"
                        style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', letterSpacing: '-0.03em' }}
                    >
                        Your Account
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── LEFT — Profile card ───────────────────────────────── */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Maroon banner */}
                            <div className="h-24 bg-gradient-to-br from-[#800000] to-[#5a0000]" />

                            {/* Avatar + info */}
                            <div className="px-6 pb-6 -mt-10">
                                <div
                                    className="w-20 h-20 rounded-2xl bg-[#800000] border-4 border-white
                                               flex items-center justify-center shadow-lg mb-4"
                                >
                                    <span className="text-white font-black text-xl tracking-tight">
                                        {initials}
                                    </span>
                                </div>

                                <h2 className="font-black text-[#111] text-lg tracking-tight truncate">
                                    {displayName}
                                </h2>
                                <p className="text-sm text-gray-400 font-medium truncate mt-0.5">
                                    {email}
                                </p>

                                <div className="mt-5 pt-5 border-t border-gray-100 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
                                        Verified Account
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT — Navigation menu ───────────────────────────── */}
                    <div className="lg:col-span-2 flex flex-col gap-3">

                        <SidebarItem
                            icon={Package}
                            label="Order History"
                            description="View and track all your past orders"
                            to="/orders"
                        />

                        <SidebarItem
                            icon={Heart}
                            label="Wishlist"
                            description="Your saved items and favourite drops"
                            to="/catalog"
                        />

                        <SidebarItem
                            icon={Settings}
                            label="Account Settings"
                            description="Manage your profile and preferences"
                            to="/catalog"
                        />

                        {/* Divider */}
                        <div className="h-px bg-gray-200 my-1 rounded-full" />

                        {/* Sign out */}
                        <SidebarItem
                            icon={isSigningOut ? Loader2 : LogOut}
                            label={isSigningOut ? 'Signing Out…' : 'Sign Out'}
                            description="You'll be redirected to the homepage"
                            onClick={!isSigningOut ? handleSignOut : undefined}
                            variant="danger"
                        />
                    </div>
                </div>

                {/* ── Bottom brand tag ──────────────────────────────────────── */}
                <p className="mt-16 text-center text-xs text-gray-400 font-bold tracking-widest uppercase">
                    KIXX © {new Date().getFullYear()} — Sole Culture
                </p>
            </div>
        </div>
    );
}
