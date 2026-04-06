import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import CartDrawer from './CartDrawer';
// We can use Lucide-React or the material icons from stitch design.
// The stitch design uses generic font material-symbols-outlined, but Kixx has lucide-react. 
// However, stitch UI relies on: <span class="material-symbols-outlined text-on-surface-variant text-sm">search</span>
// So we can use the existing icons or lucide.

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
            {/* Top Banner */}
            <div className="bg-on-background/95 text-surface text-[9px] py-1.5 text-center tracking-[0.3em] font-label font-medium sticky top-0 z-[60] backdrop-blur-sm">
                10% OFF YOUR FIRST ORDER
            </div>
            
            {/* Navbar Header */}
            <header className="fixed top-7 w-full z-50 pointer-events-none">
                <nav className="flex justify-between items-center px-8 h-16 w-full max-w-screen-2xl mx-auto bg-surface/70 backdrop-blur-xl pointer-events-auto border-b border-outline-variant/10 shadow-sm">
                    <div className="flex items-center gap-12">
                        <Link to="/" className="text-2xl font-black text-[#31332c] tracking-tighter font-headline uppercase">KIXX</Link>
                        <div className="hidden md:flex gap-8 items-center">
                            <Link to="/catalog?category=new" className="text-[#31332c] border-b-2 border-tertiary pb-1 font-headline font-bold tracking-tight text-sm uppercase">New</Link>
                            <Link to="/catalog" className="text-[#5e6058] hover:text-tertiary transition-colors duration-300 font-headline font-bold tracking-tight text-sm uppercase">Brands</Link>
                            <Link to="/catalog?category=sale" className="text-[#5e6058] hover:text-tertiary transition-colors duration-300 font-headline font-bold tracking-tight text-sm uppercase">Sale</Link>
                            <Link to="/outfit-checker" className="text-[#5e6058] hover:text-tertiary transition-colors duration-300 font-headline font-bold tracking-tight text-sm uppercase flex items-center gap-1">Outfit Check</Link>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="hidden lg:flex items-center bg-surface-container-low px-4 py-2 gap-3 cursor-pointer">
                            <span className="material-symbols-outlined text-on-surface-variant text-sm">search</span>
                            <span className="text-xs font-label text-on-surface-variant hidden xl:inline uppercase tracking-widest">SEARCH ARTIFACTS</span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <button onClick={() => setIsCartOpen(true)} className="scale-95 active:duration-100 hover:text-tertiary transition-colors relative focus:outline-none text-on-surface-variant">
                                <span className="material-symbols-outlined">shopping_bag</span>
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-[5px] py-[2px] text-[9px] font-bold leading-none text-white bg-tertiary rounded-full">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                            
                            {isAuthenticated ? (
                                <div className="flex gap-4">
                                    <Link to="/account" className="scale-95 active:duration-100 hover:text-tertiary transition-colors text-on-surface-variant flex items-center">
                                        <span className="material-symbols-outlined">person</span>
                                    </Link>
                                    <button onClick={handleLogout} className="scale-95 active:duration-100 hover:text-error transition-colors text-on-surface-variant flex items-center">
                                        <span className="material-symbols-outlined">logout</span>
                                    </button>
                                </div>
                            ) : (
                                <Link to="/login" className="scale-95 active:duration-100 hover:text-tertiary transition-colors text-on-surface-variant flex items-center">
                                    <span className="material-symbols-outlined">person</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </nav>
            </header>

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
}
