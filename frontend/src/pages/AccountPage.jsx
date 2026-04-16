import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import { getUserOrders } from '../services/orderService';
import { formatPrice } from '../utils/currency';
import { generateInvoice } from '../utils/generateInvoice';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
    Search, ShoppingCart, User, Package, Heart,
    CreditCard, LogOut, Archive, ChevronDown,
    Download, PlusCircle, X, Footprints, Star, MapPin
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
    const clearCart = useCartStore((state) => state.clearCart);
    const navigate = useNavigate();
    const [isSigningOut, setIsSigningOut] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ── Tracking Modal State ─────────────────────────────────────────────────
    const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
    const [trackingOrder, setTrackingOrder] = useState(null);

    const TRACKING_STEPS = ['Order Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

    const getActiveStepIndex = (status) => {
        if (!status) return 1;
        const s = status.toUpperCase().replace(/\s+/g, '_');
        if (s === 'DELIVERED') return 4;
        if (s === 'OUT_FOR_DELIVERY') return 3;
        if (s === 'SHIPPED') return 2;
        if (s === 'PROCESSING') return 1;
        return 1;
    };

    const getStepSubtext = (stepIndex, activeIndex) => {
        if (stepIndex !== activeIndex) return null;
        const subtexts = [
            'Your order has been confirmed and is being prepared.',
            'Items are being picked and packed at our warehouse.',
            'Package arrived at transit facility in Mumbai, MH.',
            'Your package is on its way with the delivery partner.',
            'Successfully delivered. Enjoy your kicks!',
        ];
        return subtexts[stepIndex] || null;
    };

    const getStepTimestamp = (stepIndex, activeIndex, orderDate) => {
        if (stepIndex > activeIndex) return null;
        const base = orderDate ? new Date(orderDate) : new Date();
        const offsets = [0, 1, 2, 3, 5];
        const d = new Date(base);
        d.setDate(d.getDate() + offsets[stepIndex]);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const openTrackingModal = (order) => {
        setTrackingOrder(order);
        setIsTrackingModalOpen(true);
    };

    const closeTrackingModal = () => {
        setIsTrackingModalOpen(false);
        setTrackingOrder(null);
    };

    // ── Review Modal State ───────────────────────────────────────────────────
    const [reviewTarget, setReviewTarget] = useState(null); // { orderId, productId, productName }
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [isReviewing, setIsReviewing] = useState(false);
    const [hoveredStar, setHoveredStar] = useState(0);

    const openReviewModal = (order) => {
        const firstItem = order.items?.[0];
        setReviewTarget({
            orderId: order.id,
            productId: firstItem?.id || '',
            productName: firstItem?.name || 'This Product',
        });
        setReviewRating(0);
        setReviewComment('');
    };

    const closeReviewModal = () => { setReviewTarget(null); setHoveredStar(0); };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (reviewRating === 0) { toast.error('Please select a star rating.'); return; }
        if (!reviewTarget?.productId) { toast.error('Product ID is missing.'); return; }
        setIsReviewing(true);
        try {
            const res = await api.post('/api/products/review', {
                productId: reviewTarget.productId,
                orderId: reviewTarget.orderId,
                rating: reviewRating,
                comment: reviewComment,
            });
            if (res.data.success) {
                toast.success(res.data.message || 'Review submitted!');
                closeReviewModal();
            }
        } catch {
            // global toast from api interceptor
        } finally {
            setIsReviewing(false);
        }
    };

    // ── Shoe Archive Form State ──────────────────────────────────────────────
    const [shoeForm, setShoeForm] = useState({ shoeName: '', brand: '', sku: '', purchaseDate: '' });
    const [isSaving, setIsSaving] = useState(false);

    const handleShoeInput = (e) => setShoeForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSaveShoe = async (e) => {
        e.preventDefault();
        if (!shoeForm.shoeName.trim() || !shoeForm.brand.trim()) {
            toast.error('Shoe name and brand are required.');
            return;
        }
        setIsSaving(true);
        try {
            const res = await api.post('/api/user/collection/save', shoeForm);
            if (res.data.success) {
                toast.success(res.data.message || 'Shoe saved to your archive!');
                setShoeForm({ shoeName: '', brand: '', sku: '', purchaseDate: '' });
                setIsModalOpen(false);
            }
        } catch (err) {
            // toast already fired by api interceptor
        } finally {
            setIsSaving(false);
        }
    };

    // Close on Escape key
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') {
                setIsModalOpen(false);
                closeReviewModal();
                closeTrackingModal();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const displayName = user?.name || firebaseUser?.displayName || 'Sneakerhead';
    const email = user?.email || firebaseUser?.email || '—';
    const userId = user?.id || firebaseUser?.uid;

    const { data: orders, isLoading: ordersLoading } = useQuery({
        queryKey: ['userOrders', userId],
        queryFn: () => getUserOrders(),
        enabled: !!userId,
    });

    const handleSignOut = async () => {
        setIsSigningOut(true);
        try { 
            clearCart();
            await signOut(auth); 
            clearAuth(); 
            navigate('/'); 
        }
        catch (err) { console.error('Sign-out error:', err); setIsSigningOut(false); }
    };

    // ── Status Config ────────────────────────────────────────────────────────
    const STATUS_SEQUENCE = ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

    const getStatusConfig = (status) => {
        if (!status) return { label: 'Processing', dotColor: 'bg-stone-300' };
        const s = status.toUpperCase().replace(/\s+/g, '_');
        switch (s) {
            case 'SHIPPED':           return { label: 'Shipped',          dotColor: 'bg-yellow-500' };
            case 'OUT_FOR_DELIVERY':  return { label: 'Out for Delivery', dotColor: 'bg-blue-500' };
            case 'DELIVERED':         return { label: 'Delivered',        dotColor: 'bg-green-500' };
            case 'RETURNED':          return { label: 'Returned',         dotColor: 'bg-gray-500' };
            case 'CANCELLED':         return { label: 'Cancelled',        dotColor: 'bg-red-500' };
            default:                  return { label: 'Processing',       dotColor: 'bg-stone-300' };
        }
    };

    /**
     * Derive a shipping-level status from an order.
     * The API stores paymentStatus (e.g. "SUCCESS") — we need a logistics status.
     * If order.status already contains a shipping value we use it;
     * otherwise we simulate one based on order index for demo diversity.
     */
    const deriveShippingStatus = (order, index) => {
        // If the backend provides a real shipping status, prefer it
        const raw = order.status;
        if (raw) {
            const norm = raw.toUpperCase().replace(/\s+/g, '_');
            if (['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED', 'CANCELLED'].includes(norm)) {
                return norm;
            }
        }
        // Simulate diverse statuses for demo (cycle through sequence)
        return STATUS_SEQUENCE[index % STATUS_SEQUENCE.length];
    };

    return (
        /*
          Stitch body: bg-[#f8f9fa] text-gray-900 font:Space Grotesk
          position:relative overflow-x:hidden min-h-screen
        */
        <>
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
                        <div className="flex flex-wrap justify-between items-end mb-8 border-b border-gray-200 pb-4 gap-3">
                            <h1 className="text-4xl font-bold uppercase tracking-tight text-gray-900">Order History</h1>
                            <div className="flex items-center gap-3">
                                {/* Add Past Shoes CTA */}
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-[#800000] transition-colors"
                                >
                                    <PlusCircle size={15} />
                                    Add Your Past Shoes
                                </button>
                                <div className="relative flex items-center gap-2">
                                    <select className="appearance-none bg-transparent py-1 pr-6 text-sm text-gray-500 focus:outline-none cursor-pointer">
                                        <option>Last 30 Days</option>
                                        <option>Last 6 Months</option>
                                        <option>All Time</option>
                                    </select>
                                    <ChevronDown size={16} className="text-gray-400 pointer-events-none -ml-5" />
                                </div>
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
                                {orders.map((order, orderIndex) => (
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
                                                {(() => {
                                                    const shippingStatus = deriveShippingStatus(order, orderIndex);
                                                    const cfg = getStatusConfig(shippingStatus);
                                                    return (
                                                        <span className="flex items-center gap-2">
                                                            <span className={`w-2 h-2 rounded-full ${cfg.dotColor}`} />
                                                            <span className="text-[10px] uppercase tracking-widest text-stone-600 font-medium">
                                                                {cfg.label}
                                                            </span>
                                                        </span>
                                                    );
                                                })()}
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => generateInvoice(order)} className="text-gray-500 hover:text-black transition-colors flex items-center gap-2 text-sm uppercase">
                                                        <Download size={16} /> Invoice
                                                    </button>
                                                    <Link to={`/orders/${order.id}`} className="text-sm font-medium border-b border-black hover:text-[#800000] hover:border-[#800000] transition-colors uppercase text-gray-900 ml-4">
                                                        View Receipt
                                                    </Link>
                                                    <button
                                                        onClick={() => openReviewModal(order)}
                                                        className="text-[10px] uppercase tracking-widest border-b border-stone-200
                                                                   hover:border-stone-900 transition-all text-stone-500
                                                                   hover:text-stone-900 ml-2 flex items-center gap-1"
                                                    >
                                                        <Star size={11} />
                                                        Leave a Review
                                                    </button>
                                                    <button
                                                        onClick={() => openTrackingModal(order)}
                                                        className="text-[10px] uppercase tracking-widest text-stone-600
                                                                   hover:text-stone-900 border-b border-transparent
                                                                   hover:border-stone-900 transition-all ml-2
                                                                   flex items-center gap-1"
                                                    >
                                                        <MapPin size={11} />
                                                        Track Order
                                                    </button>
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

        {/* ── Add Past Shoes Modal ──────────────────────────────────────────── */}
        {isModalOpen && (
            <div
                className="fixed inset-0 z-[200] flex items-center justify-center px-4"
                style={{ background: 'rgba(0,0,0,0.45)' }}
                onClick={() => setIsModalOpen(false)}
            >
                <div
                    className="relative w-full max-w-md bg-[#F7F5F0] rounded-sm p-0 overflow-hidden"
                    style={{ border: '1px solid rgba(0,0,0,0.10)', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Modal Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-white">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-md bg-stone-900 flex items-center justify-center">
                                <Footprints className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">Personal Archive</p>
                                <p className="text-sm font-black text-stone-900 tracking-tight leading-none mt-0.5">Add Your Past Shoes</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Modal Form */}
                    <form onSubmit={handleSaveShoe} className="p-6 space-y-5">

                        {/* Shoe Name */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                                Shoe Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="shoeName"
                                value={shoeForm.shoeName}
                                onChange={handleShoeInput}
                                placeholder={`Air Jordan 1 High 'Chicago'`}
                                required
                                className="block w-full px-3 py-2.5 text-sm bg-white border border-stone-200 rounded-sm focus:ring-1 focus:ring-stone-900 focus:border-stone-900 focus:outline-none placeholder:text-stone-300 font-medium text-stone-900 transition-all"
                            />
                        </div>

                        {/* Brand */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                                Brand <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="brand"
                                value={shoeForm.brand}
                                onChange={handleShoeInput}
                                placeholder="Nike, Adidas, New Balance…"
                                required
                                className="block w-full px-3 py-2.5 text-sm bg-white border border-stone-200 rounded-sm focus:ring-1 focus:ring-stone-900 focus:border-stone-900 focus:outline-none placeholder:text-stone-300 font-medium text-stone-900 transition-all"
                            />
                        </div>

                        {/* SKU + Purchase Date — 2-col */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">SKU</label>
                                <input
                                    type="text"
                                    name="sku"
                                    value={shoeForm.sku}
                                    onChange={handleShoeInput}
                                    placeholder="555088-101"
                                    className="block w-full px-3 py-2.5 text-sm bg-white border border-stone-200 rounded-sm focus:ring-1 focus:ring-stone-900 focus:border-stone-900 focus:outline-none placeholder:text-stone-300 font-medium text-stone-900 transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Purchase Date</label>
                                <input
                                    type="date"
                                    name="purchaseDate"
                                    value={shoeForm.purchaseDate}
                                    onChange={handleShoeInput}
                                    className="block w-full px-3 py-2.5 text-sm bg-white border border-stone-200 rounded-sm focus:ring-1 focus:ring-stone-900 focus:border-stone-900 focus:outline-none text-stone-900 font-medium transition-all"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex-1 flex items-center justify-center py-2.5 px-4 bg-stone-900 text-white rounded-sm hover:bg-[#800000] transition-colors text-xs font-bold uppercase tracking-widest disabled:opacity-60"
                            >
                                {isSaving ? 'Saving…' : 'Save to My Archive'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="py-2.5 px-4 bg-white border border-stone-200 text-stone-600 rounded-sm hover:bg-stone-50 transition-colors text-xs font-bold uppercase tracking-widest"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* ── Review Modal ─────────────────────────────────────────────────── */}
        {reviewTarget && (
            <div
                className="fixed inset-0 z-[200] flex items-center justify-center px-4"
                style={{ background: 'rgba(0,0,0,0.5)' }}
                onClick={closeReviewModal}
            >
                <div
                    className="relative w-full max-w-sm bg-[#F7F5F0] overflow-hidden"
                    style={{ border: '1px solid rgba(0,0,0,0.10)' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-stone-200">
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-stone-400 mb-0.5">
                                Verified Purchase
                            </p>
                            <p className="text-[15px] font-black tracking-[-0.03em] text-stone-900 uppercase leading-tight">
                                Rate Your Buy
                            </p>
                            <p className="text-[11px] text-stone-500 mt-1 max-w-[200px] truncate">
                                {reviewTarget.productName}
                            </p>
                        </div>
                        <button
                            onClick={closeReviewModal}
                            className="text-stone-400 hover:text-stone-900 transition-colors"
                            aria-label="Close"
                        >
                            <X size={15} />
                        </button>
                    </div>

                    <form onSubmit={handleReviewSubmit} className="px-6 py-5 space-y-5">

                        {/* Star Selector */}
                        <div className="space-y-2">
                            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-stone-400">
                                Rating <span className="text-red-500">*</span>
                            </p>
                            <div className="flex items-center gap-1.5">
                                {[1,2,3,4,5].map((star) => {
                                    const filled = star <= (hoveredStar || reviewRating);
                                    return (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setReviewRating(star)}
                                            onMouseEnter={() => setHoveredStar(star)}
                                            onMouseLeave={() => setHoveredStar(0)}
                                            className="transition-transform hover:scale-110"
                                            aria-label={`${star} star${star > 1 ? 's' : ''}`}
                                        >
                                            <svg width="28" height="28" viewBox="0 0 24 24"
                                                 fill={filled ? '#1c1917' : 'none'}
                                                 stroke="#1c1917"
                                                 strokeWidth="1.5"
                                                 strokeLinecap="round"
                                                 strokeLinejoin="round">
                                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                            </svg>
                                        </button>
                                    );
                                })}
                                {reviewRating > 0 && (
                                    <span className="text-[11px] font-bold text-stone-500 ml-1">
                                        {['','Poor','Fair','Good','Great','Perfect!'][reviewRating]}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Comment */}
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold uppercase tracking-[0.25em] text-stone-400">
                                Written Review
                            </label>
                            <textarea
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                placeholder="Share your thoughts on the fit, quality, delivery…"
                                rows={4}
                                maxLength={1000}
                                className="w-full bg-transparent border border-stone-200 focus:border-stone-900
                                           p-3 text-sm font-medium text-stone-900 placeholder:text-stone-300
                                           focus:outline-none transition-colors resize-none"
                            />
                            <p className="text-[9px] text-stone-300 text-right">
                                {reviewComment.length}/1000
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 pt-1">
                            <button
                                type="submit"
                                disabled={isReviewing || reviewRating === 0}
                                className="flex-1 py-2.5 bg-stone-900 text-white text-[10px] font-bold
                                           uppercase tracking-[0.2em] hover:bg-[#800000] transition-colors
                                           disabled:opacity-40 rounded-sm"
                            >
                                {isReviewing ? 'Submitting…' : 'Submit Review'}
                            </button>
                            <button
                                type="button"
                                onClick={closeReviewModal}
                                className="py-2.5 px-4 text-[10px] font-bold uppercase tracking-[0.2em]
                                           text-stone-500 hover:text-stone-900 transition-colors border
                                           border-stone-200 hover:border-stone-400 rounded-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* ── Tracking Timeline Modal ────────────────────────────────────────── */}
        {isTrackingModalOpen && trackingOrder && (
            <div
                className="fixed inset-0 z-[200] flex items-center justify-center px-4"
                style={{ background: 'rgba(0,0,0,0.40)' }}
                onClick={closeTrackingModal}
            >
                <div
                    className="relative w-full max-w-md bg-[#F7F5F0] overflow-hidden"
                    style={{ border: '1px solid rgba(0,0,0,0.12)' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-stone-200 bg-white">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 bg-stone-900 flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-stone-400">
                                    Tracking Details
                                </p>
                                <p className="text-[15px] font-black tracking-[-0.03em] text-stone-900 leading-none mt-0.5 uppercase">
                                    Order #{trackingOrder.id}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={closeTrackingModal}
                            className="text-stone-400 hover:text-stone-900 transition-colors mt-0.5"
                            aria-label="Close tracking modal"
                        >
                            <X size={15} />
                        </button>
                    </div>

                    {/* Product peek */}
                    <div className="px-6 py-3 border-b border-stone-100 flex items-center gap-3 bg-white/50">
                        {trackingOrder.items?.[0]?.imageUrl ? (
                            <img
                                src={trackingOrder.items[0].imageUrl}
                                alt=""
                                className="w-10 h-10 object-contain bg-stone-50 rounded"
                            />
                        ) : (
                            <div className="w-10 h-10 bg-stone-100 rounded flex items-center justify-center">
                                <Package size={16} className="text-stone-300" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-stone-900 truncate">
                                {trackingOrder.items?.[0]?.name || 'Order'}
                                {trackingOrder.items?.length > 1 && (
                                    <span className="text-stone-400 font-normal">{` +${trackingOrder.items.length - 1} more`}</span>
                                )}
                            </p>
                            <p className="text-[10px] text-stone-400 uppercase tracking-widest">
                                {formatPrice(trackingOrder.totalAmount || 0)}
                            </p>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="px-6 py-6">
                        {(() => {
                            const activeIdx = getActiveStepIndex(
                                trackingOrder.paymentStatus || trackingOrder.status
                            );
                            return (
                                <div className="relative">
                                    {TRACKING_STEPS.map((step, idx) => {
                                        const isCompleted = idx < activeIdx;
                                        const isActive = idx === activeIdx;
                                        const isFuture = idx > activeIdx;
                                        const isLast = idx === TRACKING_STEPS.length - 1;
                                        const subtext = getStepSubtext(idx, activeIdx);
                                        const timestamp = getStepTimestamp(idx, activeIdx, trackingOrder.createdAt);

                                        return (
                                            <div key={step} className="relative flex gap-4" style={{ minHeight: isLast ? 'auto' : '72px' }}>
                                                {/* Vertical line + dot column */}
                                                <div className="flex flex-col items-center flex-shrink-0" style={{ width: '20px' }}>
                                                    {/* Dot */}
                                                    <div
                                                        className={`relative z-10 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-300 ${
                                                            isActive
                                                                ? 'w-5 h-5 bg-stone-900 ring-4 ring-stone-200'
                                                                : isCompleted
                                                                    ? 'w-3.5 h-3.5 bg-stone-900'
                                                                    : 'w-3.5 h-3.5 bg-stone-300'
                                                        }`}
                                                    >
                                                        {isCompleted && (
                                                            <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                                                                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        )}
                                                        {isActive && (
                                                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                                        )}
                                                    </div>
                                                    {/* Connecting line */}
                                                    {!isLast && (
                                                        <div
                                                            className={`flex-1 w-0.5 transition-colors duration-300 ${
                                                                idx < activeIdx ? 'bg-stone-900' : 'bg-stone-200'
                                                            }`}
                                                        />
                                                    )}
                                                </div>

                                                {/* Step content */}
                                                <div className={`pb-6 ${isLast ? 'pb-0' : ''}`}>
                                                    <p
                                                        className={`text-sm font-bold uppercase tracking-wide leading-tight ${
                                                            isFuture ? 'text-stone-400' : 'text-stone-900'
                                                        }`}
                                                    >
                                                        {step}
                                                    </p>
                                                    {timestamp && (
                                                        <p className="text-[10px] text-stone-400 tracking-wider mt-0.5">
                                                            {timestamp}
                                                        </p>
                                                    )}
                                                    {subtext && (
                                                        <p className={`text-xs mt-1.5 leading-relaxed max-w-[260px] ${
                                                            isActive ? 'text-stone-600 font-medium' : 'text-stone-400'
                                                        }`}>
                                                            {subtext}
                                                        </p>
                                                    )}
                                                    {isActive && !isLast && (
                                                        <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-stone-100 rounded text-[9px] font-bold uppercase tracking-[0.15em] text-stone-500">
                                                            <MapPin size={9} />
                                                            Live Tracking
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-stone-200 bg-white flex items-center justify-between">
                        <p className="text-[9px] text-stone-400 uppercase tracking-[0.2em]">
                            Estimated delivery data is approximate
                        </p>
                        <button
                            onClick={closeTrackingModal}
                            className="py-2 px-5 bg-stone-900 text-white text-[10px] font-bold
                                       uppercase tracking-[0.2em] hover:bg-[#800000] transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}
