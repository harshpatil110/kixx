import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import useAuthStore from '../store/authStore';
import { getUserOrders } from '../services/orderService';
import { formatPrice } from '../utils/currency';
import { generateInvoice } from '../utils/generateInvoice';
import {
    Search, ShoppingCart, User, Package, Heart,
    CreditCard, LogOut, Archive, ChevronDown,
    Download
} from 'lucide-react';

/*
  STITCH LIGHT THEME — account.html (KIXX Glass Account Hub)
  ────────────────────────────────────────────────────────────
  Font: Space Grotesk
  body bg: bg-[#f8f9fa]  text-gray-900  overflow-x:hidden  min-h-screen

  .bg-orb: absolute  rounded-full  blur-[80px]  z-[-1]  opacity-0.4
  .orb-1: 400x400  bg rgba(128,0,0,0.15)  top:-100px   left:-100px
  .orb-2: 500x500  bg rgba(200,200,200,0.2)  bottom:-150px  right:-100px

  .glass-panel LIGHT:
    background: rgba(255,255,255,0.7)
    backdrop-filter: blur(20px)
    border: 1px solid rgba(255,255,255,0.4)
    box-shadow: 0 8px 32px 0 rgba(31,38,135,0.07)
    TEXT: text-gray-900

  Header (glass-panel): sticky top-4 mx-8 mt-4 rounded-[32px] z-50 px-8 py-4
    Logo: text-3xl font-bold tracking-tighter uppercase text-gray-900
    Nav links: text-gray-900 hover:text-[#800000]
    Icons: material-icons text-gray-900
    Avatar: w-10 h-10 rounded-full bg-gray-200 border-2 border-[#800000]

  Main: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-8

  Sidebar glass-panel: rounded-[32px] p-6 sticky top-28
    User avatar: w-16 h-16 rounded-full bg-[#800000] text-white
    h2: font-bold text-lg text-gray-900
    p (role): text-sm text-gray-500
    border-b: border-gray-200
    Nav default: flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/50 font-medium text-gray-900
    Nav active: bg-white/80 font-bold active-nav-item (shadow-[0_0_15px_rgba(128,0,0,0.4)] border-[#800000])
    Logout: mt-4 text-red-500 hover:text-red-700

  .brutalist-solid LIGHT:
    background: #ffffff
    border: 2px solid #000000
    text: text-gray-900
  rounded-[32px] p-8 min-h-[600px]

  Order row: flex flex-col sm:flex-row gap-6 p-6
             border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors
    img box: w-full sm:w-32 h-32 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center p-2
    h3: font-bold text-xl uppercase tracking-tight text-gray-900
    price: font-bold text-lg text-gray-900
    date: text-xs text-gray-500
    status badge (glass-panel LIGHT): px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1
    action btns: text-sm font-medium border-b border-black hover:text-[#800000] hover:border-[#800000] uppercase

  Load More btn: px-8 py-3 bg-black text-white font-bold uppercase tracking-widest rounded-[32px]
                 hover:bg-[#800000] transition-colors
*/
export default function AccountPage() {
    const { user, firebaseUser, clearAuth } = useAuthStore();
    const navigate = useNavigate();
    const [isSigningOut, setIsSigningOut] = useState(false);

    const displayName = user?.name || firebaseUser?.displayName || 'Sneakerhead';
    const email = user?.email || firebaseUser?.email || '—';
    const userId = user?.id || firebaseUser?.uid;

    const { data: orders, isLoading: ordersLoading } = useQuery({
        queryKey: ['userOrders', userId],
        queryFn: () => getUserOrders(userId),
        enabled: !!userId,
    });

    const handleSignOut = async () => {
        setIsSigningOut(true);
        try { await signOut(auth); clearAuth(); navigate('/'); }
        catch (err) { console.error('Sign-out error:', err); setIsSigningOut(false); }
    };

    const statusColor = (s) => {
        if (!s) return 'text-yellow-600';
        const v = s.toLowerCase();
        if (v === 'delivered') return 'text-green-600';
        if (v === 'shipped') return 'text-blue-600';
        if (v === 'returned') return 'text-gray-600';
        return 'text-yellow-600';
    };
    const statusDot = (s) => {
        if (!s) return 'bg-yellow-500';
        const v = s.toLowerCase();
        if (v === 'delivered') return 'bg-green-500';
        if (v === 'shipped') return 'bg-blue-500';
        if (v === 'returned') return 'bg-gray-500';
        return 'bg-yellow-500';
    };

    return (
        /*
          Stitch body: bg-[#f8f9fa] text-gray-900 font:Space Grotesk
          position:relative overflow-x:hidden min-h-screen
        */
        <div className="bg-[#f8f9fa] text-gray-900 relative overflow-x-hidden min-h-screen font-['Space_Grotesk',sans-serif]">

            {/* Stitch .orb-1: absolute 400x400 bg rgba(128,0,0,0.15) top:-100px left:-100px blur:80px opacity:0.4 */}
            <div className="absolute w-[400px] h-[400px] rounded-full bg-[rgba(128,0,0,0.15)] top-[-100px] left-[-100px] blur-[80px] opacity-40 z-[-1] pointer-events-none" />
            {/* Stitch .orb-2: absolute 500x500 bg rgba(200,200,200,0.2) bottom:-150px right:-100px */}
            <div className="absolute w-[500px] h-[500px] rounded-full bg-[rgba(200,200,200,0.2)] bottom-[-150px] right-[-100px] blur-[80px] opacity-40 z-[-1] pointer-events-none" />

            {/*
              Stitch header: glass-panel(LIGHT) sticky top-4 mx-8 mt-4 rounded-[32px] z-50
              px-8 py-4 flex justify-between items-center transition-all duration-300
              glass-panel LIGHT: bg rgba(255,255,255,0.7) blur:20px border rgba(255,255,255,0.4)
              shadow: 0 8px 32px 0 rgba(31,38,135,0.07)
            */}
            <header className="sticky top-4 mx-8 mt-4 rounded-[32px] z-50 px-8 py-4 flex justify-between items-center transition-all duration-300
                bg-[rgba(255,255,255,0.7)]
                backdrop-blur-[20px] [-webkit-backdrop-filter:blur(20px)]
                border border-[rgba(255,255,255,0.4)]
                shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">

                {/* Stitch: div.text-3xl.font-bold.tracking-tighter.uppercase text-gray-900 */}
                <div className="text-3xl font-bold tracking-tighter uppercase text-gray-900">
                    <Link to="/">KIXX</Link>
                </div>
                {/* Stitch: nav.hidden.md:flex.gap-8.font-medium text-gray-900 */}
                <nav className="hidden md:flex gap-8 font-medium text-gray-900">
                    <Link to="/catalog" className="hover:text-[#800000] transition-colors">New Drops</Link>
                    <Link to="/catalog" className="hover:text-[#800000] transition-colors">Classics</Link>
                    <Link to="/catalog" className="hover:text-[#800000] transition-colors">Sale</Link>
                </nav>
                {/* Stitch: div.flex.items-center.gap-6 text-gray-900 */}
                <div className="flex items-center gap-6 text-gray-900">
                    <button className="hover:text-[#800000] transition-colors"><Search size={20} /></button>
                    <button className="hover:text-[#800000] transition-colors"><ShoppingCart size={20} /></button>
                    {/* Stitch: avatar div.w-10.h-10.rounded-full.bg-gray-200.overflow-hidden.border-2.border-primary */}
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-[#800000] cursor-pointer flex items-center justify-center font-bold text-sm text-[#800000]">
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                </div>
            </header>

            {/* Stitch: main.max-w-7xl.mx-auto.px-4.sm:px-6.lg:px-8.py-12.flex.flex-col.md:flex-row.gap-8 */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-8">

                {/* Stitch: aside.w-full.md:w-64.flex-shrink-0 */}
                <aside className="w-full md:w-64 flex-shrink-0">
                    {/*
                      Stitch: div.glass-panel.rounded-[32px].p-6.sticky.top-28
                      glass-panel LIGHT: bg rgba(255,255,255,0.7) blur:20px border rgba(255,255,255,0.4)
                      shadow: 0 8px 32px 0 rgba(31,38,135,0.07)
                    */}
                    <div className="rounded-[32px] p-6 sticky top-28
                        bg-[rgba(255,255,255,0.7)]
                        backdrop-blur-[20px] [-webkit-backdrop-filter:blur(20px)]
                        border border-[rgba(255,255,255,0.4)]
                        shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">

                        {/* Stitch: div.flex.items-center.gap-4.mb-8.pb-6.border-b.border-gray-200 */}
                        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200">
                            {/* Stitch: div.w-16.h-16.rounded-full.bg-gray-200.overflow-hidden.flex-shrink-0 */}
                            <div className="w-16 h-16 rounded-full bg-[#800000] overflow-hidden flex-shrink-0 flex items-center justify-center text-white font-bold text-xl">
                                {displayName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                {/* Stitch: h2.font-bold.text-lg text-gray-900 */}
                                <h2 className="font-bold text-lg text-gray-900">{displayName}</h2>
                                {/* Stitch: p.text-sm.text-gray-500 */}
                                <p className="text-sm text-gray-500">Sneakerhead</p>
                            </div>
                        </div>

                        {/* Stitch: nav.flex.flex-col.gap-2 */}
                        <nav className="flex flex-col gap-2">
                            {/* default: flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/50 font-medium */}
                            <Link to="/account" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-500 hover:text-black hover:bg-gray-50 transition-colors font-medium">
                                <User size={18} />
                                Profile
                            </Link>
                            {/* active nav item — subtle premium */}
                            <Link to="/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-100 text-[#800000] font-semibold">
                                <Package size={18} />
                                Order History
                            </Link>
                            <Link to="/catalog" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-500 hover:text-black hover:bg-gray-50 transition-colors font-medium">
                                <Heart size={18} />
                                Wishlist
                            </Link>
                            <Link to="/catalog" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-500 hover:text-black hover:bg-gray-50 transition-colors font-medium">
                                <CreditCard size={18} />
                                Payment Methods
                            </Link>
                            {/* Stitch: a.mt-4.text-red-500.hover:text-red-700 */}
                            <button
                                onClick={handleSignOut} disabled={isSigningOut}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors font-medium mt-4 text-red-500 hover:text-red-700 disabled:opacity-50"
                            >
                                <LogOut size={18} />
                                {isSigningOut ? 'Signing Out…' : 'Log Out'}
                            </button>
                        </nav>
                    </div>
                </aside>

                {/* Stitch: section.flex-grow */}
                <section className="flex-grow">
                    {/*
                      Stitch .brutalist-solid LIGHT: bg:#ffffff border:2px solid #000
                      rounded-[32px] p-8 min-h-[600px]
                    */}
                    <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-100 p-8 min-h-[600px]">
                        <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
                            <h1 className="text-4xl font-bold uppercase tracking-tight text-gray-900">Order History</h1>
                            <div className="relative flex items-center gap-2">
                                <select className="appearance-none bg-transparent py-1 pr-6 text-sm text-gray-500 focus:outline-none cursor-pointer">
                                    <option>Last 30 Days</option>
                                    <option>Last 6 Months</option>
                                    <option>All Time</option>
                                </select>
                                <ChevronDown size={16} className="text-gray-400 pointer-events-none -ml-5" />
                            </div>
                        </div>

                        {/* Orders list */}
                        {ordersLoading ? (
                            <div className="space-y-6">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="animate-pulse flex gap-6 p-6 border border-gray-100 rounded-2xl">
                                        <div className="w-32 h-32 bg-gray-100 rounded-xl flex-shrink-0" />
                                        <div className="flex-grow space-y-3">
                                            <div className="h-5 bg-gray-100 w-1/3 rounded" />
                                            <div className="h-3 bg-gray-100 w-1/4 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : orders && orders.length > 0 ? (
                            <div className="space-y-6">
                                {orders.map((order) => (
                                    /* Stitch: div.flex.flex-col.sm:flex-row.gap-6.p-6
                                       .border.border-gray-200.rounded-2xl.hover:bg-gray-50.transition-colors */
                                    <div key={order.id} className="flex flex-col sm:flex-row gap-6 p-6 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors">
                                        {/* Stitch: div.w-full.sm:w-32.h-32.bg-gray-100.rounded-xl.overflow-hidden.flex-shrink-0.flex.items-center.justify-center.p-2 */}
                                        <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center p-2">
                                            {order.items?.[0]?.imageUrl
                                                ? <img src={order.items[0].imageUrl} alt="Order" className="w-full h-auto mix-blend-multiply" />
                                                : <Archive size={32} className="text-gray-300" />
                                            }
                                        </div>
                                        {/* Stitch: div.flex-grow.flex.flex-col.justify-between */}
                                        <div className="flex-grow flex flex-col justify-between">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    {/* Stitch: h3.font-bold.text-xl.uppercase.tracking-tight text-gray-900 */}
                                                    <h3 className="font-bold text-xl uppercase tracking-tight text-gray-900">
                                                        {order.items?.[0]?.name || 'Order'}
                                                        {order.items?.length > 1 && ` +${order.items.length - 1} more`}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 mt-1">Order #{order.id}</p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    {/* Stitch: p.font-bold.text-lg text-gray-900 */}
                                                    <p className="font-bold text-lg text-gray-900">{formatPrice(order.totalAmount || 0)}</p>
                                                </div>
                                            </div>
                                            {/* Stitch: div.mt-4.flex.justify-between.items-center */}
                                            <div className="mt-4 flex justify-between items-center">
                                                {/*
                                                  Status badge — glass-panel LIGHT:
                                                  bg rgba(255,255,255,0.7) blur:20px border rgba(255,255,255,0.4)
                                                  px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1
                                                */}
                                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1
                                                    bg-[rgba(255,255,255,0.7)]
                                                    backdrop-blur-[20px]
                                                    border border-[rgba(255,255,255,0.4)]
                                                    shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]
                                                    ${statusColor(order.status)}`}>
                                                    <span className={`w-2 h-2 rounded-full ${statusDot(order.status)}`} />
                                                    {order.status || 'Processing'}
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => generateInvoice(order)} className="text-gray-500 hover:text-black transition-colors flex items-center gap-2 text-sm uppercase">
                                                        <Download size={16} /> Invoice
                                                    </button>
                                                    <Link to={`/orders/${order.id}`} className="text-sm font-medium border-b border-black hover:text-[#800000] hover:border-[#800000] transition-colors uppercase text-gray-900 ml-4">
                                                        View Receipt
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-24 text-gray-500">
                                <Archive size={48} className="text-gray-300 mb-4 mx-auto" />
                                <p className="font-bold text-xl uppercase tracking-tight text-gray-900">No orders yet</p>
                                <p className="text-sm mt-2">Your order history will appear here.</p>
                                <Link to="/catalog" className="mt-6 inline-block px-8 py-3 bg-black text-white font-bold uppercase tracking-widest rounded-[32px] hover:bg-[#800000] transition-colors">
                                    Start Shopping
                                </Link>
                            </div>
                        )}

                        {/* Stitch: div.mt-8.flex.justify-center — Load More */}
                        {orders && orders.length > 0 && (
                            <div className="mt-8 flex justify-center">
                                {/* Stitch: button.px-8.py-3.bg-black.text-white.font-bold.uppercase.tracking-widest.rounded.hover:bg-primary.transition-colors */}
                                <button className="px-8 py-3 bg-black text-white font-bold uppercase tracking-widest rounded-[32px] hover:bg-[#800000] transition-colors">
                                    Load More
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
