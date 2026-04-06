import React, { useState, useEffect } from 'react';
import { Share } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProductById } from '../services/productService';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { formatPrice } from '../utils/currency';
import toast from 'react-hot-toast';
import ARTryOn from '../components/ARTryOn';
import { StyleMatchBadge, GuestStyleMatchInfo } from '../components/RecommendedFeed';
import api from '../services/api';

export default function ProductDetailPage() {
    const { id } = useParams();
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showAR, setShowAR] = useState(false);
    const [styleMatchScore, setStyleMatchScore] = useState(null);
    const user = useAuthStore(state => state.user);
    const userId = user?.id || null;

    useEffect(() => {
        if (userId && id) {
            api.post('/api/recommendations/interaction', {
                userId, productId: id, actionType: 'view'
            }).catch(() => {}); 
        }
    }, [userId, id]);

    useEffect(() => {
        if (userId && id) {
            api.get(`/api/recommendations/style-match/${userId}/${id}`)
                .then(r => setStyleMatchScore(r.data.score))
                .catch(() => {});
        }
    }, [userId, id]);

    const addItem = useCartStore((state) => state.addItem);
    const navigate = useNavigate();

    const { data: product, isLoading, isError, error } = useQuery({
        queryKey: ['product', id],
        queryFn: () => getProductById(id),
        enabled: !!id,
        notifyOnChangeProps: ['data', 'isLoading', 'isError', 'error'],
    });

    const handleAddToCart = () => {
        if (!selectedVariant || selectedVariant.stock <= 0) {
            toast.error('Please select an available size.');
            return;
        }

        const currentStock = parseInt(product.stock, 10) || 0;
        if (currentStock <= 0) {
            return toast.error('This product is currently out of stock.');
        }

        const cartItems = useCartStore.getState().items;
        const existingQty = cartItems
            .filter(item => item.productId === product.id)
            .reduce((sum, item) => sum + item.quantity, 0);

        if (existingQty + 1 > currentStock) {
            return toast.error(`Only ${currentStock} pairs left in stock!`);
        }

        const priceToUse = selectedVariant.price ? parseFloat(selectedVariant.price) : parseFloat(product.basePrice);
        addItem({
            productId: product.id, name: product.name, imageUrl: product.imageUrl,
            variantId: selectedVariant.id, size: selectedVariant.size, color: selectedVariant.color,
            price: priceToUse, stock: selectedVariant.stock, quantity: 1,
        });
        
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        
        toast.success(`${product.name} added to cart!`, {
            style: { background: '#1A1A1A', color: '#fff', fontWeight: 600, borderRadius: '12px' },
            iconTheme: { primary: '#625d5b', secondary: '#fff' },
            duration: 2000,
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-surface relative flex items-center justify-center">
                <div className="w-14 h-14 border-4 border-on-surface border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            </div>
        );
    }

    if (isError || !product) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center px-8">
                <div className="text-center max-w-sm">
                    <h2 className="font-headline font-black text-5xl uppercase mb-4 text-on-surface tracking-tighter">Not Found</h2>
                    <p className="text-on-surface-variant font-body mb-8 italic text-xl">{error?.message || 'This product could not be found.'}</p>
                    <Link to="/catalog" className="inline-flex items-center gap-2 bg-on-surface text-surface py-4 px-8 font-headline font-bold uppercase tracking-widest hover:bg-primary-dim transition-all">
                        <span className="material-symbols-outlined">arrow_back</span>
                        Back to Catalog
                    </Link>
                </div>
            </div>
        );
    }

    const productStock = parseInt(product?.stock, 10) || 0;
    const isOutOfStock = productStock === 0;
    const displayPrice = selectedVariant?.price ? parseFloat(selectedVariant.price) : parseFloat(product?.basePrice || 0);

    // Extract unique variants
    const productVariants = product.variants || [];
    const uniqueVariants = productVariants.reduce((acc, curr) => {
        if (!acc.some(v => v.id === curr.id)) acc.push(curr);
        return acc;
    }, []);

    // Helper to select variant
    const onSelectVariant = (variant) => {
        if (variant.stock > 0) setSelectedVariant(variant);
    };

    return (
        <div className="font-body text-on-surface selection:bg-tertiary/20 bg-surface min-h-screen">
            <style>{`
                .tracking-tighter-extreme { letter-spacing: -0.06em; }
            `}</style>

            <main className="pt-24 pb-24 px-8 max-w-screen-2xl mx-auto">
                <div className="mb-8 flex items-center gap-2 font-headline text-[10px] uppercase tracking-widest text-on-surface-variant">
                    <Link to="/" className="hover:text-tertiary transition-colors">Home</Link>
                    <span>/</span>
                    <Link to="/catalog" className="hover:text-tertiary transition-colors">Archive</Link>
                    <span>/</span>
                    <span className="text-on-surface font-bold">{product.name}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-20 items-start">
                    {/* Left: Sticky Gallery */}
                    <div className="md:col-span-7 lg:col-span-8 space-y-20">
                        <div className="relative group overflow-hidden bg-surface-container-low">
                            <img 
                                className="w-full aspect-[4/5] object-cover mix-blend-multiply" 
                                src={product.imageUrl || 'https://placehold.co/800x1000?text=No+Image'} 
                                alt={product.name} 
                            />
                            {product.isNew && (
                                <div className="absolute top-8 left-8">
                                    <span className="font-headline font-bold text-[0.625rem] tracking-[0.25em] bg-surface px-4 py-2 uppercase border border-outline-variant/20">
                                        New Arrival
                                    </span>
                                </div>
                            )}
                            
                            {product.arModelUrl && (
                                <button
                                    onClick={() => setShowAR(true)}
                                    className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-surface/80 backdrop-blur-md px-6 py-3 font-headline font-bold uppercase tracking-widest text-on-surface border border-outline-variant/20 shadow-lg hover:bg-surface transition-all flex items-center gap-2 z-20"
                                >
                                    <span className="material-symbols-outlined">view_in_ar</span>
                                    Try in AR
                                </button>
                            )}
                        </div>

                        {/* Additional images mapped dynamically. If we have them in product.images, map them. Else fallback to placeholder grid like Stitch. */}
                        <div className="grid grid-cols-2 gap-12">
                            {product.images?.length > 1 ? product.images.slice(1, 5).map((imgUrl, i) => (
                                <img key={i} className="w-full aspect-square object-cover" src={imgUrl} alt={`${product.name} detail ${i}`} />
                            )) : (
                                // No multiple images? Add placeholders or duplicate image to replicate design ethos.
                                <>
                                    <img className="w-full aspect-square object-cover mix-blend-multiply" src={product.imageUrl || 'https://placehold.co/600x600'} alt="detail 1" />
                                    <img className="w-full aspect-square object-cover mix-blend-multiply" src={product.imageUrl || 'https://placehold.co/600x600'} alt="detail 2" />
                                </>
                            )}
                        </div>

                        {/* Product Narrative / Description */}
                        <div className="py-24 border-t border-outline-variant/15">
                            <h3 className="font-headline font-bold text-[10px] tracking-[0.3em] uppercase mb-10 text-on-surface-variant">The Narrative</h3>
                            <p className="font-body text-2xl md:text-3xl leading-relaxed text-on-surface max-w-2xl">
                                {product.description || `The ${product.name} is an exercise in restraint. Drawing inspiration from brutalism and organic bone structures, this silhouette bridges the gap between high-performance engineering and wearable sculpture.`}
                            </p>
                        </div>
                    </div>

                    {/* Right: Product Info (Sticky) */}
                    <div className="md:col-span-5 lg:col-span-4 md:sticky md:top-32 space-y-16">
                        <header className="space-y-6">
                            <div className="flex justify-between items-end border-b border-outline-variant/10 pb-4">
                                <span className="font-headline font-bold text-[10px] tracking-[0.3em] text-on-surface-variant uppercase">{product.brand?.name || 'Original Series'}</span>
                                <span className="font-body italic text-xl text-on-surface-variant">{formatPrice(displayPrice)}</span>
                            </div>
                            <h1 className="font-headline font-black text-6xl lg:text-7xl xl:text-8xl leading-[0.85] tracking-tighter-extreme text-on-surface uppercase -ml-2 break-words">
                                {product.name.split(' ').map((word, i) => <React.Fragment key={i}>{word}<br/></React.Fragment>)}
                            </h1>
                            
                            {/* Style Match Badge */}
                            <div className="pt-2">
                                {userId ? (
                                    styleMatchScore !== null && <StyleMatchBadge score={styleMatchScore} />
                                ) : (
                                    <GuestStyleMatchInfo />
                                )}
                            </div>
                            
                            {/* Stock Indicator */}
                            <div className="pt-2">
                                {productStock > 20 ? (
                                    <p className="font-headline text-[10px] tracking-[0.2em] font-bold text-emerald-700 uppercase flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> In Stock
                                    </p>
                                ) : productStock > 0 ? (
                                    <p className="font-headline text-[10px] tracking-[0.2em] font-bold text-error uppercase flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" /> {productStock} Limited Pairs
                                    </p>
                                ) : (
                                    <p className="font-headline text-[10px] tracking-[0.2em] font-bold text-outline uppercase flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-outline" /> Out of Stock
                                    </p>
                                )}
                            </div>
                        </header>

                        <div className="space-y-12">
                            {/* Variant Grid */}
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <span className="font-headline font-bold text-[10px] tracking-[0.3em] uppercase">Select Variant</span>
                                    <button className="font-body italic text-xs text-on-surface-variant hover:text-on-surface underline underline-offset-4">Size Guide</button>
                                </div>
                                <div className="grid grid-cols-4 gap-0 border border-outline-variant/20">
                                    {uniqueVariants.length > 0 ? uniqueVariants.map((variant, index) => {
                                        const isSelected = selectedVariant?.id === variant.id;
                                        const isOOS = variant.stock <= 0;
                                        
                                        // Adding border classes to mimic the dense grid style of Stitch
                                        const borderClasses = "border-outline-variant/20 " + 
                                            ((index + 1) % 4 !== 0 ? "border-r " : "") + 
                                            (index < uniqueVariants.length - 4 ? "border-b " : "");

                                        return (
                                            <button 
                                                key={variant.id}
                                                onClick={() => onSelectVariant(variant)}
                                                disabled={isOOS}
                                                className={`h-14 flex items-center justify-center font-headline font-bold text-[11px] transition-all ${borderClasses} ${isSelected ? 'bg-on-surface text-surface ring-1 ring-inset ring-blue-300' : isOOS ? 'opacity-20 cursor-not-allowed bg-surface-container-low' : 'hover:bg-surface-container-low/50'}`}
                                            >
                                                {variant.size || variant.color || `Opt ${index+1}`}
                                            </button>
                                        );
                                    }) : (
                                        <div className="col-span-4 h-14 flex items-center justify-center font-headline font-bold text-[11px] text-on-surface-variant bg-surface-container-low border border-outline-variant/20 opacity-50">
                                            No explicit sizes (One Size)
                                        </div>
                                    )}
                                </div>
                                {selectedVariant && (
                                    <p className="font-body text-xs italic text-on-surface-variant">
                                        Selected: '{selectedVariant.size} {selectedVariant.color}'
                                    </p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="space-y-4 pt-6">
                                <button 
                                    onClick={handleAddToCart}
                                    className={`w-full py-6 font-headline font-bold text-[11px] tracking-[0.3em] uppercase transition-all duration-300 ${isOutOfStock ? 'bg-surface-container-high text-on-surface-variant cursor-not-allowed' : !selectedVariant && uniqueVariants.length > 0 ? 'bg-on-surface/50 text-surface cursor-not-allowed' : showSuccess ? 'bg-emerald-700 text-white' : 'bg-on-surface text-surface hover:bg-primary-dim'}`}
                                >
                                    {isOutOfStock ? 'Sold Out' : showSuccess ? 'Added to Archive' : 'Add to Cart'}
                                </button>
                            </div>

                            {/* Specs Box */}
                            <div className="space-y-6 pt-12 border-t border-outline-variant/15">
                                <div className="flex flex-col gap-5">
                                    <div className="flex justify-between">
                                        <span className="font-headline font-bold text-[10px] tracking-[0.2em] text-on-surface-variant uppercase">SKU</span>
                                        <span className="font-headline text-[10px] tracking-[0.2em] text-on-surface">KX-{product.id.substring(0,6).toUpperCase()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-headline font-bold text-[10px] tracking-[0.2em] text-on-surface-variant uppercase">Category</span>
                                        <span className="font-headline text-[10px] tracking-[0.2em] text-on-surface">{product.category || 'Footwear'}</span>
                                    </div>
                                    {product.brand?.name && (
                                        <div className="flex justify-between">
                                            <span className="font-headline font-bold text-[10px] tracking-[0.2em] text-on-surface-variant uppercase">Curator</span>
                                            <span className="font-headline text-[10px] tracking-[0.2em] text-on-surface">{product.brand.name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Section (Static visual replica for cohesive narrative) */}
                <section className="mt-48 space-y-16">
                    <h2 className="font-headline font-black text-5xl tracking-tighter uppercase">The Collection</h2>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-[900px]">
                        <div className="md:col-span-8 relative overflow-hidden bg-surface-container-low group">
                            <img className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA72m0i4FoOE9u63FKA-r9CHjvng6I10g3YV7klQV3fIbaJejMesG6nX4HcOYKFJoBOrbXmYKyPRqj7FdfYkZ_00e2tXgOwvmbKspB8uSOICj0yakiGrwhx2d46EglHLzfseYuCHz8n7-Ojrc1wI71qSxIC9Z34Wr1bNwNxcNfUc6FEPAhsTbP4IWDOwKq2x0Tpe5yZ9Ue33CXNtzOqaqSDDrpCDldl2wFfVpr9HOqbVpGY2MO6dFbCTCrCSrSwe7N4Ojop8smUt_Kn" alt="Editorial" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-16">
                                <span className="text-white/60 font-headline font-bold text-[10px] tracking-[0.4em] uppercase mb-6">Editorial</span>
                                <h3 className="text-white text-6xl font-headline font-black tracking-tighter-extreme mb-8 leading-none">THE BRUTALIST<br/>ETHOS</h3>
                                <Link to="/catalog" className="text-white font-body italic border-b border-white/40 self-start pb-1 text-lg">Read the Story</Link>
                            </div>
                        </div>
                        <div className="md:col-span-4 flex flex-col gap-8">
                            <div className="h-1/2 relative overflow-hidden bg-surface-container-low group">
                                <img className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCY8QnXXR_LYWf6i_d5JVJ4jrvdIZj0hJTdc6_OjynUktayMPdIQmmnXbCweDkn7PYTz5bpgSarg2FwUItrMCXtb4B2UUq5meE3ER8jkEW-c1KmkTB6FHmQgEOWEw7y5duQcv5GD_7ljlTnFmuHVjykRMxm10p0TNGa_odA8eTmrMAF4WRIUZNJhemhwudBc3N3qxYgJhmTbRrQDqkdEKxQlor2y2BMo9I42y_0rbekeQLp4SA1K-dOKqDLsKQM9RP9_pgBtwJsq3jK" alt="Detail" />
                                <div className="absolute bottom-8 left-8 right-8 p-6 bg-surface border border-outline-variant/10">
                                    <p className="font-headline font-bold text-[10px] tracking-[0.3em] uppercase text-on-surface">Material Archive</p>
                                </div>
                            </div>
                            <div className="h-1/2 relative overflow-hidden bg-surface-container-low group">
                                <img className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCu2CehKqFLfE_kmoEYWT8Tl9bJnafsHfDMH7e8ugqhkH4WUdR0h-tavm1TBGv0OsMSYfo4MTQtn_r2BjGKhM8QBd9tL4oWonvwJfeKQSSvNAChckqyV8aTXainn9Pts1pZCHcmd2geO2KYZ2g7IZUDcp7IN_tf4YkH0W860apu6k67hRQwg7L7j2OrRuevKDb366OKNeBE9s_242wZLYDeH10N_rPl8RLOxgfUHyNwY7rPAeot26DSsXzGq9srnA9YhLbaoxQ19YuL" alt="Lookbook" />
                                <div className="absolute bottom-8 left-8 right-8 p-6 bg-surface border border-outline-variant/10">
                                    <p className="font-headline font-bold text-[10px] tracking-[0.3em] uppercase text-on-surface">Lookbook FW24</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Floating Action Bar (CRITICAL DIRECTIVE 4) */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:w-auto min-w-[320px] max-w-lg z-50">
                <div className="rounded-none px-6 py-4 flex items-center justify-between gap-6
                    bg-surface/90
                    backdrop-blur-xl border border-outline-variant/30
                    shadow-xl">

                    {/* Total Price */}
                    <div className="hidden md:flex flex-col">
                        <span className="font-headline text-[10px] tracking-[0.2em] font-bold text-on-surface-variant uppercase">Total</span>
                        <span className="text-xl font-body italic text-on-surface">{formatPrice(displayPrice)}</span>
                    </div>

                    {/* Primary CTA */}
                    <button
                        onClick={handleAddToCart}
                        className={`flex-1 px-8 py-4 font-headline font-bold text-[11px] tracking-[0.3em] uppercase transition-all
                            ${isOutOfStock ? 'bg-surface-container-high text-on-surface-variant cursor-not-allowed' 
                            : !selectedVariant && uniqueVariants.length > 0 ? 'bg-on-surface/50 text-surface cursor-not-allowed'
                            : showSuccess ? 'bg-emerald-700 text-white' : 'bg-on-surface text-surface hover:bg-primary-dim'}`}
                    >
                        {isOutOfStock ? 'Sold Out' : showSuccess ? 'Added!' : !selectedVariant && uniqueVariants.length > 0 ? 'Select Size' : 'Add To Cart'}
                    </button>
                    
                    {/* Share icon */}
                    <button className="w-12 h-12 flex-shrink-0 flex items-center justify-center border border-outline-variant/30 hover:bg-on-surface hover:text-surface transition-colors text-on-surface">
                        <Share size={18} className="transition-colors" />
                    </button>
                </div>
            </div>

            {showAR && product.arModelUrl && (
                <ARTryOn
                    modelUrl={product.arModelUrl}
                    placement={product.arPlacement}
                    scale={product.arScale}
                    onClose={() => setShowAR(false)}
                />
            )}
        </div>
    );
}
