import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';

export default function Navbar() {
    const getItemCount = useCartStore((state) => state.getItemCount);
    const { user, isAuthenticated, clearAuth } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            clearAuth();
            navigate('/');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const cartCount = getItemCount();

    return (
        <nav className="sticky top-0 z-50 bg-white/90 dark:bg-[#111111]/90 backdrop-blur-md border-b border-[#e5e5e5] dark:border-[#333333] transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="text-4xl font-black tracking-tighter uppercase font-display text-black dark:text-white">
                            KIXX
                        </Link>
                    </div>

                    <div className="hidden sm:ml-10 sm:flex sm:space-x-12">
                        <Link to="/catalog" className="text-black dark:text-white inline-flex items-center px-1 pt-1 text-sm font-bold uppercase tracking-wider border-b-2 border-black dark:border-white">
                            Shop
                        </Link>
                        <Link to="/catalog" className="text-[#666666] dark:text-[#a0a0a0] hover:text-black dark:hover:text-white inline-flex items-center px-1 pt-1 text-sm font-bold uppercase tracking-wider transition-colors">
                            Brands
                        </Link>
                        {isAuthenticated && (
                            <Link to="/orders" className="text-[#666666] dark:text-[#a0a0a0] hover:text-black dark:hover:text-white inline-flex items-center px-1 pt-1 text-sm font-bold uppercase tracking-wider transition-colors">
                                Drops
                            </Link>
                        )}
                    </div>

                    <div className="flex items-center space-x-6">
                        <button className="text-black dark:text-white hover:text-[#666666] dark:hover:text-[#a0a0a0] transition-colors">
                            <span className="material-icons">search</span>
                        </button>

                        {isAuthenticated ? (
                            <div className="flex items-center gap-4">
                                <Link to="/account" className="text-black dark:text-white hover:text-[#666666] dark:hover:text-[#a0a0a0] transition-colors text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                    <span className="material-icons text-sm">person</span>
                                    <span className="hidden sm:inline">{user?.displayName || 'Profile'}</span>
                                </Link>
                                <button onClick={handleLogout} className="text-[#666666] dark:text-[#a0a0a0] hover:text-[#5c0000] transition-colors text-sm font-bold uppercase tracking-wider flex items-center">
                                    <span className="material-icons text-sm">logout</span>
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="text-black dark:text-white hover:text-[#666666] dark:hover:text-[#a0a0a0] transition-colors text-sm font-bold uppercase tracking-wider">
                                Log In
                            </Link>
                        )}

                        <Link to="/cart" className="relative p-2 text-black dark:text-white hover:text-[#666666] dark:hover:text-[#a0a0a0] transition-colors">
                            <span className="material-icons">shopping_bag</span>
                            {cartCount > 0 && (
                                <span className="absolute top-1 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-[#5c0000] rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
