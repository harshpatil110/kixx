import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu } from 'lucide-react';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';

export default function Navbar() {
    const getItemCount = useCartStore((state) => state.getItemCount);
    const { user, firebaseUser, isAuthenticated, clearAuth } = useAuthStore();
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
    const displayName = user?.name || firebaseUser?.displayName || 'Sneakerhead';

    return (
        <nav className="sticky top-0 z-50 bg-[#F5F5DC] shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Left: Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="text-3xl font-black tracking-tighter text-[#800000] hover:opacity-80 transition-opacity">
                            KIXX
                        </Link>
                    </div>

                    {/* Middle: Desktop Links */}
                    <div className="hidden md:flex space-x-8 items-center justify-center flex-grow">
                        <Link to="/" className="text-gray-700 hover:text-[#800000] font-bold transition-colors uppercase tracking-wider text-sm">
                            Home
                        </Link>
                        <Link to="/catalog" className="text-gray-700 hover:text-[#800000] font-bold transition-colors uppercase tracking-wider text-sm">
                            Catalog
                        </Link>
                        {isAuthenticated && (
                            <Link to="/orders" className="text-gray-700 hover:text-[#800000] font-bold transition-colors uppercase tracking-wider text-sm">
                                Orders
                            </Link>
                        )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center space-x-4 sm:space-x-6">

                        {/* Cart Icon */}
                        <Link to="/cart" className="relative text-gray-700 hover:text-[#800000] transition-colors p-2 flex items-center group">
                            <ShoppingCart className="h-6 w-6 group-hover:scale-110 transition-transform" />
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 text-xs font-black text-white bg-[#800000] rounded-full transform translate-x-1 -translate-y-1 shadow-md">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* User Details / Auth Links */}
                        <div className="hidden sm:flex items-center">
                            {isAuthenticated ? (
                                <div className="flex items-center space-x-3 border-l border-gray-300 pl-4">
                                    <Link
                                        to="/account"
                                        className="flex items-center gap-2 text-sm font-bold text-gray-700
                                                   hover:text-[#800000] transition-colors whitespace-nowrap"
                                    >
                                        <User className="w-4 h-4 text-[#800000]" />
                                        Your Account
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        title="Sign out"
                                        className="flex items-center px-3 py-1.5 text-sm font-bold text-gray-500
                                                   bg-gray-100 hover:bg-red-50 hover:text-[#800000]
                                                   rounded-lg transition-colors border border-transparent
                                                   hover:border-red-100"
                                    >
                                        <LogOut className="w-4 h-4 sm:mr-1" />
                                        <span className="hidden md:inline">Logout</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-4 border-l border-gray-300 pl-4">
                                    <Link
                                        to="/login"
                                        className="text-sm font-bold text-gray-700 hover:text-[#800000] transition-colors"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="text-sm font-bold bg-[#800000] text-white px-5 py-2 rounded-xl hover:bg-[#600000] transition-colors shadow-sm"
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Icon (Visual Only) */}
                        <div className="sm:hidden flex items-center border-l border-gray-300 pl-4">
                            <button className="text-gray-700 hover:text-[#800000] p-1">
                                <Menu className="w-6 h-6" />
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </nav>
    );
}
