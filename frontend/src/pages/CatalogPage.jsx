import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../services/productService';
import { formatPrice } from '../utils/currency';
import useCartStore from '../store/cartStore';
import { prefetchProduct } from '../config/queryClient';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/*
  STITCH LIGHT THEME — catalog.html
  ────────────────────────────────────────
  body bg: #ffffff  text: gray-900  font: Inter
  body bg-image: radial-gradient(circle at 10% 20%, rgba(200,200,200,0.2) 0%, transparent 40%),
                 radial-gradient(circle at 90% 80%, rgba(128,0,0,0.1) 0%, transparent 40%)
  bg-attachment: fixed

  .liquid-glass (LIGHT):
    background: rgba(255,255,255,0.4)
    backdrop-filter: blur(20px)
    border-top: 1px solid rgba(255,255,255,0.8)
    border-left: 1px solid rgba(255,255,255,0.8)
    box-shadow: 0 8px 32px 0 rgba(0,0,0,0.1)

  product-card: bg-white  border-gray-100
  product-card image box: bg-gray-50
  quick-add-btn (LIGHT): bg rgba(255,255,255,0.6) border rgba(255,255,255,0.9)
  h1/h2/h3 nav-logo: letter-spacing -0.05em
  primary: #800000
*/

function ProductCard({ product }) {
    const addItem = useCartStore((state) => state.addItem);
    const navigate = useNavigate();

    const handleMouseEnter = () => { prefetchProduct(String(product.id)); };

    /* Card-level click: navigate ONLY if the click did NOT originate from the quick-add button */
    const handleCardClick = (e) => {
        if (e.target.closest('[data-quick-add]')) return;   // ← bail out
        navigate('/product/' + product.id);
    };

    /* Quick-add click: triple-guarded so navigation never fires */
    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        addItem({
            ...product,
            variantId: product.id,
            price: parseFloat(product.basePrice),
            quantity: 1,
            stock: product.stock || 10,
        });
    };

    if (!product) return null;

    return (
        <div
            onClick={handleCardClick}
            onMouseEnter={handleMouseEnter}
            onFocus={handleMouseEnter}
            /* Stitch: product-card bg-white rounded-2xl p-4 flex flex-col relative overflow-hidden group
               border border-gray-100  transition:transform 0.3s ease  hover:translateY(-5px) */
            className="group bg-white rounded-2xl p-4 flex flex-col relative overflow-hidden border border-gray-100 transition-transform duration-[300ms] ease-[ease] hover:-translate-y-[5px] cursor-pointer"
        >
            {/* Image area — relative wrapper (no overflow-hidden here so quick-add stays visible) */}
            <div className="aspect-square w-full bg-gray-50 rounded-xl mb-4 relative">
                {/* Inner image box — pointer-events-none so clicks pass through to the button */}
                <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                    {product.imageUrl ? (
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            loading="lazy"
                            className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm uppercase tracking-widest">No Image</div>
                    )}
                </div>

                {/* Badges: NEW / SALE */}
                {product.isNew && (
                    <div className="absolute top-4 left-4 bg-black text-white text-xs font-bold px-2 py-1 rounded z-10">NEW</div>
                )}
                {product.isOnSale && (
                    <div className={`absolute top-4 ${product.isNew ? 'left-20' : 'left-4'} bg-[#800000] text-white text-xs font-bold px-2 py-1 rounded z-10`}>SALE</div>
                )}

                {/* Stitch quick-add-btn — data-quick-add attribute lets handleCardClick bail out */}
                <button
                    data-quick-add
                    onClick={handleAddToCart}
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10
                        px-6 py-2 rounded-full font-bold text-sm tracking-wide shadow-lg
                        w-max flex items-center gap-2 text-black
                        opacity-0 group-hover:opacity-100 transition-opacity duration-[300ms] ease-[ease]
                        bg-[rgba(255,255,255,0.6)]
                        backdrop-blur-[10px] [-webkit-backdrop-filter:blur(10px)]
                        border border-[rgba(255,255,255,0.9)]
                        pointer-events-auto"
                >
                    <span>+ QUICK ADD</span>
                </button>
            </div>

            {/* Stitch: div.mt-auto */}
            <div className="mt-auto">
                {/* Stitch: p.text-sm.text-gray-500.font-semibold.mb-1.uppercase */}
                <p className="text-sm text-gray-500 font-semibold mb-1 uppercase">
                    {product.brand?.name || product.category || 'Sneaker'}
                </p>
                {/* Stitch: h3.text-lg.font-bold.leading-tight.mb-2  letter-spacing:-0.05em */}
                <h3 className="text-lg font-bold leading-tight mb-2 tracking-[-0.05em] text-gray-900">
                    {product.name}
                </h3>
                {/* Stitch: p.text-xl.font-extrabold.text-primary (#800000) */}
                <p className="text-xl font-extrabold text-[#800000]">
                    {formatPrice(product.basePrice)}
                </p>
            </div>
        </div>
    );
}

