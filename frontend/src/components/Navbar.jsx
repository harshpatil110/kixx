import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import CartDrawer from './CartDrawer';

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
    const { isAuthenticated, clearAuth } = useAuthStore();
    const navigate = useNavigate();
    const [isCartOpen, setIsCartOpen] = useState(false);

    const handleLogout = async () => {
        try { await signOut(auth); clearAuth(); navigate('/'); }
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
            <nav className="fixed top-0 w-full z-50 py-4 px-8 flex justify-between items-center transition-colors duration-300
                bg-[rgba(255,255,255,0.4)]
                backdrop-blur-[20px] [-webkit-backdrop-filter:blur(20px)]
                border-t border-t-[rgba(255,255,255,0.8)]
                border-l border-l-[rgba(255,255,255,0.8)]
                border-b border-b-gray-200
                shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]
                font-[Inter,sans-serif]">

                {/* Stitch: div.text-3xl.font-extrabold.tracking-tighter.nav-logo  text:gray-900 */}
                <div className="text-3xl font-extrabold tracking-[-0.05em] text-gray-900">
                    <Link to="/">KIXX</Link>
                </div>

                {/* Stitch: div.flex.gap-8.font-semibold  text:gray-900 */}
                <div className="hidden sm:flex gap-8 font-semibold text-gray-900">
                    <Link to="/catalog" className="hover:text-[#800000] transition-colors">NEW</Link>
                    <Link to="/catalog" className="hover:text-[#800000] transition-colors">BRANDS</Link>
                    <Link to="/catalog" className="hover:text-[#800000] transition-colors">SALE</Link>
                </div>

                {/* Stitch: div.flex.gap-4  icons: material-symbols-outlined text-gray-900 */}
                <div className="flex gap-4 items-center text-gray-900">
                    <button aria-label="Search" className="hover:text-[#800000] transition-colors focus:outline-none">
                        <span className="material-symbols-outlined">search</span>
                    </button>

                    {isAuthenticated ? (
                        <>
                            <Link to="/account" aria-label="Account" className="hover:text-[#800000] transition-colors focus:outline-none">
                                <span className="material-symbols-outlined">person</span>
                            </Link>
                            <button onClick={handleLogout} aria-label="Logout" className="hover:text-[#800000] transition-colors focus:outline-none">
                                <span className="material-symbols-outlined">logout</span>
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
                        <span className="material-symbols-outlined">shopping_cart</span>
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
