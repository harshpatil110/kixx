import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../services/productService';
import ProductCard from '../components/ProductCard';

export default function CatalogPage() {
    const [categoryFilter, setCategoryFilter] = useState('');
    const [brandFilter, setBrandFilter] = useState('');

    const { data: products, isLoading, isError, refetch } = useQuery({
        queryKey: ['products'],
        queryFn: () => getProducts(),
    });

    const categories = React.useMemo(() => {
        if (!products) return [];
        return [...new Set(products.map((p) => p.category).filter(Boolean))].sort();
    }, [products]);

    const brands = React.useMemo(() => {
        if (!products) return [];
        return [...new Set(products.map((p) => p.brand?.name).filter(Boolean))].sort();
    }, [products]);

    const filteredProducts = React.useMemo(() => {
        if (!products) return [];
        let filtered = products;
        if (categoryFilter) {
            filtered = filtered.filter(p => p.category?.toLowerCase() === categoryFilter.toLowerCase());
        }
        if (brandFilter) {
            filtered = filtered.filter(p => p.brand?.name?.toLowerCase() === brandFilter.toLowerCase());
        }
        return filtered;
    }, [products, categoryFilter, brandFilter]);

    return (
        <div className="bg-white dark:bg-[#111111] text-black dark:text-white min-h-screen antialiased transition-colors duration-200" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar Filters */}
                    <aside className="w-full lg:w-64 flex-shrink-0">
                        <div className="sticky top-28 space-y-10">
                            {/* Category Filter */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-[#666666] dark:text-[#a0a0a0] mb-4">Category</h3>
                                <ul className="space-y-3">
                                    <li>
                                        <button
                                            onClick={() => setCategoryFilter('')}
                                            className={`text-sm font-medium hover:underline ${!categoryFilter ? 'text-black dark:text-white font-bold' : 'text-[#666666] dark:text-[#a0a0a0] hover:text-black dark:hover:text-white'}`}
                                        >
                                            All Collections
                                        </button>
                                    </li>
                                    {categories.map(cat => (
                                        <li key={cat}>
                                            <button
                                                onClick={() => setCategoryFilter(cat)}
                                                className={`text-sm font-medium hover:underline ${categoryFilter === cat ? 'text-black dark:text-white font-bold' : 'text-[#666666] dark:text-[#a0a0a0] hover:text-black dark:hover:text-white'}`}
                                            >
                                                {cat}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Brand Filter */}
                            {brands.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#666666] dark:text-[#a0a0a0] mb-4">Brands</h3>
                                    <div className="space-y-3">
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                name="brand"
                                                checked={brandFilter === ''}
                                                onChange={() => setBrandFilter('')}
                                                className="form-radio h-4 w-4 text-[#5c0000] border-[#e5e5e5] dark:border-[#333333] bg-transparent focus:ring-[#5c0000] focus:ring-offset-white dark:focus:ring-offset-[#111111]"
                                            />
                                            <span className={`ml-3 text-sm font-medium ${brandFilter === '' ? 'text-black dark:text-white' : 'text-[#666666] dark:text-[#a0a0a0]'}`}>
                                                All Brands
                                            </span>
                                        </label>
                                        {brands.map(brand => (
                                            <label key={brand} className="flex items-center cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="brand"
                                                    checked={brandFilter === brand}
                                                    onChange={() => setBrandFilter(brand)}
                                                    className="form-radio h-4 w-4 text-[#5c0000] border-[#e5e5e5] dark:border-[#333333] bg-transparent focus:ring-[#5c0000] focus:ring-offset-white dark:focus:ring-offset-[#111111]"
                                                />
                                                <span className={`ml-3 text-sm font-medium ${brandFilter === brand ? 'text-black dark:text-white' : 'text-[#666666] dark:text-[#a0a0a0]'}`}>
                                                    {brand}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Size Filter (Visual only as per UI) */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-[#666666] dark:text-[#a0a0a0] mb-4">Size (UK)</h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {[6, 7, 8, 9, 10, 11, 12].map(size => (
                                        <button
                                            key={size}
                                            className={`py-2 text-xs font-medium border transition-colors ${[7, 10].includes(size)
                                                    ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                                                    : size === 12
                                                        ? 'border-[#e5e5e5] dark:border-[#333333] text-[#666666] dark:text-[#a0a0a0] opacity-50 cursor-not-allowed'
                                                        : 'border-[#e5e5e5] dark:border-[#333333] hover:border-black dark:hover:border-white text-[#666666] dark:text-[#a0a0a0] hover:text-black dark:hover:text-white'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Category View */}
                    <div className="flex-1">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 pb-4 border-b border-[#e5e5e5] dark:border-[#333333] gap-4">
                            <h1 className="text-3xl font-black uppercase tracking-tighter">
                                {categoryFilter || brandFilter || 'ALL SNEAKERS'}
                            </h1>
                            <div className="flex items-center space-x-2">
                                <span className="text-xs text-[#666666] dark:text-[#a0a0a0] uppercase tracking-wider font-bold">Sort by:</span>
                                <select className="text-sm font-medium bg-transparent border-none py-0 pl-0 pr-8 focus:ring-0 cursor-pointer text-black dark:text-white">
                                    <option>Latest Arrivals</option>
                                    <option>Price: High to Low</option>
                                    <option>Price: Low to High</option>
                                    <option>Trending</option>
                                </select>
                            </div>
                        </div>

                        {isLoading && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="w-full aspect-square bg-[#f7f7f7] dark:bg-[#222222] mb-4"></div>
                                        <div className="h-4 bg-[#f7f7f7] dark:bg-[#222222] w-1/4 mb-2"></div>
                                        <div className="h-4 bg-[#f7f7f7] dark:bg-[#222222] w-3/4"></div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {isError && (
                            <div className="py-20 text-center border border-[#e5e5e5] dark:border-[#333333] p-12 bg-[#f7f7f7] dark:bg-[#222222]">
                                <h3 className="text-xl font-bold mb-4 uppercase tracking-widest text-[#5c0000]">Catalog Unavailable</h3>
                                <p className="text-[#666666] dark:text-[#a0a0a0] mb-6">Database may be waking up from a cold start.</p>
                                <button onClick={() => refetch()} className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black text-sm font-bold uppercase tracking-widest hover:bg-[#5c0000] hover:text-white transition-colors">
                                    Try Again
                                </button>
                            </div>
                        )}

                        {!isLoading && !isError && filteredProducts.length === 0 && (
                            <div className="py-20 text-center border border-[#e5e5e5] dark:border-[#333333] p-12 bg-[#f7f7f7] dark:bg-[#222222]">
                                <h3 className="text-xl font-bold mb-4 uppercase tracking-widest">No Matches Found</h3>
                                <p className="text-[#666666] dark:text-[#a0a0a0]">Reset your filters to see more products.</p>
                            </div>
                        )}

                        {!isLoading && !isError && filteredProducts.length > 0 && (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
                                    {filteredProducts.map(product => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                                <div className="mt-16 flex justify-center border-t border-[#e5e5e5] dark:border-[#333333] pt-8">
                                    <button className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black text-sm font-bold uppercase tracking-widest hover:bg-[#5c0000] hover:text-white dark:hover:bg-[#5c0000] transition-colors">
                                        Load More Products
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
