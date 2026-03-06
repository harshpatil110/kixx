import React from 'react';
import useCartStore from '../store/cartStore';
import { formatPrice } from '../utils/currency';
import { useNavigate } from 'react-router-dom';

/*
  STITCH SOURCE: cart.html (KIXX Dark Glass Cart)
  ─────────────────────────────────────────────────────────
  Font: Inter
  Body: bg-background-light (#f3f4f6) / dark:bg-background-dark (#111827)
  Body: overflow-hidden h-screen relative

  .glass-drawer:
    background: rgba(0,0,0,0.4)
    backdrop-filter: blur(25px)  [-webkit-backdrop-filter: blur(25px)]
    border-left: 1px solid rgba(255,255,255,0.1)

  Backdrop overlay: absolute inset-0 bg-black/40 z-40 backdrop-blur-sm

  Drawer panel:
    absolute inset-y-0 right-0 z-50 w-full md:w-[30%] min-w-[320px] max-w-md
    glass-drawer shadow-2xl flex flex-col text-white
    transform transition-transform duration-300 translate-x-0

  Header: px-6 py-5 flex items-center justify-between border-b border-white/10
    h2: text-lg font-bold tracking-tight uppercase
    span (count): text-gray-400 font-medium ml-2

  Items list: flex-1 overflow-y-auto px-6 py-4 space-y-6
    Item row: flex gap-4 items-start group
      Image box: w-20 h-20 bg-white/5 rounded-md flex-shrink-0 overflow-hidden relative
        img: object-cover w-full h-full mix-blend-overlay opacity-80
             group-hover:opacity-100 transition-opacity
      Details: flex-1 min-w-0
        h3: font-bold text-sm truncate uppercase tracking-tight
        p (variant): text-xs text-gray-400 mt-1 uppercase tracking-wider
        row: flex items-center justify-between mt-3
          size: text-xs text-gray-300 font-medium
          price: font-bold text-sm
      Delete btn: text-gray-500 hover:text-red-400 transition-colors mt-1

  Footer: px-6 py-6 border-t border-white/10 bg-black/20
    Summary rows: space-y-3 mb-6
      line: flex justify-between text-sm text-gray-300
      total: flex justify-between text-base font-bold text-white pt-2 border-t border-white/10 mt-2
    CTA: w-full bg-primary(#800000) hover:bg-red-900 text-white font-bold
         uppercase tracking-widest py-4 rounded-sm transition-colors
*/

