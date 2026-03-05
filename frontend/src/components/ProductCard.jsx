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
            className="group flex flex-col relative overflow-hidden bg-white dark:bg-gray-900 rounded-[32px] p-4 border border-gray-100 dark:border-gray-800 transition-transform duration-300 hover:-translate-y-1 shadow-sm"
            onMouseEnter={handleMouseEnter}
            onFocus={handleMouseEnter}
        >
            <div className="aspect-square bg-gray-50 dark:bg-gray-800 rounded-[20px] mb-4 flex items-center justify-center p-4 relative overflow-hidden">
                {product.imageUrl ? (
                    <ProgressiveImage
                        src={product.imageUrl}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-auto object-contain transform group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium text-sm uppercase tracking-widest">
                        No Image
                    </div>
                )}

                {product.isNew && (
                    <div className="absolute top-4 left-4 bg-black text-white text-xs font-bold px-2 py-1 rounded">
                        NEW
                    </div>
                )}

                <button
                    onClick={handleAddToCart}
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-2 rounded-full font-bold text-sm tracking-wide shadow-lg w-max flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/60 dark:bg-black/60 backdrop-blur-[10px] border border-white/90 dark:border-white/30 text-black dark:text-white"
                >
                    + QUICK ADD
                </button>
            </div>

            <div className="mt-auto px-1">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-1 uppercase">
                    {product.brand?.name || product.category || 'Sneaker'}
                </p>
                <h3 className="text-lg font-bold leading-tight mb-2 text-gray-900 dark:text-white" style={{ letterSpacing: '-0.05em' }}>
                    {product.name}
                </h3>
                <p className="text-xl font-extrabold text-[#800000]">
                    {formatPrice(product.basePrice)}
                </p>
            </div>
        </Link>
    );
}
