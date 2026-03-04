import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../services/productService';
import ProductCard from '../components/ProductCard';
import { Search, Filter, RefreshCw, ServerCrash } from 'lucide-react';

// ─── Skeleton card ────────────────────────────────────────────────────────────
function ProductCardSkeleton() {
    return (
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="aspect-square w-full bg-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-[shimmer_1.6s_infinite_linear] bg-[length:200%_100%]" />
            </div>
            <div className="p-5 flex flex-col flex-grow gap-3">
                <div className="h-3 w-20 bg-gray-200 rounded relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-[shimmer_1.6s_infinite_linear] bg-[length:200%_100%]" />
                </div>
                <div className="h-5 w-full bg-gray-200 rounded relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-[shimmer_1.6s_infinite_linear] bg-[length:200%_100%]" />
                </div>
                <div className="h-4 w-3/4 bg-gray-200 rounded relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-[shimmer_1.6s_infinite_linear] bg-[length:200%_100%]" />
                </div>
                <div className="mt-auto h-7 w-24 bg-gray-200 rounded relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-[shimmer_1.6s_infinite_linear] bg-[length:200%_100%]" />
                </div>
            </div>
        </div>
    );
}

function CatalogSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    );
}

// ─── Error state ──────────────────────────────────────────────────────────────
function CatalogError({ error, onRetry, isFetching }) {
    const isServerError =
        error?.response?.status >= 500 ||
        error?.message?.toLowerCase().includes('network');
    return (
        <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 mb-6">
                <ServerCrash className="h-10 w-10 text-[#800000]" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-3 uppercase tracking-widest">
                {isServerError ? 'Database Waking Up' : 'Catalog Unavailable'}
            </h3>
            <p className="text-gray-500 text-base max-w-md mx-auto mb-2 leading-relaxed">
                {isServerError
                    ? 'Our database is spinning up from a cold start. This usually takes 3–5 seconds.'
                    : 'There was a problem reaching the inventory servers.'}
            </p>
            {error?.message && (
                <p className="text-xs text-gray-400 font-mono bg-gray-50 px-3 py-2 rounded-lg inline-block mb-8">
                    {error.message}
                </p>
            )}
            <div>
                <button
                    id="retry-catalog-btn"
                    onClick={onRetry}
                    disabled={isFetching}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-[#800000] hover:bg-[#600000] disabled:opacity-60 text-white font-black rounded-xl transition-all uppercase tracking-widest shadow-md hover:shadow-lg active:scale-[0.98]"
                >
                    <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                    {isFetching ? 'Retrying…' : 'Try Again'}
                </button>
            </div>
        </div>
    );
}

// ─── Catalog Page ─────────────────────────────────────────────────────────────
export default function CatalogPage() {
    const [categoryFilter, setCategoryFilter] = useState('');

    const {
        data: products,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
        failureCount,
    } = useQuery({
        queryKey: ['products'],
        queryFn: () => getProducts(),
    });

    const filteredProducts = React.useMemo(() => {
        if (!products) return [];
        if (!categoryFilter) return products;
        return products.filter(
            (p) => p.category?.toLowerCase() === categoryFilter.toLowerCase()
        );
    }, [products, categoryFilter]);

    const categories = React.useMemo(() => {
        if (!products) return [];
        return [...new Set(products.map((p) => p.category).filter(Boolean))].sort();
    }, [products]);

    const showSkeleton = isLoading;
    const showError = !isLoading && isError;
    const showEmpty = !isLoading && !isError && filteredProducts.length === 0;
    const showGrid = !isLoading && !isError && filteredProducts.length > 0;

    return (
        <div className="min-h-screen bg-[#F5F5DC]">
            <style>{`
                @keyframes shimmer {
                    0%   { background-position:  200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>

            {/* ── Page header ── */}
            <div className="bg-gradient-to-br from-[#800000] to-[#500000] py-16 px-4 sm:px-6 lg:px-8 mb-10">
                <div className="max-w-7xl mx-auto">
                    <p className="text-red-300 font-black tracking-[0.4em] uppercase text-xs mb-3">
                        Latest Collection
                    </p>
                    <h1
                        className="font-black uppercase text-white leading-none tracking-tighter"
                        style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}
                    >
                        Latest Arrivals
                    </h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">

                {/* Filter bar */}
                <div className="mb-10 flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">
                            All Sneakers
                        </h2>
                        {isFetching && !isLoading && (
                            <span className="text-xs font-bold text-[#800000] bg-red-50 px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
                                Syncing…
                            </span>
                        )}
                        {isLoading && failureCount > 0 && (
                            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider">
                                Retry {failureCount}/3…
                            </span>
                        )}
                    </div>

                    <div className="w-full md:w-auto flex items-center bg-gray-50 rounded-xl px-4 py-2 border border-gray-100">
                        <Filter className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                        <select
                            id="category"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="block w-full md:w-64 border-none bg-transparent font-bold text-gray-700 py-3 pl-0 pr-10 focus:ring-0 sm:text-base outline-none cursor-pointer"
                        >
                            <option value="" className="font-bold">All Collections</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat} className="font-medium">{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Content zone */}
                {showSkeleton && <CatalogSkeleton />}

                {showError && (
                    <CatalogError
                        error={error}
                        onRetry={() => refetch()}
                        isFetching={isFetching}
                    />
                )}

                {showEmpty && (
                    <div className="bg-white p-24 rounded-3xl text-center border border-gray-100 shadow-sm">
                        <Search className="h-24 w-24 text-gray-200 mx-auto mb-6" />
                        <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-wide">
                            No products found
                        </h3>
                        <p className="text-gray-500 text-lg max-w-lg mx-auto leading-relaxed">
                            {categoryFilter
                                ? `We couldn't find any kicks matching "${categoryFilter}". They might be sold out.`
                                : 'Our catalog is empty right now. Check back when the next drop hits!'}
                        </p>
                        {categoryFilter && (
                            <button
                                onClick={() => setCategoryFilter('')}
                                className="mt-8 px-8 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors uppercase tracking-widest"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                )}

                {showGrid && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