export default function CartDrawer({ isOpen, onClose }) {
    const { items, removeItem, getTotalPrice, getItemCount } = useCartStore();
    const navigate = useNavigate();

    if (!isOpen) return null;

    const itemCount = getItemCount();
    const totalPrice = getTotalPrice();

    return (
        /* Stitch: div.fixed.inset-0.z-[100] overlay container */
        <div className="fixed inset-0 z-[100] overflow-hidden font-[Inter,sans-serif]">

            {/* Stitch: div.absolute.inset-0.bg-black/40.z-40.backdrop-blur-sm.transition-opacity */}
            <div
                className="absolute inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/*
              Stitch: div.absolute.inset-y-0.right-0.z-50.w-full.md:w-[30%].min-w-[320px].max-w-md
                .glass-drawer.shadow-2xl.flex.flex-col.text-white
                .transform.transition-transform.duration-300.translate-x-0
              .glass-drawer:
                background:rgba(0,0,0,0.4) backdrop-filter:blur(25px)
                border-left:1px solid rgba(255,255,255,0.1)
            */}
            <div className="absolute inset-y-0 right-0 z-50 w-full md:w-[30%] min-w-[320px] max-w-md
                bg-[rgba(0,0,0,0.4)] backdrop-blur-[25px] [-webkit-backdrop-filter:blur(25px)]
                border-l border-l-[rgba(255,255,255,0.1)]
                shadow-2xl flex flex-col text-white
                transform transition-transform duration-300 translate-x-0">

                {/* Stitch: div.px-6.py-5.flex.items-center.justify-between.border-b.border-white/10 */}
                <div className="px-6 py-5 flex items-center justify-between border-b border-white/10">
                    {/* Stitch: h2.text-lg.font-bold.tracking-tight.uppercase */}
                    <h2 className="text-lg font-bold tracking-tight uppercase">
                        Your Cart <span className="text-gray-400 font-medium ml-2">({itemCount})</span>
                    </h2>
                    {/* Stitch: button > span.material-icons → close */}
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors focus:outline-none">
                        <span className="material-icons">close</span>
                    </button>
                </div>

                {/* Stitch: div.flex-1.overflow-y-auto.px-6.py-4.space-y-6 */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                            <span className="material-icons text-5xl mb-4 opacity-50">shopping_bag</span>
                            <p className="text-lg font-medium tracking-tight uppercase">Your cart is empty</p>
                        </div>
                    ) : (
                        /* Stitch: div.flex.gap-4.items-start.group (per item) */
                        items.map((item) => (
                            <div key={item.variantId} className="flex gap-4 items-start group">
                                {/* Stitch: div.w-20.h-20.bg-white/5.rounded-md.flex-shrink-0.overflow-hidden.relative */}
                                <div className="w-20 h-20 bg-white/5 rounded-md flex-shrink-0 overflow-hidden relative">
                                    {item.imageUrl ? (
                                        /* Stitch: img.object-cover.w-full.h-full.mix-blend-overlay.opacity-80.group-hover:opacity-100.transition-opacity */
                                        <img
                                            src={item.imageUrl}
                                            alt={item.name}
                                            className="object-cover w-full h-full mix-blend-overlay opacity-80 group-hover:opacity-100 transition-opacity"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-white/10 text-xs">No img</div>
                                    )}
                                </div>

                                {/* Stitch: div.flex-1.min-w-0 */}
                                <div className="flex-1 min-w-0">
                                    {/* Stitch: h3.font-bold.text-sm.truncate.uppercase.tracking-tight */}
                                    <h3 className="font-bold text-sm truncate uppercase tracking-tight">{item.name}</h3>
                                    {/* Stitch: p.text-xs.text-gray-400.mt-1.uppercase.tracking-wider */}
                                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">
                                        {item.brand?.name || item.category || 'Sneaker'}
                                    </p>
                                    {/* Stitch: div.flex.items-center.justify-between.mt-3 */}
                                    <div className="flex items-center justify-between mt-3">
                                        {/* Stitch: span.text-xs.text-gray-300.font-medium */}
                                        <span className="text-xs text-gray-300 font-medium">Qty: {item.quantity}</span>
                                        {/* Stitch: span.font-bold.text-sm */}
                                        <span className="font-bold text-sm">{formatPrice(item.price)}</span>
                                    </div>
                                </div>

                                {/* Stitch: button.text-gray-500.hover:text-red-400.transition-colors.mt-1 */}
                                <button
                                    onClick={() => removeItem(item.variantId)}
                                    className="text-gray-500 hover:text-red-400 transition-colors mt-1 focus:outline-none"
                                >
                                    <span className="material-icons text-[18px]">delete_outline</span>
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Stitch: div.px-6.py-6.border-t.border-white/10.bg-black/20 */}
                <div className="px-6 py-6 border-t border-white/10 bg-black/20">
                    {/* Stitch: div.space-y-3.mb-6 */}
                    <div className="space-y-3 mb-6">
                        {/* Stitch: div.flex.justify-between.text-sm.text-gray-300 */}
                        <div className="flex justify-between text-sm text-gray-300">
                            <span>Subtotal</span>
                            <span className="font-medium text-white">{formatPrice(totalPrice)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-300">
                            <span>Shipping</span>
                            <span className="font-medium text-white">Calculated at next step</span>
                        </div>
                        {/* Stitch: div.flex.justify-between.text-base.font-bold.text-white
                                   .pt-2.border-t.border-white/10.mt-2 */}
                        <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-white/10 mt-2">
                            <span>Total</span>
                            <span>{formatPrice(totalPrice)}</span>
                        </div>
                    </div>
                    {/*
                      Stitch: button.w-full.bg-primary.hover:bg-red-900.text-white.font-bold
                              .uppercase.tracking-widest.py-4.rounded-sm.transition-colors
                    */}
                    <button
                        onClick={() => { navigate('/checkout'); onClose(); }}
                        disabled={items.length === 0}
                        className="w-full bg-[#800000] hover:bg-red-900 text-white font-bold uppercase tracking-widest py-4 rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#800000] focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Checkout
                    </button>
                </div>
            </div>
        </div>
    );
}
