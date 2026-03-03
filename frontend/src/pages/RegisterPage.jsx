import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../config/firebase';
import { syncUserWithBackend } from '../services/authService';
import { Loader2, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../store/authStore';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [isFirebaseLoading, setIsFirebaseLoading] = useState(false);

    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    // Mutation to sync user with backend
    const syncMutation = useMutation({
        mutationFn: syncUserWithBackend,
        onSuccess: (data) => {
            // Assuming backend returns { user: { ...dbUser } }
            setAuth(auth.currentUser, data.user);
            navigate('/');
        },
        onError: (err) => {
            console.error('Error syncing user to backend:', err);
            setErrorMsg('Account created, but failed to sync with the server.');
            setIsFirebaseLoading(false);
        }
    });

    const handleRegister = async (e) => {
        e.preventDefault();
        setErrorMsg(null);
        setIsFirebaseLoading(true);

        try {
            // 1. Create the user in Firebase
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // 2. Update their profile with the provided name
            await updateProfile(userCredential.user, { displayName: name });

            // 3. Trigger backend sync mutation
            syncMutation.mutate();
        } catch (error) {
            console.error('Registration error:', error);
            setIsFirebaseLoading(false);

            switch (error.code) {
                case 'auth/email-already-in-use':
                    setErrorMsg('An account with this email address already exists.');
                    break;
                case 'auth/invalid-email':
                    setErrorMsg('Please enter a valid email address.');
                    break;
                case 'auth/weak-password':
                    setErrorMsg('Password must be at least 6 characters long.');
                    break;
                default:
                    setErrorMsg('An error occurred during registration. Please try again.');
            }
        }
    };

    const isLoading = isFirebaseLoading || syncMutation.isPending;

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F5DC] px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
                    <p className="text-gray-600">Join KIXX and step up your shoe game</p>
                </div>

                {errorMsg && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
                        <p className="text-sm text-red-700 font-medium">{errorMsg}</p>
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                            Full Name
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="pl-10 block w-full rounded-md border-gray-300 bg-gray-50 focus:bg-white border focus:border-[#800000] focus:ring-[#800000] sm:text-sm py-3 transition-colors outline-none"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>

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

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#800000] hover:bg-[#600000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#800000] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin h-5 w-5 mr-2" />
                        ) : null}
                        {isLoading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-[#800000] hover:text-[#600000] transition-colors">
                        Log in here
                    </Link>
                </p>
            </div>
        </div>
    );
}
