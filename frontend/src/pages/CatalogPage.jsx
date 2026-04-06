import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useAuthStore from '../store/authStore';
import PromoToast from '../components/PromoToast';
import ProductCard from '../components/ProductCard';

export default function CatalogPage() {
    const [brandFilter, setBrandFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchParams] = useSearchParams();
    const category = searchParams.get('category');
    const { user } = useAuthStore();
    const [showPromo, setShowPromo] = useState(false);

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
                </div>
            </main>
            <PromoToast isOpen={showPromo} onClose={handleClosePromo} />
        </div>
    );
}
