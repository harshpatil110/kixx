import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { syncUserWithBackend } from '../services/authService';
import { Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react';
import useAuthStore from '../store/authStore';

const googleProvider = new GoogleAuthProvider();

// ─── Google "G" icon ──────────────────────────────────────────────────────────
function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    );
}

// ─── Floating label input ─────────────────────────────────────────────────────
function FloatingInput({ id, label, type, value, onChange, required, rightSlot }) {
    return (
        <div className="relative group">
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                required={required}
                placeholder=" "
                className="peer block w-full bg-transparent border-0 border-b-2 border-gray-200
                           focus:border-[#800000] focus:ring-0 outline-none
                           pt-6 pb-2 text-[#111] text-base font-medium
                           placeholder-transparent transition-colors duration-300
                           pr-10"
            />
            <label
                htmlFor={id}
                className="absolute left-0 top-2 text-xs font-black tracking-widest uppercase
                           text-gray-400 peer-focus:text-[#800000]
                           peer-placeholder-shown:top-5 peer-placeholder-shown:text-base
                           peer-placeholder-shown:font-medium peer-placeholder-shown:tracking-normal
                           peer-placeholder-shown:normal-case peer-placeholder-shown:text-gray-400
                           transition-all duration-300 pointer-events-none"
            >
                {label}
            </label>
            {rightSlot && (
                <div className="absolute right-0 bottom-2.5">{rightSlot}</div>
            )}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LoginPage() {
    // ── Guest guard: kick authenticated users back to the catalog ─────────────
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    if (isAuthenticated) return <Navigate to="/catalog" replace />;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [isFirebaseLoading, setFbLoad] = useState(false);
    const [loginRole, setLoginRole] = useState('customer');

    const navigate = useNavigate();
    const setAuth = useAuthStore((s) => s.setAuth);

    // Backend sync mutation
    const syncMutation = useMutation({
        mutationFn: syncUserWithBackend,
        onSuccess: (data) => {
            setAuth(auth.currentUser, data.user);
            if (data.user?.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/catalog');
            }
        },
        onError: (err) => {
            console.error('Backend sync error:', err);
            setErrorMsg('Failed to sync with the server. Please try again.');
            setFbLoad(false);
        },
    });

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setErrorMsg(null);
        setFbLoad(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            syncMutation.mutate();
        } catch (err) {
            setFbLoad(false);
            const msgs = {
                'auth/user-not-found': 'Invalid email or password.',
                'auth/wrong-password': 'Invalid email or password.',
                'auth/invalid-credential': 'Invalid email or password.',
                'auth/too-many-requests': 'Too many attempts. Try again later.',
            };
            setErrorMsg(msgs[err.code] || 'Login failed. Please try again.');
        }
    };

    const handleGoogleLogin = async () => {
        setErrorMsg(null);
        setFbLoad(true);
        try {
            await signInWithPopup(auth, googleProvider);
            syncMutation.mutate();
        } catch (err) {
            setFbLoad(false);
            if (err.code !== 'auth/popup-closed-by-user') {
                setErrorMsg('Google sign-in failed. Please try again.');
            }
        }
    };

    const isLoading = isFirebaseLoading || syncMutation.isPending;

    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">

            {/* ── LEFT PANEL — Visual ─────────────────────────────────────── */}
            <div className="relative hidden md:block overflow-hidden">
                {/* Lifestyle sneaker image */}
                <img
                    src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=80"
                    alt="Premium sneaker lifestyle"
                    className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/50 to-black/20" />

                {/* Content on top of image */}
                <div className="relative z-10 h-full flex flex-col justify-between p-12">

                    {/* KIXX wordmark */}
                    <Link
                        to="/"
                        className="font-black text-white leading-none tracking-tighter"
                        style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', letterSpacing: '-0.04em' }}
                    >
                        KIXX
                    </Link>

                    {/* Pull quote */}
                    <div>
                        <blockquote
                            className="font-black uppercase text-white leading-none tracking-tighter mb-6"
                            style={{ fontSize: 'clamp(2rem, 3.5vw, 3.2rem)', letterSpacing: '-0.03em' }}
                        >
                            "Your next<br />pair is<br />waiting."
                        </blockquote>
                        <p className="text-white/50 text-sm font-medium tracking-wider uppercase">
                            KIXX × Nike × Exclusive 2025
                        </p>
                    </div>
                </div>
            </div>

            {/* ── RIGHT PANEL — Form ──────────────────────────────────────── */}
            <div className="flex flex-col justify-center bg-[#F5F5DC] px-8 sm:px-16 py-16">
                <div className="max-w-sm w-full mx-auto">

                    {/* Mobile logo */}
                    <Link
                        to="/"
                        className="md:hidden block font-black tracking-tighter text-[#800000] mb-10"
                        style={{ fontSize: '2.5rem', letterSpacing: '-0.04em' }}
                    >
                        KIXX
                    </Link>

                    {/* Heading */}
                    <h1 className="font-black text-[#111] uppercase tracking-tighter mb-2"
                        style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', letterSpacing: '-0.03em' }}>
                        Welcome Back
                    </h1>
                    <p className="text-gray-500 font-medium mb-10 text-sm">
                        Sign in to access your drops and orders.
                    </p>

                    {/* Error banner */}
                    {errorMsg && (
                        <div className="mb-8 px-4 py-3 bg-red-50 border-l-4 border-[#800000] rounded-md">
                            <p className="text-sm text-[#800000] font-bold">{errorMsg}</p>
                        </div>
                    )}

                    {/* Google button */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 py-3.5 px-4
                                   border-2 border-gray-200 hover:border-[#111] rounded-full
                                   bg-white text-[#111] text-sm font-black uppercase tracking-widest
                                   transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed
                                   shadow-sm hover:shadow-md mb-8"
                    >
                        <GoogleIcon />
                        Continue with Google
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-gray-400 text-xs font-bold tracking-widest uppercase">or</span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {/* ── Role Toggle (Portfolio) ── */}
                    <div className="flex p-1 bg-gray-100 rounded-full mb-6 w-full max-w-sm mx-auto">
                        <div
                            onClick={() => {
                                setLoginRole('customer');
                                setEmail('');
                                setPassword('');
                            }}
                            className={`flex-1 py-2 text-sm font-bold rounded-full transition-all text-center cursor-pointer ${
                                loginRole === 'customer'
                                    ? 'bg-white shadow-sm text-[#800000]'
                                    : 'text-gray-500 hover:text-black'
                            }`}
                        >
                            Customer
                        </div>
                        <div
                            onClick={() => {
                                setLoginRole('admin');
                                setEmail('admin@kixx.com');
                                setPassword('admin123');
                            }}
                            className={`flex-1 py-2 text-sm font-bold rounded-full transition-all text-center cursor-pointer ${
                                loginRole === 'admin'
                                    ? 'bg-white shadow-sm text-[#800000]'
                                    : 'text-gray-500 hover:text-black'
                            }`}
                        >
                            Admin
                        </div>
                    </div>

                    {/* Email / password form */}
                    <form onSubmit={handleEmailLogin} className="space-y-8">
                        <FloatingInput
                            id="email"
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <FloatingInput
                            id="password"
                            label="Password"
                            type={showPw ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            rightSlot={
                                <button
                                    type="button"
                                    onClick={() => setShowPw((v) => !v)}
                                    className="text-gray-400 hover:text-[#111] transition-colors"
                                    aria-label={showPw ? 'Hide password' : 'Show password'}
                                >
                                    {showPw
                                        ? <EyeOff className="h-4 w-4" />
                                        : <Eye className="h-4 w-4" />}
                                </button>
                            }
                        />

                        <div className="flex justify-end">
                            <a href="#"
                                className="text-xs font-black tracking-widest uppercase text-gray-400 hover:text-[#800000] transition-colors">
                                Forgot Password?
                            </a>
                        </div>

                        {/* Submit */}
                        <button
                            id="login-submit-btn"
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3
                                       bg-[#800000] hover:bg-[#600000] disabled:opacity-60
                                       text-white font-black uppercase tracking-widest
                                       rounded-full py-4 text-sm
                                       transition-all duration-300 shadow-lg hover:shadow-xl
                                       hover:scale-[1.02] active:scale-100
                                       disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Register link */}
                    <p className="mt-10 text-center text-sm text-gray-500 font-medium">
                        New to KIXX?{' '}
                        <Link
                            to="/register"
                            className="font-black text-[#800000] hover:text-[#600000] transition-colors uppercase tracking-wider text-xs"
                        >
                            Create Account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
