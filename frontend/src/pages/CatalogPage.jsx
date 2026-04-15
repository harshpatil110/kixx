import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useAuthStore from '../store/authStore';
import PromoToast from '../components/PromoToast';
import ProductCard from '../components/ProductCard';
import api from '../services/api';
import toast from 'react-hot-toast';
import { X, MessageSquare } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// FeedbackModal — Warm Editorial Minimalism, flat select + textarea
// ─────────────────────────────────────────────────────────────────────────────
const FEEDBACK_CATEGORIES = [
    'UI/UX Bug',
    'Payment/Checkout Issue',
    'Account/Login Issue',
    'General Suggestion',
    'Other',
];

function FeedbackModal({ isOpen, onClose, userId }) {
    const [form, setForm] = useState({ category: FEEDBACK_CATEGORIES[0], message: '' });
    const [isSaving, setIsSaving] = useState(false);
    const textareaRef = useRef(null);

    useEffect(() => {
        if (isOpen && textareaRef.current) {
            setTimeout(() => textareaRef.current?.focus(), 60);
        }
    }, [isOpen]);

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.message.trim()) { toast.error('Please write a message.'); return; }
        setIsSaving(true);
        try {
            const res = await api.post('/api/feedback/submit', {
                category: form.category,
                message: form.message,
            });
            if (res.data.success) {
                toast.success(res.data.message || 'Feedback received. Thank you!');
                setForm({ category: FEEDBACK_CATEGORIES[0], message: '' });
                onClose();
            }
        } catch {
            // global toast from api interceptor
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center"
            style={{ background: 'rgba(10,10,10,0.65)' }}
            onClick={onClose}
        >
            <div
                className="relative w-full sm:max-w-sm bg-[#F7F5F0] sm:mx-4 overflow-hidden"
                style={{ border: '1px solid rgba(0,0,0,0.12)' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-stone-200">
                    <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 bg-stone-900 flex items-center justify-center flex-shrink-0">
                            <MessageSquare className="w-3 h-3 text-white" />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-stone-400">
                                User Feedback
                            </p>
                            <p className="text-[15px] font-black tracking-[-0.03em] text-stone-900 leading-none mt-0.5 uppercase">
                                Report / Suggest
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-stone-400 hover:text-stone-900 transition-colors mt-0.5"
                        aria-label="Close"
                    >
                        <X size={15} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

                    {/* Category — flat select */}
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-bold uppercase tracking-[0.25em] text-stone-400">
                            Category
                        </label>
                        <div className="relative">
                            <select
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                className="w-full appearance-none bg-transparent border-b border-stone-300
                                           focus:border-stone-900 py-2 text-sm font-medium text-stone-900
                                           focus:outline-none transition-colors pr-6 cursor-pointer"
                            >
                                {FEEDBACK_CATEGORIES.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            {/* Custom chevron */}
                            <div className="absolute right-0 bottom-2 pointer-events-none">
                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                                    <path d="M1 1l4 4 4-4" stroke="#a8a29e" strokeWidth="1.5"
                                          strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Message — line textarea */}
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-bold uppercase tracking-[0.25em] text-stone-400">
                            Message <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            ref={textareaRef}
                            name="message"
                            value={form.message}
                            onChange={handleChange}
                            placeholder="Describe the issue or your suggestion…"
                            required
                            rows={4}
                            maxLength={2000}
                            className="w-full bg-transparent border border-stone-200 focus:border-stone-900
                                       p-3 text-sm font-medium text-stone-900 placeholder:text-stone-300
                                       focus:outline-none transition-colors resize-none"
                        />
                        <p className="text-[9px] text-stone-300 text-right">
                            {form.message.length}/2000
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-1">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 py-2.5 bg-stone-900 text-white text-[10px] font-bold
                                       uppercase tracking-[0.2em] hover:bg-[#800000] transition-colors
                                       disabled:opacity-50 rounded-sm"
                        >
                            {isSaving ? 'Sending…' : 'Submit Feedback'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
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
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// ArchiveModal — Warm Editorial Minimalism, line-style inputs, no box shadows
// ─────────────────────────────────────────────────────────────────────────────
function ArchiveModal({ isOpen, onClose }) {
    const [form, setForm] = useState({ shoeName: '', brand: '', year: '', sku: '' });
    const [isSaving, setIsSaving] = useState(false);
    const firstInputRef = useRef(null);

    // Auto-focus first field on open
    useEffect(() => {
        if (isOpen && firstInputRef.current) {
            setTimeout(() => firstInputRef.current?.focus(), 60);
        }
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.shoeName.trim() || !form.brand.trim()) {
            toast.error('Shoe name and brand are required.');
            return;
        }
        setIsSaving(true);
        try {
            const res = await api.post('/api/user/collection/save', {
                shoeName: form.shoeName,
                brand: form.brand,
                releaseYear: form.year || undefined,
                sku: form.sku || undefined,
            });
            if (res.data.success) {
                toast.success(res.data.message || 'Added to your archive.');
                setForm({ shoeName: '', brand: '', year: '', sku: '' });
                onClose();
            }
        } catch {
            // global toast already fired by api interceptor
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        // Backdrop — solid dark overlay, no blur
        <div
            className="fixed inset-0 z-[300] flex items-center justify-center px-4"
            style={{ background: 'rgba(10,10,10,0.72)' }}
            onClick={onClose}
        >
            {/* Modal card */}
            <div
                className="relative w-full max-w-sm bg-[#F7F5F0] overflow-hidden"
                style={{ border: '1px solid rgba(0,0,0,0.12)' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between px-7 pt-7 pb-5 border-b border-stone-200">
                    <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-stone-400 mb-1">
                            Personal Sneaker Archive
                        </p>
                        <h2 className="text-[22px] font-black tracking-[-0.04em] text-stone-900 leading-none uppercase">
                            Log a Past Shoe
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="mt-0.5 text-stone-400 hover:text-stone-900 transition-colors"
                        aria-label="Close"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Form — line inputs only, no boxes */}
                <form onSubmit={handleSubmit} className="px-7 py-6 space-y-6">

                    {/* Shoe Name */}
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-[0.25em] text-stone-400">
                            Shoe Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            ref={firstInputRef}
                            type="text"
                            name="shoeName"
                            value={form.shoeName}
                            onChange={handleChange}
                            placeholder="Air Jordan 1 High OG"
                            required
                            className="w-full bg-transparent border-b border-stone-300 focus:border-stone-900
                                       py-2 text-sm font-medium text-stone-900 placeholder:text-stone-300
                                       focus:outline-none transition-colors"
                        />
                    </div>

                    {/* Brand */}
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-[0.25em] text-stone-400">
                            Brand <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="brand"
                            value={form.brand}
                            onChange={handleChange}
                            placeholder="Nike, Adidas, New Balance…"
                            required
                            className="w-full bg-transparent border-b border-stone-300 focus:border-stone-900
                                       py-2 text-sm font-medium text-stone-900 placeholder:text-stone-300
                                       focus:outline-none transition-colors"
                        />
                    </div>

                    {/* Year + SKU — side by side */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-[0.25em] text-stone-400">
                                Year
                            </label>
                            <input
                                type="number"
                                name="year"
                                value={form.year}
                                onChange={handleChange}
                                placeholder="1985"
                                min="1900"
                                max={new Date().getFullYear() + 1}
                                className="w-full bg-transparent border-b border-stone-300 focus:border-stone-900
                                           py-2 text-sm font-medium text-stone-900 placeholder:text-stone-300
                                           focus:outline-none transition-colors [appearance:textfield]
                                           [&::-webkit-outer-spin-button]:appearance-none
                                           [&::-webkit-inner-spin-button]:appearance-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-[0.25em] text-stone-400">
                                SKU
                            </label>
                            <input
                                type="text"
                                name="sku"
                                value={form.sku}
                                onChange={handleChange}
                                placeholder="555088-101"
                                className="w-full bg-transparent border-b border-stone-300 focus:border-stone-900
                                           py-2 text-sm font-medium text-stone-900 placeholder:text-stone-300
                                           focus:outline-none transition-colors"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 py-3 bg-stone-900 text-white text-[10px] font-bold
                                       uppercase tracking-[0.2em] hover:bg-[#800000] transition-colors
                                       disabled:opacity-50"
                        >
                            {isSaving ? 'Saving…' : 'Add to Archive'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="py-3 px-4 text-[10px] font-bold uppercase tracking-[0.2em]
                                       text-stone-500 hover:text-stone-900 transition-colors border
                                       border-stone-200 hover:border-stone-400"
                        >
                            Cancel
                        </button>
                    </div>
                </form>

                {/* Decorative corner tag */}
                <div className="absolute bottom-0 right-0 w-8 h-8 overflow-hidden pointer-events-none">
                    <div className="absolute bottom-0 right-0 w-0 h-0
                        border-l-[32px] border-l-transparent
                        border-b-[32px] border-b-stone-200" />
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// CatalogPage
// ─────────────────────────────────────────────────────────────────────────────
export default function CatalogPage() {
    const [brandFilter, setBrandFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchParams] = useSearchParams();
    const category = searchParams.get('category');
    const { user } = useAuthStore();
    const [showPromo, setShowPromo] = useState(false);
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

    React.useEffect(() => {
        const isDismissed = localStorage.getItem('kixx_promo_dismissed') === 'true';
        const hasUsedDiscount = user?.firstPurchaseDiscountUsed === true;

        if (!isDismissed && !hasUsedDiscount) {
            const timer = setTimeout(() => setShowPromo(true), 1500);
            return () => clearTimeout(timer);
        } else {
            setShowPromo(false);
        }
    }, [user]);

    const handleClosePromo = () => {
        localStorage.setItem('kixx_promo_dismissed', 'true');
        setShowPromo(false);
    };

    const itemsPerPage = 8;

    const { data: products, isLoading, isError } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const res = await fetch(`${baseUrl}/api/products`);
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                const data = await res.json();
                return data.products;
            } catch (error) {
                console.error("FRONTEND FETCH ERROR:", error);
                throw error;
            }
        },
    });

    const brands = React.useMemo(() => {
        if (!products) return [];
        return [...new Set(products.map(p => p.brand?.name).filter(Boolean))].sort();
    }, [products]);

    const filteredProducts = React.useMemo(() => {
        if (!products) return [];
        let result = products;

        if (category === 'new') {
            result = result.filter(p => p.isNew === true);
        } else if (category === 'sale') {
            result = result.filter(p => p.isOnSale === true);
        }

        if (brandFilter) {
            result = result.filter(p => p.brand?.name?.toLowerCase() === brandFilter.toLowerCase());
        }

        return result;
    }, [products, brandFilter, category]);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [brandFilter, category]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = React.useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredProducts.slice(start, start + itemsPerPage);
    }, [filteredProducts, currentPage, itemsPerPage]);

    const pageTitleParts = React.useMemo(() => {
        if (category === 'new') return { main: 'NEW', sub: 'ARRIVALS' };
        if (category === 'sale') return { main: 'CURATED', sub: 'SALE' };
        if (brandFilter) return { main: brandFilter.toUpperCase(), sub: 'COLLECTION' };
        return { main: 'ARCHIVE', sub: 'COLLECTION' };
    }, [category, brandFilter]);

    return (
        <div className="bg-surface font-body text-on-surface min-h-screen">
            <main className="pt-32 pb-24 px-8 max-w-screen-2xl mx-auto">
                <section className="mb-20 grid grid-cols-12 gap-8 items-end">
                    <div className="col-span-12 lg:col-span-8">
                        <span className="font-label text-[10px] tracking-[0.3em] text-on-surface-variant uppercase mb-4 block">Issue No. 04 / {(new Date()).getFullYear()}</span>
                        <h1 className="font-headline font-black text-6xl lg:text-8xl tracking-tighter leading-[0.9] text-on-surface uppercase">
                            THE <span className="text-tertiary">{pageTitleParts.main}</span><br />{pageTitleParts.sub}
                        </h1>
                    </div>
                    <div className="col-span-12 lg:col-span-4 pb-2">
                        <p className="text-lg italic text-on-surface-variant leading-relaxed border-l-2 border-tertiary pl-6">
                            A curated selection of technical silhouettes and timeless artifacts. We redefine the sneaker as a sculptural object through high-contrast editorial discovery.
                        </p>
                    </div>
                </section>

                {/* ── Filter Bar ── */}
                <div className="flex justify-between items-center mb-12 border-b border-outline-variant/10 pb-6">
                    <div className="flex gap-8 items-center font-label text-[10px] tracking-widest text-on-surface-variant overflow-x-auto whitespace-nowrap pb-2 scrollbar-none px-2 -mx-2">
                        <button
                            onClick={() => setBrandFilter('')}
                            className={!brandFilter ? "text-on-surface font-bold border-b border-on-surface uppercase py-1" : "hover:text-on-surface transition-colors uppercase py-1"}
                        >
                            ALL OBJECTS
                        </button>
                        {brands.map(brand => (
                            <button
                                key={brand}
                                onClick={() => setBrandFilter(brand)}
                                className={brandFilter === brand ? "text-on-surface font-bold border-b border-on-surface uppercase py-1" : "hover:text-on-surface transition-colors uppercase py-1"}
                            >
                                {brand}
                            </button>
                        ))}

                        {/* ── Archive CTA — separator then button ── */}
                        <span className="text-on-surface-variant/30 select-none">|</span>
                        <button
                            onClick={() => setShowArchiveModal(true)}
                            className="flex items-center gap-1.5 border border-stone-300 px-3 py-1
                                       text-[9px] font-bold uppercase tracking-[0.2em] text-stone-500
                                       hover:bg-stone-900 hover:text-white hover:border-stone-900
                                       transition-all duration-200 flex-shrink-0"
                        >
                            <span className="text-base leading-none -mt-px">+</span>
                            Add to My Archive
                        </button>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                        <span className="font-label text-[10px] tracking-widest text-on-surface-variant">SORT BY: RECENT</span>
                        <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
                    </div>
                </div>

                {isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-24 gap-x-12">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="animate-pulse bg-surface-container border border-outline-variant/20 aspect-[4/5] p-8"></div>
                        ))}
                    </div>
                )}

                {!isLoading && isError && (
                    <div className="text-center py-24 text-on-surface-variant">
                        <p className="font-headline text-lg font-semibold">Failed to load artifacts.</p>
                    </div>
                )}

                {!isLoading && !isError && filteredProducts.length > 0 && (
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-24 gap-x-12 perspective-container">
                        {paginatedProducts.map((product, index) => (
                            <div key={product.id} className={index % 3 === 1 ? 'lg:mt-12' : ''}>
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </section>
                )}

                {!isLoading && !isError && filteredProducts.length === 0 && (
                    <div className="text-center py-24 text-on-surface-variant">
                        <p className="font-headline text-lg font-semibold uppercase tracking-widest">No artifacts found.</p>
                    </div>
                )}

                {!isLoading && !isError && totalPages > 1 && (
                    <div className="mt-20 flex justify-center gap-4">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 font-label text-xs tracking-widest uppercase transition-colors border border-outline/20 ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-surface-variant text-on-surface'}`}
                        >
                            PREV
                        </button>
                        <div className="flex items-center gap-2 font-label text-[10px] tracking-[0.2em] text-on-surface-variant">
                           {currentPage} / {totalPages}
                        </div>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className={`px-4 py-2 font-label text-xs tracking-widest uppercase transition-colors border border-outline/20 ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:bg-surface-variant text-on-surface'}`}
                        >
                            NEXT
                        </button>
                    </div>
                )}

                <div className="mt-40 mb-32 max-w-3xl mx-auto text-center hidden md:block">
                    <h2 className="font-headline font-bold text-4xl mb-8 leading-tight tracking-tighter text-on-surface">"SNEAKERS ARE NO LONGER COMMODITIES; THEY ARE THE TEXTURES OF MODERN ARCHITECTURE FOR THE FEET."</h2>
                    <span className="font-label text-[10px] tracking-[0.4em] uppercase text-tertiary">— KIXX EDITORIAL TEAM</span>

                    {/* Feedback & Legal links */}
                    <div className="mt-10 flex items-center justify-center gap-3">
                        <button
                            onClick={() => setIsFeedbackModalOpen(true)}
                            className="text-[10px] text-stone-400 hover:text-stone-900 transition-colors
                                       cursor-pointer uppercase tracking-widest font-medium
                                       border-b border-transparent hover:border-stone-400"
                        >
                            Report an Issue / Feedback
                        </button>
                        <span className="text-stone-300 text-[10px] select-none">|</span>
                        <Link
                            to="/privacy"
                            className="text-[10px] text-stone-400 hover:text-stone-900 transition-colors
                                       uppercase tracking-widest font-medium
                                       border-b border-transparent hover:border-stone-400"
                        >
                            Privacy Policy
                        </Link>
                    </div>
                </div>
            </main>

            <PromoToast isOpen={showPromo} onClose={handleClosePromo} />

            {/* Archive Modal */}
            <ArchiveModal
                isOpen={showArchiveModal}
                onClose={() => setShowArchiveModal(false)}
            />

            {/* Feedback Modal */}
            <FeedbackModal
                isOpen={isFeedbackModalOpen}
                onClose={() => setIsFeedbackModalOpen(false)}
                userId={user?.id || null}
            />
        </div>
    );
}
