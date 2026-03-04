import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { prefetchProduct } from '../config/queryClient';
import { formatPrice } from '../utils/currency';
import useCartStore from '../store/cartStore';

export function buildThumbUrl(fullUrl) {
    if (!fullUrl) return null;
    if (fullUrl.includes('res.cloudinary.com')) {
        return fullUrl.replace('/upload/', '/upload/w_20,e_blur:200,q_auto,f_auto/');
    }
    if (fullUrl.includes('unsplash.com')) {
        const url = new URL(fullUrl);
        url.searchParams.set('w', '20');
        url.searchParams.set('q', '10');
        return url.toString();
    }
    return null;
}

export function ProgressiveImage({
    src,
    alt = '',
    className = '',
    ...rest
}) {
    const thumbSrc = buildThumbUrl(src);
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <img
            src={isLoaded ? src : (thumbSrc || src)}
            alt={alt}
            onLoad={() => setIsLoaded(true)}
            className={`transition-all duration-500 ease-out ${!isLoaded && thumbSrc ? 'blur-md scale-105' : 'blur-0 scale-100'} ${className}`}
            {...rest}
        />
    );
}

export default function ProductCard({ product }) {
    const addItem = useCartStore((state) => state.addItem);

    const handleMouseEnter = useCallback(() => {
        prefetchProduct(String(product.id));
    }, [product.id]);

    const handleAddToCart = (e) => {
        e.preventDefault();
        addItem({
            ...product,
            variantId: product.id,
            price: product.basePrice,
            quantity: 1,
            stock: product.stock || 10
        });
    };

    if (!product) return null;

    return (
        <Link
            to={`/product/${product.id}`}
            className="group block cursor-pointer"
            onMouseEnter={handleMouseEnter}
            onFocus={handleMouseEnter}
        >
            <div className="relative w-full aspect-square bg-[#f7f7f7] dark:bg-[#222222] mb-4 overflow-hidden flex items-center justify-center p-6">
                {product.imageUrl ? (
                    <ProgressiveImage
                        src={product.imageUrl}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-500 ease-out mix-blend-multiply dark:mix-blend-normal"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#666666] dark:text-[#a0a0a0] font-medium text-sm uppercase tracking-widest">
                        No Image
                    </div>
                )}

                {product.isNew && (
                    <div className="absolute top-4 left-4 bg-white dark:bg-[#111111] text-black dark:text-white text-xs font-bold px-2 py-1 uppercase tracking-wider shadow-sm">
                        New
                    </div>
                )}

                <div className="absolute inset-x-0 bottom-[-50px] group-hover:bottom-4 px-4 transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100 flex justify-center z-10">
                    <button
                        onClick={handleAddToCart}
                        className="w-full max-w-[200px] py-3 bg-black dark:bg-white text-white dark:text-black text-xs font-bold tracking-widest uppercase hover:bg-[#5c0000] hover:text-white dark:hover:bg-[#5c0000] dark:hover:text-white transition-colors shadow-lg"
                    >
                        Add to Cart
                    </button>
                </div>
            </div>

            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xs font-bold text-[#666666] dark:text-[#a0a0a0] uppercase tracking-widest mb-1 line-clamp-1">
                        {product.brand?.name || product.category || 'Sneaker'}
                    </h3>
                    <h2 className="text-base font-bold text-black dark:text-white leading-snug line-clamp-2 pr-4">
                        {product.name}
                    </h2>
                </div>
                <span className="text-base font-bold text-black dark:text-white ml-2 whitespace-nowrap">
                    {formatPrice(product.basePrice)}
                </span>
            </div>
        </Link>
    );
}
