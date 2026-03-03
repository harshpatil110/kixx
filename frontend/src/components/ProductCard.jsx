import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { prefetchProduct } from '../config/queryClient';

/**
 * ProductCard
 *
 * Performance features:
 *  • loading="lazy"   — Native browser lazy loading. Images below the viewport
 *                        fold are not fetched until the user scrolls near them.
 *                        This reduces the number of concurrent requests on page
 *                        load, directly improving LCP for above-the-fold content.
 *  • decoding="async" — Instructs the browser to decode the image off the main
 *                        thread, preventing janky frame drops during load.
 *  • onMouseEnter prefetch — When the user hovers over a card, we silently
 *                        prefetch the full product details via React Query.
 *                        By the time they click and navigate, data is already
 *                        in cache → ProductDetailPage renders instantly.
 */
export default function ProductCard({ product }) {
    if (!product) return null;

    // Stable callback — only runs if data isn't already cached & fresh
    const handleMouseEnter = useCallback(() => {
        prefetchProduct(String(product.id));
    }, [product.id]);

    return (
        <Link
            to={`/product/${product.id}`}
            className="group block h-full"
            onMouseEnter={handleMouseEnter}
            // Also prefetch on touch-start for mobile tap-and-hold patterns
            onFocus={handleMouseEnter}
        >
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-transform duration-300 hover:scale-105 hover:shadow-md h-full flex flex-col">
                <div className="relative aspect-square w-full bg-gray-100 overflow-hidden flex items-center justify-center">
                    {product.imageUrl ? (
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            // ✅ Native lazy loading — browser only fetches when near viewport
                            loading="lazy"
                            // ✅ Async decoding keeps main thread free during image decode
                            decoding="async"
                            // ✅ Hint to browser about the final display dimensions
                            //    Prevents layout shift (good for CLS score)
                            width={400}
                            height={400}
                            className="w-full h-full object-cover object-center group-hover:opacity-90 transition-opacity"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium bg-gray-50">
                            No Image
                        </div>
                    )}
                </div>

                <div className="p-5 flex flex-col flex-grow">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                        {product.brand?.name || 'Unknown Brand'}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
                        {product.name}
                    </h3>
                    <div className="mt-auto pt-2">
                        <span className="text-[#800000] font-black text-xl">
                            ${parseFloat(product.basePrice).toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
