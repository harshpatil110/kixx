import React, { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { prefetchProduct } from '../config/queryClient';

// ---------------------------------------------------------------------------
// ProgressiveImage — Blur-up / placeholder loading in plain React
//
// Technique (same idea as next/image blur placeholder):
//  1. Render a tiny 20px×20px version of the image immediately (via a URL
//     param if your CDN supports it, or a static blur placeholder from your DB)
//  2. Load the full-res image off-screen via an Image() object
//  3. Once loaded, crossfade from the blurred thumb to the sharp hi-res version
//
// This means the user sees *something* immediately (no blank square) and the
// transition is smooth rather than a jarring pop-in.
//
// Image Source Strategy (pick one based on your setup):
//
//  A) Unsplash Source API (free, no key needed) — great for prototyping:
//       https://source.unsplash.com/400x400/?sneakers,nike
//     Add `&w=20&blur=10` for the thumbnail: not officially supported but
//     Unsplash's CDN (Imgix under the hood) accepts `?w=20&q=20` for tiny previews.
//
//  B) Cloudinary (recommended for production):
//     Full:  https://res.cloudinary.com/{cloud}/image/upload/f_auto,q_80,w_800/{id}.jpg
//     Thumb: https://res.cloudinary.com/{cloud}/image/upload/w_20,e_blur:300,q_auto/{id}.jpg
//
//  C) Imgix:
//     Full:  https://your-source.imgix.net/shoe.jpg?w=800&auto=format
//     Thumb: https://your-source.imgix.net/shoe.jpg?w=20&blur=200&auto=format
//
// For KIXX's current setup (imageUrl from DB), the component accepts an optional
// `placeholderSrc` prop. If your DB/backend doesn't generate thumbs yet,
// it gracefully falls back to a solid colour placeholder.
// ---------------------------------------------------------------------------

/**
 * Generates a tiny placeholder data-URL (a 1×1 pixel in the brand colour)
 * that we show while the full image loads.
 * Pure CSS blur-scale achieves a convincing "blurred" look at no extra cost.
 */
const BRAND_PLACEHOLDER =
    'data:image/svg+xml;base64,' +
    btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><rect width="1" height="1" fill="#e5e7eb"/></svg>`);

/**
 * Builds a low-res thumbnail URL from the full image URL.
 *
 * Supports:
 *  • Cloudinary: injects `w_20,e_blur:200,q_auto` transform parameters
 *  • Unsplash: appends `&w=20&q=10`
 *  • Generic: returns the BRAND_PLACEHOLDER (no CDN thumb available)
 *
 * @param {string} fullUrl
 * @returns {string} thumbnail URL or placeholder data-URI
 */
export function buildThumbUrl(fullUrl) {
    if (!fullUrl) return BRAND_PLACEHOLDER;

    // Cloudinary
    if (fullUrl.includes('res.cloudinary.com')) {
        return fullUrl.replace('/upload/', '/upload/w_20,e_blur:200,q_auto,f_auto/');
    }

    // Unsplash
    if (fullUrl.includes('unsplash.com')) {
        const url = new URL(fullUrl);
        url.searchParams.set('w', '20');
        url.searchParams.set('q', '10');
        return url.toString();
    }

    // Imgix
    if (fullUrl.includes('.imgix.net')) {
        const url = new URL(fullUrl);
        url.searchParams.set('w', '20');
        url.searchParams.set('blur', '200');
        url.searchParams.set('auto', 'format');
        return url.toString();
    }

    return BRAND_PLACEHOLDER;
}

/**
 * ProgressiveImage
 *
 * Props:
 *  • src           — full resolution image URL
 *  • placeholderSrc — optional pre-generated low-res thumb (overrides buildThumbUrl)
 *  • alt, className, width, height, loading, fetchPriority — forwarded to <img>
 */
export function ProgressiveImage({
    src,
    placeholderSrc,
    alt = '',
    className = '',
    width,
    height,
    loading = 'lazy',
    fetchPriority,
    ...rest
}) {
    const thumbSrc = placeholderSrc || buildThumbUrl(src);
    const [isLoaded, setIsLoaded] = useState(false);
    const [currentSrc, setCurrentSrc] = useState(thumbSrc);
    const imgRef = useRef(null);

    // When the real image finishes loading, crossfade to it
    const handleLoad = useCallback(() => {
        setCurrentSrc(src);
        setIsLoaded(true);
    }, [src]);

    // Preload the full-res image off-screen as soon as the component mounts
    React.useEffect(() => {
        if (!src) return;
        const img = new window.Image();
        img.src = src;
        img.onload = handleLoad;
        return () => { img.onload = null; };
    }, [src, handleLoad]);

    return (
        <img
            ref={imgRef}
            src={currentSrc}
            alt={alt}
            width={width}
            height={height}
            loading={loading}
            fetchPriority={fetchPriority}
            decoding="async"
            className={`transition-all duration-500 ${isLoaded ? 'blur-0 scale-100' : 'blur-sm scale-[1.04]'} ${className}`}
            {...rest}
        />
    );
}

// ---------------------------------------------------------------------------
// ProductCard
// ---------------------------------------------------------------------------

/**
 * ProductCard
 *
 * Performance features:
 *  • ProgressiveImage  — blur-up placeholder → full-res crossfade (better LCP UX)
 *  • loading="lazy"    — native browser lazy load for below-fold images
 *  • decoding="async"  — off-thread image decode
 *  • onMouseEnter prefetch — product detail data cached before user even clicks
 */
export default function ProductCard({ product }) {
    if (!product) return null;

    const handleMouseEnter = useCallback(() => {
        prefetchProduct(String(product.id));
    }, [product.id]);

    return (
        <Link
            to={`/product/${product.id}`}
            className="group block h-full"
            onMouseEnter={handleMouseEnter}
            onFocus={handleMouseEnter}
        >
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-transform duration-300 hover:scale-105 hover:shadow-md h-full flex flex-col">
                <div className="relative aspect-square w-full bg-gray-100 overflow-hidden flex items-center justify-center">
                    {product.imageUrl ? (
                        <ProgressiveImage
                            src={product.imageUrl}
                            alt={product.name}
                            loading="lazy"
                            width={400}
                            height={400}
                            className="w-full h-full object-cover object-center group-hover:opacity-90"
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
