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
import { X, Footprints, Star } from 'lucide-react';

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

    return (
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
    );
}
