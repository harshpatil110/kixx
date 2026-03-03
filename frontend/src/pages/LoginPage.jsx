import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { syncUserWithBackend } from '../services/authService';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../store/authStore';

// We assume googleProvider is either exported from config or we instantiate it here.
const googleProvider = new GoogleAuthProvider();

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [isFirebaseLoading, setIsFirebaseLoading] = useState(false);

    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    // Mutation to sync user with our backend
    const syncMutation = useMutation({
        mutationFn: syncUserWithBackend,
        onSuccess: (data) => {
            // Assuming backend returns { user: { ...dbUser } }
            setAuth(auth.currentUser, data.user);
            navigate('/');
        },
        onError: (err) => {
            console.error('Error syncing user to backend:', err);
            setErrorMsg('Failed to sync authentication with the server.');
            setIsFirebaseLoading(false);
        }
    });

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setErrorMsg(null);
        setIsFirebaseLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Firebase succeeded, trigger sync
            syncMutation.mutate();
        } catch (error) {
            console.error('Login error:', error);
            setIsFirebaseLoading(false);

            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/invalid-credential':
                case 'auth/wrong-password':
                    setErrorMsg('Invalid email or password.');
                    break;
                case 'auth/too-many-requests':
                    setErrorMsg('Too many unsuccessful login attempts. Please try again later.');
                    break;
                default:
                    setErrorMsg('An error occurred during login. Please try again.');
            }
        }
    };

    const handleGoogleLogin = async () => {
        setErrorMsg(null);
        setIsFirebaseLoading(true);

        try {
            await signInWithPopup(auth, googleProvider);
            // Firebase succeeded, trigger sync
            syncMutation.mutate();
        } catch (error) {
            console.error('Google login error:', error);
            setIsFirebaseLoading(false);

            if (error.code !== 'auth/popup-closed-by-user') {
                setErrorMsg('Failed to sign in with Google.');
            }
        }
    };

    const isLoading = isFirebaseLoading || syncMutation.isPending;

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F5DC] px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
                    <p className="text-gray-600">Enter your details to access your KIXX account</p>
                </div>

                {errorMsg && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
                        <p className="text-sm text-red-700 font-medium">{errorMsg}</p>
                    </div>
                )}

                <form onSubmit={handleEmailLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                            Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="pl-10 block w-full rounded-md border-gray-300 bg-gray-50 focus:bg-white border focus:border-[#800000] focus:ring-[#800000] sm:text-sm py-3 transition-colors outline-none"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="pl-10 pr-10 block w-full rounded-md border-gray-300 bg-gray-50 focus:bg-white border focus:border-[#800000] focus:ring-[#800000] sm:text-sm py-3 transition-colors outline-none"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                ) : (
                                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center text-sm">
                        <a href="#" className="font-medium text-[#800000] hover:text-[#600000] transition-colors">
                            Forgot your password?
                        </a>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#800000] hover:bg-[#600000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#800000] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin h-5 w-5 mr-2" />
                        ) : null}
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <button
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#800000] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Google
                        </button>
                    </div>
                </div>

                <p className="mt-8 text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-medium text-[#800000] hover:text-[#600000] transition-colors">
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    );
}
