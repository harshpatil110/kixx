import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import { getUserOrders } from '../services/orderService';
import api from '../services/api';
import toast from 'react-hot-toast';
import { X, Footprints, Star, MapPin, Package } from 'lucide-react';
import { formatPrice } from '../utils/currency';

// Sub-components
import AccountSidebar from '../components/account/AccountSidebar';
import ProfileSettings from '../components/account/ProfileSettings';
import OrderHistory from '../components/account/OrderHistory';

export default function AccountPage() {
    const { user, firebaseUser, clearAuth } = useAuthStore();
    const clearCart = useCartStore((state) => state.clearCart);
    const navigate = useNavigate();
    const [isSigningOut, setIsSigningOut] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('PROFILE');
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [dob, setDob] = useState(user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '');
    const [selectedPersona, setSelectedPersona] = useState(user?.persona || 'Casual');
    
    useEffect(() => {
        if (user?.dateOfBirth) setDob(user.dateOfBirth.split('T')[0]);
        if (user?.persona) setSelectedPersona(user.persona);
    }, [user]);

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
    const [reviewTarget, setReviewTarget] = useState(null);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [isReviewing, setIsReviewing] = useState(false);
    const [hoveredStar, setHoveredStar] = useState(0);

    const openReviewModal = (order) => {
        const firstItem = order.items?.[0];
        setReviewTarget({
            orderId: order.id,
            productId: firstItem?.id || '',
            productName: firstItem?.name || 'Archived Item',
        });
        setReviewRating(0);
        setReviewComment('');
    };

    const closeReviewModal = () => { setReviewTarget(null); setHoveredStar(0); };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (reviewRating === 0) { toast.error('Selection required.'); return; }
        setIsReviewing(true);
        try {
            const res = await api.post('/api/products/review', {
                productId: reviewTarget.productId,
                orderId: reviewTarget.orderId,
                rating: reviewRating,
                comment: reviewComment,
            });
            if (res.data.success) {
                toast.success('Evaluation indexed.');
                closeReviewModal();
            }
        } catch {
            // Error handled by interceptor
        } finally {
            setIsReviewing(false);
        }
    };

    // ── Shoe Archive Logic ──────────────────────────────────────────────
    const [shoeForm, setShoeForm] = useState({ shoeName: '', brand: '', sku: '', purchaseDate: '' });
    const [isSaving, setIsSaving] = useState(false);

    const handleShoeInput = (e) => setShoeForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSaveShoe = async (e) => {
        e.preventDefault();
        if (!shoeForm.shoeName.trim() || !shoeForm.brand.trim()) {
            toast.error('Required fields missing.');
            return;
        }
        setIsSaving(true);
        try {
            const res = await api.post('/api/user/collection/save', shoeForm);
            if (res.data.success) {
                toast.success('Archived successfully.');
                setShoeForm({ shoeName: '', brand: '', sku: '', purchaseDate: '' });
                setIsModalOpen(false);
            }
        } catch {
            // Interceptor handles error
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

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsUpdatingProfile(true);
        try {
            const res = await api.put('/api/user/profile', { 
                dateOfBirth: dob,
                persona: selectedPersona 
            });
            if (res.data.success) {
                toast.success('Registry updated.');
            }
        } catch {
            // Interceptor handles error
        } finally {
            setIsUpdatingProfile(false);
        }
    };

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
        } catch { setIsSigningOut(false); }
    };

    // ── Status Config ────────────────────────────────────────────────────────
    const STATUS_SEQUENCE = ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

    const getStatusConfig = (status) => {
        if (!status) return { label: 'Processing', dotColor: 'bg-stone-300' };
        const s = status.toUpperCase().replace(/\\s+/g, '_');
        switch (s) {
            case 'SHIPPED':           return { label: 'Shipped',          dotColor: 'bg-yellow-500' };
            case 'OUT_FOR_DELIVERY':  return { label: 'Out for Delivery', dotColor: 'bg-blue-500' };
            case 'DELIVERED':         return { label: 'Delivered',        dotColor: 'bg-green-500' };
            case 'RETURNED':          return { label: 'Returned',         dotColor: 'bg-gray-500' };
            case 'CANCELLED':         return { label: 'Cancelled',        dotColor: 'bg-red-500' };
            default:                  return { label: 'Processing',       dotColor: 'bg-stone-300' };
        }
    };

    const statusColor = (s) => {
        const v = String(s || '').toLowerCase();
        if (v === 'delivered') return 'text-stone-900 font-black';
        if (v === 'shipped') return 'text-[#800000]';
        return 'text-stone-400';
    };
    
    const statusDot = (s) => {
        const v = String(s || '').toLowerCase();
        if (v === 'delivered') return 'bg-stone-900';
        if (v === 'shipped') return 'bg-[#800000]';
        return 'bg-stone-200';
    };

    const deriveShippingStatus = (order, index) => {
        // If the backend provides a real shipping status, prefer it
        const raw = order.status;
        if (raw) {
            const norm = raw.toUpperCase().replace(/\\s+/g, '_');
            if (['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED', 'CANCELLED'].includes(norm)) {
                return norm;
            }
        }
        // Simulate diverse statuses for demo (cycle through sequence)
        return STATUS_SEQUENCE[index % STATUS_SEQUENCE.length];
    };

    return (
        <>
        <div className="min-h-screen">
            <main className="max-w-7xl mx-auto px-6 lg:px-12 py-32 flex flex-col md:flex-row gap-16">
                
                <AccountSidebar 
                    user={user} 
                    activeTab={activeTab} 
                    setActiveTab={setActiveTab} 
                    onSignOut={handleSignOut}
                    isSigningOut={isSigningOut}
                />

                <section className="flex-grow">
                    <div className="bg-white border border-stone-200 rounded-sm p-12 min-h-[70vh]">
                        {activeTab === 'PROFILE' ? (
                            <ProfileSettings 
                                user={user}
                                dob={dob}
                                setDob={setDob}
                                selectedPersona={selectedPersona}
                                setSelectedPersona={setSelectedPersona}
                                handleUpdateProfile={handleUpdateProfile}
                                isUpdatingProfile={isUpdatingProfile}
                            />
                        ) : (
                            <OrderHistory 
                                orders={orders}
                                ordersLoading={ordersLoading}
                                setIsModalOpen={setIsModalOpen}
                                openReviewModal={openReviewModal}
                                statusColor={statusColor}
                                statusDot={statusDot}
                                deriveShippingStatus={deriveShippingStatus}
                                getStatusConfig={getStatusConfig}
                                openTrackingModal={openTrackingModal}
                            />
                        )}
                    </div>
                </section>
            </main>

            {/* ── Modals (Styled Sharp & Editorial) ── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-stone-900/40 backdrop-blur-sm px-6" onClick={() => setIsModalOpen(false)}>
                    <div className="relative w-full max-w-lg bg-white border border-stone-200 rounded-sm overflow-hidden animate-fade-in" onClick={(e) => e.stopPropagation()}>
                        <header className="flex items-center justify-between p-8 border-b border-stone-50">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-stone-400 mb-1">Database Intake</p>
                                <h2 className="text-xl font-black text-stone-900 uppercase tracking-tighter">Register Legacy Item</h2>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center text-stone-300 hover:text-stone-900 transition-colors">
                                <X size={20} />
                            </button>
                        </header>
                        <form onSubmit={handleSaveShoe} className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Model Name</label>
                                    <input type="text" name="shoeName" value={shoeForm.shoeName} onChange={handleShoeInput} required className="w-full bg-transparent border-b border-stone-200 py-2 focus:border-stone-900 outline-none text-sm font-medium transition-colors" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Manufacturer</label>
                                    <input type="text" name="brand" value={shoeForm.brand} onChange={handleShoeInput} required className="w-full bg-transparent border-b border-stone-200 py-2 focus:border-stone-900 outline-none text-sm font-medium transition-colors" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Serial/SKU</label>
                                    <input type="text" name="sku" value={shoeForm.sku} onChange={handleShoeInput} className="w-full bg-transparent border-b border-stone-200 py-2 focus:border-stone-900 outline-none text-sm font-medium transition-colors" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Acquisition Date</label>
                                    <input type="date" name="purchaseDate" value={shoeForm.purchaseDate} onChange={handleShoeInput} className="w-full bg-transparent border-b border-stone-200 py-2 focus:border-stone-900 outline-none text-sm font-medium transition-colors" />
                                </div>
                            </div>
                            <div className="pt-4 flex gap-4">
                                <button type="submit" disabled={isSaving} className="flex-1 py-4 bg-stone-900 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/10">
                                    {isSaving ? 'Indexing…' : 'Finalize Entry'}
                                </button>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 bg-white border border-stone-200 text-stone-600 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-stone-50 transition-all">
                                    Abort
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {reviewTarget && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-stone-900/40 backdrop-blur-sm px-6" onClick={closeReviewModal}>
                    <div className="relative w-full max-w-md bg-white border border-stone-200 rounded-sm overflow-hidden animate-fade-in" onClick={(e) => e.stopPropagation()}>
                        <header className="p-8 border-b border-stone-50">
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-stone-400">Verified Evaluation</p>
                                <button onClick={closeReviewModal} className="text-stone-300 hover:text-stone-900 transition-colors"><X size={18}/></button>
                            </div>
                            <h2 className="text-xl font-black text-stone-900 uppercase tracking-tighter leading-tight">Rate: {reviewTarget.productName}</h2>
                        </header>
                        <form onSubmit={handleReviewSubmit} className="p-8 space-y-8">
                            <div className="space-y-3">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Quantifiable Rating</p>
                                <div className="flex items-center gap-2">
                                    {[1,2,3,4,5].map((star) => (
                                        <button 
                                            key={star} type="button" 
                                            onClick={() => setReviewRating(star)} 
                                            onMouseEnter={() => setHoveredStar(star)} 
                                            onMouseLeave={() => setHoveredStar(0)}
                                            className="transition-transform active:scale-90"
                                        >
                                            <Star size={24} strokeWidth={1.5} fill={(star <= (hoveredStar || reviewRating)) ? '#1c1917' : 'none'} color={ (star <= (hoveredStar || reviewRating)) ? '#1c1917' : '#e7e5e4'} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Qualitative Feedback</label>
                                <textarea
                                    value={reviewComment} onChange={(e) => setReviewComment(e.target.value)}
                                    placeholder="Observed fit, material quality, and wearability..."
                                    rows={4} className="w-full bg-stone-50/50 border border-stone-100 p-4 text-sm font-medium outline-none focus:border-stone-900 transition-colors resize-none"
                                />
                            </div>
                            <button type="submit" disabled={isReviewing || reviewRating === 0} className="w-full py-4 bg-stone-900 text-white text-[10px] font-black uppercase tracking-[0.3em] disabled:opacity-30 transition-all shadow-xl shadow-stone-900/10">
                                {isReviewing ? 'Logging…' : 'Publish Review'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>

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
