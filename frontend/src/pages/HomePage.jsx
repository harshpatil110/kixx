import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../services/productService';
import ProductCard from '../components/ProductCard';
import { Loader2, Search, Filter } from 'lucide-react';

export default function HomePage() {
    const [categoryFilter, setCategoryFilter] = useState('');

    const { data: products, isLoading, isError } = useQuery({
        queryKey: ['products'],
        queryFn: () => getProducts(), // Real-world: pass { category: categoryFilter } if backend supports it natively
    });

    // Client side filtering
    const filteredProducts = React.useMemo(() => {
        if (!products) return [];
        if (!categoryFilter) return products;
        return products.filter(p => p.category?.toLowerCase() === categoryFilter.toLowerCase());
    }, [products, categoryFilter]);

    // Extract unique categories dynamically based on data
    const categories = React.useMemo(() => {
        if (!products) return [];
        const cats = products.map(p => p.category).filter(Boolean);
        return [...new Set(cats)].sort();
    }, [products]);

    return (
        <div className="min-h-screen bg-[#F5F5DC] pb-24">
            {/* Hero Header */}
            <div className="bg-gradient-to-tr from-[#800000] to-[#600000] py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden shadow-xl mb-12">
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight drop-shadow-lg">
                        Step Up Your Game
                    </h1>
                    <p className="text-2xl text-red-100 max-w-3xl mx-auto font-medium tracking-wide">
                        Explore exclusive drops, premium collaborations, and the kicks that define your personal style.
                    </p>
                </div>
                {/* Abstract design elements */}
                <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white opacity-10 blur-3xl mix-blend-overlay pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#F5F5DC] to-transparent"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Title & Filter Bar */}
                <div className="mb-10 flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-3xl font-black text-gray-900 mb-4 md:mb-0 uppercase tracking-widest">
                        Latest Arrivals
                    </h2>

                    <div className="w-full md:w-auto flex items-center bg-gray-50 rounded-xl px-4 py-2 border border-gray-100">
                        <Filter className="w-5 h-5 text-gray-400 mr-3" />
                        <select
                            id="category"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="block w-full md:w-64 border-none bg-transparent font-bold text-gray-700 py-3 pl-0 pr-10 focus:ring-0 sm:text-base outline-none cursor-pointer"
                        >
                            <option value="" className="font-bold cursor-pointer">All Collections</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat} className="font-medium cursor-pointer">{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Content Area */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-dashed border-gray-300">
                        <Loader2 className="animate-spin text-[#800000] h-16 w-16 mb-6" />
                        <p className="text-gray-500 font-bold text-xl uppercase tracking-widest">Loading drops...</p>
                    </div>
                ) : isError ? (
                    <div className="bg-red-50 text-red-800 p-12 rounded-3xl text-center border-2 border-red-200 shadow-sm animate-in fade-in zoom-in-95">
                        <h3 className="text-2xl font-black uppercase mb-3">Failed to load catalog</h3>
                        <p className="text-lg font-medium">There was a problem communicating with the inventory servers. Please refresh.</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="bg-white p-24 rounded-3xl text-center border border-gray-100 shadow-sm animate-in fade-in zoom-in-95">
                        <Search className="h-24 w-24 text-gray-200 mx-auto mb-6" />
                        <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-wide">No products found</h3>
                        <p className="text-gray-500 text-lg max-w-lg mx-auto leading-relaxed">
                            {categoryFilter
                                ? `We couldn't track down any kicks matching "${categoryFilter}". They might be sold out.`
                                : "Our catalog is completely wiped clean right now. Check back when the next drop hits!"}
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
                ) : (
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
