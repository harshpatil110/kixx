import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import CartDrawer from './CartDrawer';

export default function Navbar() {
    const getItemCount = useCartStore((state) => state.getItemCount);
    const { user, isAuthenticated, clearAuth } = useAuthStore();
    const navigate = useNavigate();
    const [isCartOpen, setIsCartOpen] = useState(false);

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
        <>
            <nav className="fixed top-0 w-full z-40 bg-white/40 dark:bg-black/40 backdrop-blur-[20px] shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] border-b border-white/80 dark:border-white/20 py-4 px-8 flex justify-between items-center transition-colors duration-300 font-display">
                <div className="flex-shrink-0 flex items-center">
                    <Link to="/" className="text-3xl font-extrabold tracking-tighter text-gray-900 dark:text-gray-100" style={{ letterSpacing: '-0.05em' }}>
                        KIXX
                    </Link>
                </div>

                <div className="hidden sm:flex gap-8 font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-widest text-sm">
                    <Link to="/catalog" className="hover:text-[#800000] transition-colors font-bold">
                        Shop
                    </Link>
                    <Link to="/catalog" className="hover:text-[#800000] transition-colors">
                        Brands
                    </Link>
                    {isAuthenticated && (
                        <Link to="/orders" className="hover:text-[#800000] transition-colors">
                            Drops
                        </Link>
                    )}
                </div>

                <div className="flex gap-4 items-center text-gray-900 dark:text-gray-100">
                    <button aria-label="Search" className="hover:text-[#800000] transition-colors outline-none focus:outline-none">
                        <span className="material-icons">search</span>
                    </button>

                    {isAuthenticated ? (
                        <>
                            <Link to="/account" aria-label="Account" className="hover:text-[#800000] transition-colors outline-none focus:outline-none">
                                <span className="material-icons">person</span>
                            </Link>
                            <button onClick={handleLogout} aria-label="Logout" className="hover:text-[#800000] transition-colors outline-none focus:outline-none">
                                <span className="material-icons">logout</span>
                            </button>
                        </>
                    ) : (
                        <Link to="/login" aria-label="Login" className="hover:text-[#800000] transition-colors font-bold uppercase tracking-widest text-xs hidden sm:block">
                            Log In
                        </Link>
                    )}

                    <button
                        aria-label="Cart"
                        onClick={() => setIsCartOpen(true)}
                        className="relative hover:text-[#800000] transition-colors outline-none focus:outline-none"
                    >
                        <span className="material-icons">shopping_cart</span>
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-2 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-[#800000] rounded-full">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </nav>
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
}
