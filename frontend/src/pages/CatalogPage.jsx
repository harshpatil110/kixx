import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../services/productService';
import ProductCard from '../components/ProductCard';

export default function CatalogPage() {
    const [brandFilter, setBrandFilter] = useState('');

    const { data: products, isLoading, isError, refetch } = useQuery({
        queryKey: ['products'],
        queryFn: () => getProducts(),
    });

    const brands = React.useMemo(() => {
        if (!products) return [];
        return [...new Set(products.map((p) => p.brand?.name).filter(Boolean))].sort();
    }, [products]);

    const filteredProducts = React.useMemo(() => {
        if (!products) return [];
        let filtered = products;
        if (brandFilter) {
            filtered = filtered.filter(p => p.brand?.name?.toLowerCase() === brandFilter.toLowerCase());
        }
        return filtered;
    }, [products, brandFilter]);

    return (
        <div className="bg-[#ffffff] dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 min-h-screen antialiased transition-colors duration-200"
            style={{
                fontFamily: "'Inter', sans-serif",
                backgroundImage: "radial-gradient(circle at 10% 20%, rgba(200, 200, 200, 0.2) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(128, 0, 0, 0.1) 0%, transparent 40%)",
                backgroundAttachment: "fixed"
            }}>
            <div className="pt-28 px-4 sm:px-8 pb-12 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
                <aside className="w-full md:w-64 flex-shrink-0">
                    <div className="p-6 sticky top-32 bg-white/40 dark:bg-black/40 backdrop-blur-[20px] shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] border-t border-l border-white/80 dark:border-white/20 rounded-[32px]">
                        <h2 className="text-2xl font-bold mb-6 tracking-tighter uppercase">FILTERS</h2>
                        {brands.length > 0 && (
                            <div className="mb-8">
                                <h3 className="font-semibold mb-3 tracking-widest uppercase text-sm text-[#666666] dark:text-[#a0a0a0]">BRAND</h3>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="radio" name="brand" checked={brandFilter === ''} onChange={() => setBrandFilter('')} className="form-radio text-[#800000] rounded border-gray-400 dark:border-gray-600 bg-transparent focus:ring-[#800000] h-4 w-4" />
                                        <span className="font-medium text-sm">All Brands</span>
                                    </label>
                                    {brands.map(brand => (
                                        <label key={brand} className="flex items-center gap-3 cursor-pointer">
                                            <input type="radio" name="brand" checked={brandFilter === brand} onChange={() => setBrandFilter(brand)} className="form-radio text-[#800000] rounded border-gray-400 dark:border-gray-600 bg-transparent focus:ring-[#800000] h-4 w-4" />
                                            <span className="font-medium text-sm">{brand}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div>
                            <h3 className="font-semibold mb-3 tracking-widest uppercase text-sm text-[#666666] dark:text-[#a0a0a0]">SIZE (US)</h3>
                            <div className="grid grid-cols-3 gap-2">
                                {[7, 8, 9, 10, 11, 12].map(size => (
                                    <button key={size} className={`border py-2 rounded-md transition-colors text-sm font-medium ${size === 10 ? 'border-[#800000] bg-[#800000]/10 text-[#800000] font-bold' : size === 8 ? 'border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800' : 'border-gray-300 dark:border-gray-700 hover:border-[#800000] dark:hover:border-[#800000]'}`}>
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                <main className="flex-1">
                    <div className="flex justify-between items-end mb-8">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter uppercase">{brandFilter || 'ALL SNEAKERS'}</h1>
                        <span className="text-gray-500 dark:text-gray-400 font-medium">{filteredProducts.length} Results</span>
                    </div>

                    {isLoading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="animate-pulse bg-white dark:bg-gray-900 rounded-[32px] p-4 border border-gray-100 dark:border-gray-800">
                                    <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-[20px] mb-4"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-800 w-1/4 mb-2"></div>
                                    <div className="h-6 bg-gray-200 dark:bg-gray-800 w-3/4 mb-2"></div>
                                    <div className="h-6 bg-gray-200 dark:bg-gray-800 w-1/3 mt-2"></div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!isLoading && !isError && filteredProducts.length > 0 && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProducts.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                            <div className="mt-12 flex justify-center gap-2">
                                <button className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
                                    <span className="material-icons text-sm">chevron_left</span>
                                </button>
                                <button className="w-10 h-10 rounded-full flex items-center justify-center bg-[#800000] text-white font-bold">1</button>
                                <button className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 font-bold">2</button>
                                <button className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 font-bold">3</button>
                                <button className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
                                    <span className="material-icons text-sm">chevron_right</span>
                                </button>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
