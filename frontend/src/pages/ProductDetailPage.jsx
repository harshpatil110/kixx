import React, { useState } from 'react';
import { Share } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProductById } from '../services/productService';
import useCartStore from '../store/cartStore';
import { formatPrice } from '../utils/currency';
import VariantSelector from '../components/VariantSelector';
import ARTryOn from '../components/ARTryOn';

/*
  STITCH LIGHT THEME — pdp.html (KIXX Liquid Glass PDP)
  ──────────────────────────────────────────────────────
  body: bg-[#f5f5f5]  text-gray-900  font-body:Inter  min-h-screen
  .orb: fixed rounded-full blur-[80px] z-[-1] opacity-50
    orb1: w-[500px] h-[500px] bg-red-200      top-[-100px]   left-[-100px]
    orb2: w-[400px] h-[400px] bg-blue-200     bottom-[-50px] right-[-100px]
    animation: float 20s infinite ease-in-out alternate
    @keyframes float: translate(0,0)→translate(50px,-50px) scale(1)→scale(1.1)

  GLASS BUTTONS (back / fav / size) — LIGHT:
    bg: rgba(255,255,255,0.7)
    border: 1px solid rgba(255,255,255,0.2)
    backdrop-filter: blur(16px)
    box-shadow: 0 8px 32px 0 rgba(31,38,135,0.1)
    text: text-gray-900

  Size btn LIGHT (default):
    bg: rgba(255,255,255,0.7)  border: rgba(255,255,255,0.2)  blur(16px)
    text-gray-900  hover:-translate-y-1 hover:border-primary
  Size btn ACTIVE:  border-2 border-[#800000]  font-bold
  Size btn OOS:     opacity-50 cursor-not-allowed

  Product name h1: font-display (Anton) text-gray-900
  Price p: text-gray-900
  Desc p: text-gray-600

  Fixed bottom bar — LIGHT glass:
    rounded-[32px]
    bg: rgba(255,255,255,0.7)
    border: rgba(255,255,255,0.2)
    backdrop-filter: blur(16px)
    shadow-[0_20px_40px_rgba(0,0,0,0.1)]
  Price label: text-gray-500  price value: text-gray-900
  share btn: bg-white/10  text-gray-900
  Add-to-cart btn: bg-[#800000] text-white  hover:bg-[#600000]  rounded-[24px]
*/
export default function ProductDetailPage() {
    const { id } = useParams();
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showAR, setShowAR] = useState(false);
    const addItem = useCartStore((state) => state.addItem);
    const navigate = useNavigate();

    const { data: product, isLoading, isError, error } = useQuery({
        queryKey: ['product', id],
        queryFn: () => getProductById(id),
        enabled: !!id,
        notifyOnChangeProps: ['data', 'isLoading', 'isError', 'error'],
    });

    const handleAddToCart = () => {
        if (!selectedVariant || selectedVariant.stock <= 0) return;
        const priceToUse = selectedVariant.price ? parseFloat(selectedVariant.price) : parseFloat(product.basePrice);
        addItem({
            productId: product.id, name: product.name, imageUrl: product.imageUrl,
            variantId: selectedVariant.id, size: selectedVariant.size, color: selectedVariant.color,
            price: priceToUse, stock: selectedVariant.stock, quantity: 1,
        });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const isAddToCartDisabled = !selectedVariant || selectedVariant.stock <= 0;
    const displayPrice = selectedVariant?.price
        ? parseFloat(selectedVariant.price)
        : parseFloat(product?.basePrice || 0);

    /* Inline orb animation */
    const orbStyle = `
        @keyframes orb-float {
            0%   { transform: translate(0,0) scale(1); }
            100% { transform: translate(50px,-50px) scale(1.1); }
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    `;

    /* Loading */
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f5f5f5] relative overflow-x-hidden flex items-center justify-center">
                <div className="fixed w-[500px] h-[500px] rounded-full bg-red-200 top-[-100px] left-[-100px] blur-[80px] opacity-50 z-[-1]" />
                <div className="fixed w-[400px] h-[400px] rounded-full bg-blue-200 bottom-[-50px] right-[-100px] blur-[80px] opacity-50 z-[-1]" />
                <div className="text-center">
                    <div className="w-14 h-14 border-4 border-[#800000] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-medium uppercase tracking-widest text-sm font-[Inter,sans-serif]">Loading</p>
                </div>
            </div>
        );
    }

    /* Error */
    if (isError || !product) {
        return (
            <div className="min-h-screen bg-[#f5f5f5] relative overflow-x-hidden flex items-center justify-center px-8">
                <div className="fixed w-[500px] h-[500px] rounded-full bg-red-200 top-[-100px] left-[-100px] blur-[80px] opacity-50 z-[-1]" />
                <div className="text-center max-w-sm">
                    <h2 className="font-[Anton,sans-serif] text-5xl uppercase mb-4 text-gray-900">Not Found</h2>
                    <p className="text-gray-500 mb-8 font-[Inter,sans-serif]">{error?.message || 'This product could not be found.'}</p>
                    <Link to="/catalog" className="inline-flex items-center gap-2 bg-[#800000] text-white rounded-full px-8 py-3 font-bold uppercase tracking-widest hover:bg-[#600000] transition-colors">
                        <span className="material-icons">arrow_back</span>
                        Back to Catalog
                    </Link>
                </div>
            </div>
        );
    }

    return (
        /* Stitch body: bg-[#f5f5f5] text-gray-900 font-body(Inter) min-h-screen relative overflow-x-hidden */
        <div className="bg-[#f5f5f5] text-gray-900 font-[Inter,sans-serif] min-h-screen relative overflow-x-hidden transition-colors duration-300">
            <style>{orbStyle}</style>

            {/* Stitch orb-1: fixed w-[500px] h-[500px] bg-red-200 top-[-100px] left-[-100px] blur-[80px] opacity-50 */}
            <div className="fixed w-[500px] h-[500px] rounded-full bg-red-200 top-[-100px] left-[-100px] blur-[80px] opacity-50 z-[-1]"
                style={{ animation: 'orb-float 20s infinite ease-in-out alternate' }} />
            <div className="fixed w-[400px] h-[400px] rounded-full bg-blue-200 bottom-[-50px] right-[-100px] blur-[80px] opacity-50 z-[-1]"
                style={{ animation: 'orb-float 20s infinite ease-in-out alternate', animationDelay: '-5s' }} />

            {/* Stitch: main.w-full.min-h-screen.flex.flex-col.md:flex-row.pb-24.md:pb-0 */}
            <main className="w-full min-h-screen flex flex-col md:flex-row pb-24 md:pb-0">

                {/* LEFT: Stitch section.w-full.md:w-1/2.h-[50vh].md:h-screen.sticky.top-0.md:relative.z-10 */}
                <section className="w-full md:w-1/2 h-[50vh] md:h-screen sticky top-0 md:relative z-10">
                    <div className="w-full h-full relative overflow-hidden hide-scrollbar flex snap-x snap-mandatory overflow-x-auto">
                        {/* Stitch: img.w-full.h-full.object-cover.shrink-0.snap-center */}
                        {product.imageUrl ? (
                            <img
                                src={product.imageUrl} alt={product.name}
                                className="w-full h-full object-cover shrink-0 snap-center"
                                loading="eager" fetchPriority="high" decoding="async"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 uppercase tracking-widest shrink-0 snap-center">
                                No Image
                            </div>
                        )}
                        
                        {product.arModelUrl && (
                            <button
                                onClick={() => setShowAR(true)}
                                className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-white/70 backdrop-blur-md px-6 py-2 rounded-full font-bold uppercase tracking-widest text-[#800000] border border-white/50 shadow-lg hover:scale-105 transition-transform flex items-center gap-2 z-20"
                            >
                                <span className="material-icons">view_in_ar</span>
                                Try in AR
                            </button>
                        )}

                        {/* Stitch: dots div.absolute.bottom-6.left-1/2.-translate-x-1/2.flex.gap-2 */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-white opacity-100" />
                            <div className="w-2 h-2 rounded-full bg-white opacity-50" />
                            <div className="w-2 h-2 rounded-full bg-white opacity-50" />
                        </div>
                    </div>

                    {/* Back button — LIGHT glass: rgba(255,255,255,0.7) blur(16px) border rgba(255,255,255,0.2) */}
                    <button onClick={() => navigate(-1)}
                        className="absolute top-6 left-6 w-12 h-12 flex items-center justify-center rounded-full z-20
                            bg-[rgba(255,255,255,0.7)]
                            border border-[rgba(255,255,255,0.2)]
                            backdrop-blur-[16px] [-webkit-backdrop-filter:blur(16px)]
                            shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]
                            transition-transform hover:scale-105 text-gray-900">
                        <span className="material-icons">arrow_back</span>
                    </button>

                    {/* Fav button — same LIGHT glass */}
                    <button className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full z-20
                            bg-[rgba(255,255,255,0.7)]
                            border border-[rgba(255,255,255,0.2)]
                            backdrop-blur-[16px] [-webkit-backdrop-filter:blur(16px)]
                            shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]
                            transition-transform hover:scale-105 text-gray-900">
                        <span className="material-icons">favorite_border</span>
                    </button>
                </section>

                {/* RIGHT: Stitch section.w-full.md:w-1/2.p-8.md:p-16.lg:p-24.flex.flex-col.justify-center.min-h-[50vh].z-20 */}
                <section className="w-full md:w-1/2 p-8 md:p-16 lg:p-24 flex flex-col justify-center min-h-[50vh] z-20">
                    <div className="max-w-xl">
                        {/* Stitch: p.text-sm.font-semibold.tracking-widest.uppercase.text-gray-500.mb-4 */}
                        <p className="text-sm font-semibold tracking-widest uppercase text-gray-500 mb-4">
                            {product.brand?.name || 'New Release'}
                        </p>
                        {/* Stitch: h1.font-display(Anton).text-6xl.md:text-8xl.lg:text-9xl.uppercase.leading-[0.85].tracking-tight.mb-6 text-gray-900 */}
                        <h1 className="font-[Anton,sans-serif] text-6xl md:text-8xl lg:text-9xl uppercase leading-[0.85] tracking-tight mb-6 text-gray-900">
                            {product.name}
                        </h1>
                        {/* Stitch: p.text-3xl.md:text-4xl.font-medium.mb-12  text-gray-900 */}
                        <p className="text-3xl md:text-4xl font-medium mb-12 text-gray-900">
                            {formatPrice(displayPrice)}
                        </p>
                        {/* Stitch: div.mb-12.space-y-4.text-gray-600 */}
                        <div className="mb-12 space-y-4 text-gray-600">
                            <p>{product.description || 'Designed for the city streets. Engineered for the culture.'}</p>
                        </div>

                        {/* Size section */}
                        <div className="mb-12">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold uppercase tracking-wider text-sm text-gray-900">Select Size</h3>
                                <a href="#" className="text-sm text-gray-500 hover:text-[#800000] transition-colors underline decoration-dotted">
                                    Size Guide
                                </a>
                            </div>
                            <VariantSelector variants={product.variants || []} onSelectVariant={setSelectedVariant} />
                        </div>

                        {/* Accordion — Stitch: div.border-t.border-gray-200 */}
                        <div className="border-t border-gray-200">
                            <div className="py-6 flex justify-between items-center cursor-pointer group">
                                <h4 className="font-[Anton,sans-serif] text-xl uppercase tracking-wider group-hover:text-[#800000] transition-colors text-gray-900">
                                    Product Details
                                </h4>
                                <span className="material-icons text-gray-400 group-hover:text-[#800000] transition-colors">add</span>
                            </div>
                            <div className="border-t border-gray-200" />
                            <div className="py-6 flex justify-between items-center cursor-pointer group">
                                <h4 className="font-[Anton,sans-serif] text-xl uppercase tracking-wider group-hover:text-[#800000] transition-colors text-gray-900">
                                    Delivery &amp; Returns
                                </h4>
                                <span className="material-icons text-gray-400 group-hover:text-[#800000] transition-colors">add</span>
                            </div>
                            <div className="border-t border-gray-200" />
                        </div>

                        {/* Stitch: div.h-24.md:hidden  (spacer) */}
                        <div className="h-24 md:hidden" />
                    </div>
                </section>
            </main>

            {/* Fixed bottom bar — LIGHT glass */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:w-auto max-w-lg z-50">
                <div className="rounded-full px-6 py-4 flex items-center justify-between gap-6
                    bg-white/70
                    backdrop-blur-xl [-webkit-backdrop-filter:blur(24px)]
                    border border-white/50
                    shadow-[0_8px_32px_rgba(0,0,0,0.08)]">

                    {/* Total Price */}
                    <div className="hidden md:flex flex-col">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Price</span>
                        <span className="text-2xl font-bold text-[#111111] leading-tight">{formatPrice(displayPrice)}</span>
                    </div>

                    {/* Share icon */}
                    <button className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors">
                        <Share size={20} className="text-gray-600 hover:text-black cursor-pointer transition-colors" />
                    </button>

                    {/* Primary CTA */}
                    <button
                        onClick={handleAddToCart}
                        disabled={isAddToCartDisabled}
                        className="px-8 py-3 text-sm font-bold tracking-wide uppercase
                            rounded-full bg-[#800000] text-white hover:bg-black
                            transition-colors shadow-lg
                            disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {showSuccess ? 'Added!' : isAddToCartDisabled ? 'Select Size' : 'Add To Cart'}
                    </button>
                </div>
            </div>

            {/* Fullscreen AR Try On Modal */}
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
