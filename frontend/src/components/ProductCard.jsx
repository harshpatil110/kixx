import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { prefetchProduct } from '../config/queryClient';
import { formatPrice } from '../utils/currency';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

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
    fallbackSrc,
    alt = '',
    className = '',
    ...rest
}) {
    const thumbSrc = buildThumbUrl(fallbackSrc || src);
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <img
            src={isLoaded ? src : (thumbSrc || src)}
            alt={alt}
            onLoad={() => setIsLoaded(true)}
            onError={(e) => {
                if (fallbackSrc && !e.target.src.includes(fallbackSrc)) {
                    e.target.src = fallbackSrc;
                } else {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/500x500/eeeeee/999999?text=No+Image';
                }
            }}
            className={`transition-all duration-500 ease-out ${!isLoaded && thumbSrc ? 'blur-md scale-105' : 'blur-0 scale-100'} ${className}`}
            {...rest}
        />
    );
}

export default function ProductCard({ product }) {
    const addItem = useCartStore((state) => state.addItem);
    const { user } = useAuthStore();
    const persona = user?.persona || 'Casual';

    const getPersonaBadge = () => {
        if (!product.tags && !product.category) return null;
        const tags = (Array.isArray(product.tags) ? product.tags : [product.tags, product.category]).filter(Boolean).map(t => String(t).toLowerCase());

        if (persona === 'Athlete' && (tags.includes('running') || tags.includes('performance') || tags.includes('basketball') || tags.includes('active'))) {
            return { label: 'Performance Pick', color: '#1c1917' };
        }
        if (persona === 'Sneakerhead' && (tags.includes('limited') || tags.includes('hype') || tags.includes('archive') || tags.includes('collab'))) {
            return { label: 'Hype Focus', color: '#800000' };
        }
        if (persona === 'Gifter' && (tags.includes('trend') || tags.includes('unisex') || tags.includes('classic') || tags.includes('essential'))) {
            return { label: 'Top Gift Idea', color: '#44403c' };
        }
        return null;
    };

    const personaBadge = getPersonaBadge();

    const handleMouseEnter = useCallback(() => {
        prefetchProduct(String(product.id));
    }, [product.id]);

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (product.stock === 0) {
            toast.error('Product is out of stock!');
            return;
        }

        addItem({
            ...product,
            variantId: product.id,
            price: product.basePrice,
            quantity: 1,
            stock: product.stock || 10
        });
        toast.success(`${product.name} added to cart!`, {
            style: {
                background: '#1A1A1A',
                color: '#fff',
                fontWeight: 600,
                borderRadius: '12px',
            },
            iconTheme: { primary: '#800000', secondary: '#fff' },
            duration: 2000,
        });
    };

    if (!product) return null;

    const shortId = product.id ? String(product.id).substring(0, 4).toUpperCase() : '0000';

    return (
        <div className="group cursor-pointer">
            <Link
                to={`/product/${product.id}`}
                className={`card-3d relative bg-transparent border border-outline-variant/20 aspect-[4/5] p-8 flex flex-col justify-between mb-6 shadow-sm w-full h-full block transition-all duration-300
                    ${product.isFeatured ? 'border-b-stone-900 group-hover:scale-[1.01]' : ''}`}
                onMouseEnter={handleMouseEnter}
                onFocus={handleMouseEnter}
            >
                {product.isFeatured && (
                    <div className="absolute top-4 left-4 bg-stone-900 text-white text-[8px] px-2 py-1 uppercase tracking-[0.2em] z-10 leading-none">
                        Promoted
                    </div>
                )}
                {personaBadge && !product.isFeatured && (
                    <div className="absolute top-4 left-4 text-white text-[8px] px-2 py-1 uppercase tracking-[0.2em] z-10 leading-none" style={{ backgroundColor: personaBadge.color }}>
                        {personaBadge.label}
                    </div>
                )}
                <div className="flex justify-between items-start z-10 relative">
                    <span className="font-label text-[10px] tracking-tighter text-on-surface-variant">SKU: KX-{shortId}</span>
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className="material-symbols-outlined text-on-surface-variant hover:text-tertiary transition-colors z-20">
                        favorite
                    </button>
                </div>
                
                <div className="flex-grow flex items-center justify-center p-4 z-0 relative">
                    {product.imageUrl ? (
                        <ProgressiveImage
                            src={product.imageUrl}
                            placeholderSrc={buildThumbUrl(product.imageUrl)}
                            alt={product.name}
                            loading="lazy"
                            className="w-full object-contain image-bleed transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium text-sm uppercase tracking-widest">
                            No Image
                        </div>
                    )}
                </div>
                
                {product.isNew && (
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-[#31332c] text-white text-[10px] font-bold px-3 py-1 rounded-full z-10 tracking-[0.2em]">
                        NEW
                    </div>
                )}
                
                <div className="flex justify-between items-end z-10 relative">
                    <div className="space-y-1">
                        <h3 className="font-headline font-bold text-lg tracking-tight uppercase text-on-surface">{product.name}</h3>
                        <p className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">
                            {product.brand?.name || product.category || 'Sneaker'}
                        </p>
                    </div>
                    <p className="font-body italic text-xl text-on-surface">{formatPrice(product.basePrice)}</p>
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
                    <button
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                        className={`pointer-events-auto px-6 py-3 rounded-full font-bold text-xs tracking-widest shadow-xl flex items-center gap-2 transition-all 
                            ${product.stock === 0 
                                ? 'bg-gray-400 text-white cursor-not-allowed hidden' 
                                : 'bg-surface/90 backdrop-blur-md border border-outline-variant/30 text-on-surface hover:bg-tertiary hover:text-white'}`}
                    >
                        {product.stock === 0 ? 'OUT OF STOCK' : '+ QUICK ADD'}
                    </button>
                </div>
            </Link>
        </div>
    );
}