export default function CatalogPage() {
    const [brandFilter, setBrandFilter] = useState('');
    const [searchParams] = useSearchParams();
    const category = searchParams.get('category');

    const { data: products, isLoading, isError } = useQuery({
        queryKey: ['products'],
        queryFn: () => getProducts(),
    });

    const brands = React.useMemo(() => {
        if (!products) return [];
        return [...new Set(products.map(p => p.brand?.name).filter(Boolean))].sort();
    }, [products]);

    const filteredProducts = React.useMemo(() => {
        if (!products) return [];
        let result = products;

        // URL category filter (NEW / SALE)
        if (category === 'new') {
            result = result.filter(p => p.isNew === true);
        } else if (category === 'sale') {
            result = result.filter(p => p.isOnSale === true);
        }

        // Sidebar brand filter
        if (brandFilter) {
            result = result.filter(p => p.brand?.name?.toLowerCase() === brandFilter.toLowerCase());
        }

        return result;
    }, [products, brandFilter, category]);

    // Dynamic page title
    const pageTitle = React.useMemo(() => {
        if (category === 'new') return 'NEW ARRIVALS';
        if (category === 'sale') return 'SALE';
        if (brandFilter) return brandFilter.toUpperCase();
        return 'ALL SNEAKERS';
    }, [category, brandFilter]);

    return (
        /*
          Stitch body: bg-background-light (#ffffff) text-gray-900 min-h-screen antialiased
          bg-image: two radial-gradients (fixed attachment)
        */
        <div
            className="bg-[#ffffff] text-gray-900 min-h-screen antialiased font-[Inter,sans-serif] bg-fixed"
            style={{
                backgroundImage: `radial-gradient(circle at 10% 20%, rgba(200,200,200,0.2) 0%, transparent 40%),
                                  radial-gradient(circle at 90% 80%, rgba(128,0,0,0.1) 0%, transparent 40%)`,
            }}
        >
            {/* Stitch: div.pt-28.px-8.pb-12.max-w-7xl.mx-auto.flex.flex-col.md:flex-row.gap-8 */}
            <div className="pt-28 pb-12 w-full px-4 sm:px-6 flex flex-col md:flex-row gap-8">

                {/* Stitch: aside.w-full.md:w-64.flex-shrink-0 */}
                <aside className="w-full md:w-64 flex-shrink-0">
                    {/*
                      Stitch: div.liquid-glass.rounded.p-6.sticky.top-32
                      "rounded" = borderRadius DEFAULT = 32px
                      LIGHT .liquid-glass values:
                        bg: rgba(255,255,255,0.4)  blur:20px
                        border-top: rgba(255,255,255,0.8)  border-left: rgba(255,255,255,0.8)
                        shadow: 0 8px 32px 0 rgba(0,0,0,0.1)
                    */}
                    <div className="rounded-[32px] p-6 sticky top-32
                        bg-[rgba(255,255,255,0.4)]
                        backdrop-blur-[20px] [-webkit-backdrop-filter:blur(20px)]
                        border-t border-t-[rgba(255,255,255,0.8)]
                        border-l border-l-[rgba(255,255,255,0.8)]
                        shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]">

                        {/* Stitch: h2.text-2xl.font-bold.mb-6  letter-spacing:-0.05em  text:gray-900 */}
                        <h2 className="text-2xl font-bold mb-6 tracking-[-0.05em] text-gray-900">FILTERS</h2>

                        {/* BRAND */}
                        <div className="mb-8">
                            <h3 className="font-semibold mb-3 tracking-[-0.05em] text-gray-900">BRAND</h3>
                            <div className="space-y-2">
                                <label className="flex items-center gap-3 cursor-pointer text-gray-900">
                                    <input
                                        type="radio" name="brand" checked={brandFilter === ''}
                                        onChange={() => setBrandFilter('')}
                                        className="form-radio text-[#800000] rounded border-gray-400 bg-transparent focus:ring-[#800000] h-4 w-4"
                                    />
                                    <span>All</span>
                                </label>
                                {brands.map(brand => (
                                    <label key={brand} className="flex items-center gap-3 cursor-pointer text-gray-900">
                                        <input
                                            type="radio" name="brand" checked={brandFilter === brand}
                                            onChange={() => setBrandFilter(brand)}
                                            className="form-radio text-[#800000] rounded border-gray-400 bg-transparent focus:ring-[#800000] h-4 w-4"
                                        />
                                        <span>{brand}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* SIZE */}
                        <div>
                            <h3 className="font-semibold mb-3 tracking-[-0.05em] text-gray-900">SIZE (US)</h3>
                            {/*
                              Stitch size btn classes:
                              default: border border-gray-300 py-2 rounded-md hover:border-primary transition-colors
                              grey:    border border-gray-300 py-2 rounded-md bg-gray-100
                              active:  border border-primary bg-primary/10 py-2 rounded-md text-primary font-bold
                            */}
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { size: 7, v: 'default' }, { size: 8, v: 'grey' },
                                    { size: 9, v: 'default' }, { size: 10, v: 'active' },
                                    { size: 11, v: 'default' }, { size: 12, v: 'default' },
                                ].map(({ size, v }) => (
                                    <button key={size} className={
                                        v === 'active'   ? 'border border-[#800000] bg-[#800000]/10 py-2 rounded-md text-[#800000] font-bold' :
                                        v === 'grey'     ? 'border border-gray-300 py-2 rounded-md bg-gray-100 text-gray-900' :
                                                           'border border-gray-300 py-2 rounded-md hover:border-[#800000] transition-colors text-gray-900'
                                    }>{size}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Stitch: main.flex-1 */}
                <main className="flex-1">
                    {/* Stitch: div.flex.justify-between.items-end.mb-8 */}
                    <div className="flex justify-between items-end mb-8">
                        {/* Stitch: h1.text-4xl.md:text-5xl.font-extrabold  text:gray-900  letter-spacing:-0.05em */}
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-[-0.05em] uppercase text-gray-900">
                            {pageTitle}
                        </h1>
                        {/* Stitch: span.text-gray-500.font-medium */}
                        <span className="text-gray-500 font-medium">
                            {isLoading ? '—' : `${filteredProducts.length} Results`}
                        </span>
                    </div>

                    {/* Skeleton — Stitch card shape, light */}
                    {isLoading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="animate-pulse bg-white rounded-2xl p-4 border border-gray-100">
                                    <div className="aspect-square bg-gray-100 rounded-xl mb-4" />
                                    <div className="space-y-2">
                                        <div className="h-3 bg-gray-100 w-1/4 rounded" />
                                        <div className="h-5 bg-gray-100 w-3/4 rounded" />
                                        <div className="h-5 bg-gray-100 w-1/3 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Error */}
                    {!isLoading && isError && (
                        <div className="text-center py-24 text-gray-500">
                            <p className="text-lg font-semibold">Failed to load products.</p>
                        </div>
                    )}

                    {/* Stitch: div.grid.grid-cols-1.sm:grid-cols-2.lg:grid-cols-3.gap-6 */}
                    {!isLoading && !isError && filteredProducts.length > 0 && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredProducts.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            {/* Stitch pagination — light: border-gray-300 hover:bg-gray-100 */}
                            <div className="mt-12 flex justify-center gap-2">
                                <button className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-300 hover:bg-gray-100 text-gray-900">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button className="w-10 h-10 rounded-full flex items-center justify-center bg-[#800000] text-white font-bold">1</button>
                                <button className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-300 hover:bg-gray-100 font-bold text-gray-900">2</button>
                                <button className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-300 hover:bg-gray-100 font-bold text-gray-900">3</button>
                                <button className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-300 hover:bg-gray-100 text-gray-900">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </>
                    )}

                    {/* Empty */}
                    {!isLoading && !isError && filteredProducts.length === 0 && (
                        <div className="text-center py-24 text-gray-500">
                            <p className="text-lg font-semibold uppercase tracking-[-0.05em]">No sneakers found.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
