import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import CartDrawer from './CartDrawer';
import { Search, User, LogOut, ShoppingCart, Sparkles } from 'lucide-react';

/*
  STITCH LIGHT THEME — catalog.html nav
  ────────────────────────────────────────
  Body bg: #ffffff   Text: gray-900   Font: Inter
  .liquid-glass (light):
    background: rgba(255,255,255,0.4)
    backdrop-filter: blur(20px)
    border-top: 1px solid rgba(255,255,255,0.8)
    border-left: 1px solid rgba(255,255,255,0.8)
    box-shadow: 0 8px 32px 0 rgba(0,0,0,0.1)
  border-b: border-gray-200
  Nav links: text-gray-900   Logo: text-gray-900 tracking-[-0.05em]
  Icons: material-symbols-outlined   text-gray-900
*/
export default function Navbar() {
    const getItemCount = useCartStore((state) => state.getItemCount);
    const clearCart = useCartStore((state) => state.clearCart);
    const { isAuthenticated, clearAuth } = useAuthStore();
    const navigate = useNavigate();
    const [isCartOpen, setIsCartOpen] = useState(false);

    const handleLogout = async () => {
        try { 
            clearCart();
            await signOut(auth); 
            clearAuth(); 
            navigate('/'); 
        }
        catch (error) { console.error('Sign-out error:', error); }
    };

    const cartCount = getItemCount();

    return (
        <>
            {/*
              Stitch: nav.fixed.top-0.w-full.z-50.liquid-glass.py-4.px-8
                .flex.justify-between.items-center.transition-colors.duration-300
                .rounded-none.border-b.border-gray-200
              light .liquid-glass:
                bg:rgba(255,255,255,0.4)  blur:20px
                border-top:rgba(255,255,255,0.8)  border-left:rgba(255,255,255,0.8)
                shadow:0 8px 32px 0 rgba(0,0,0,0.1)
            */}
            <nav className="fixed top-0 left-0 right-0 w-full z-50 py-4 px-4 sm:px-6 flex justify-between items-center transition-colors duration-300
                bg-white/70
                backdrop-blur-lg [-webkit-backdrop-filter:blur(20px)]
                border-b border-white/40
                shadow-sm
                font-[Inter,sans-serif]">

                {/* Logo — single clean text node */}
                <Link to="/" className="text-3xl font-black tracking-tighter text-[#111111]">
                    KIXX
                </Link>

                {/* Stitch: div.flex.gap-8.font-semibold  text:gray-900 */}
                <div className="hidden sm:flex gap-8 font-semibold text-gray-900 items-center">
                    <Link to="/catalog?category=new" className="hover:text-[#800000] transition-colors">NEW</Link>
                    <Link to="/catalog" className="hover:text-[#800000] transition-colors">BRANDS</Link>
                    <Link to="/catalog?category=sale" className="hover:text-[#800000] transition-colors">SALE</Link>
                    <Link
                        to="/outfit-checker"
                        className="flex items-center gap-1.5 bg-[#111111] hover:opacity-80 text-white text-xs font-black tracking-widest uppercase px-4 py-2 rounded-full transition-colors shadow-sm"
                    >
                        <Sparkles size={14} />
                        Outfit Check
                    </Link>
                </div>

                {/* Stitch: div.flex.gap-4  icons: material-symbols-outlined text-gray-900 */}
                <div className="flex gap-5 items-center text-gray-900">
                    <button aria-label="Search" className="hover:text-[#800000] transition-colors focus:outline-none">
                        <Search />
                    </button>

                    {isAuthenticated ? (
                        <>
                            <Link to="/account" aria-label="Account" className="hover:text-[#800000] transition-colors focus:outline-none">
                                <User />
                            </Link>
                            <button onClick={handleLogout} aria-label="Logout" className="hover:text-[#800000] transition-colors focus:outline-none">
                                <LogOut />
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="hover:text-[#800000] transition-colors font-semibold text-sm hidden sm:block">
                            Log In
                        </Link>
                    )}

                    <button
                        aria-label="Cart"
                        onClick={() => setIsCartOpen(true)}
                        className="relative hover:text-[#800000] transition-colors focus:outline-none"
                    >
                        <ShoppingCart />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-2 inline-flex items-center justify-center px-[5px] py-[2px] text-[10px] font-bold leading-none text-white bg-[#800000] rounded-full">
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
