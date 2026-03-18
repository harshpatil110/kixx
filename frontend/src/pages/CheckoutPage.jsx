import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, ChevronDown, ChevronRight, Lock } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { createOrder, processPayment } from '../services/orderService';
import useCartStore from '../store/cartStore';
import { formatPrice } from '../utils/currency';

/*
  STITCH LIGHT THEME — checkout.html (KIXX Glass Checkout)
  ──────────────────────────────────────────────────────────
  Font: Space Grotesk
  Body bg: linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%) fixed   ← light blue-grey gradient
  text-gray-900 min-h-screen

  Nav:  mix-blend-difference text-white (Stitch exact — works on light bg)

  h1: text-5xl font-bold tracking-tighter uppercase mix-blend-overlay

  LEFT CARDS — Stitch: bg-white rounded-[32px] p-8 shadow-xl  text-gray-900
    Active: opacity-100 pointer-events-auto
    Inactive: opacity-50 pointer-events-none
    h2: text-2xl font-bold uppercase tracking-tight text-gray-900

  .input-brutalist (LIGHT):
    border-none; border-bottom: 2px solid #000; background: transparent; border-radius:0
    padding: 12px 0; font: Space Grotesk 500
    focus: outline:none box-shadow:none border-bottom-color:#333

  Checkbox: w-5 h-5 border-2 border-black rounded-none text-black focus:ring-black

  RIGHT GLASS PANEL — Stitch .glass-panel (LIGHT):
    background: rgba(255,255,255,0.5)
    backdrop-filter: blur(20px)
    border: 1px solid rgba(255,255,255,0.2)
    (shadow stays as shadow-2xl)
  rounded-[32px] p-8 shadow-2xl

  Order summary line text: text-gray-600  values: font-medium text-gray-900
  Total: font-bold text-2xl uppercase  / font-bold text-3xl tracking-tighter  text-gray-900
  Border: border-black/10

  CTA: w-full bg-[#800000] text-white font-bold uppercase tracking-widest py-5 rounded-full
       hover:scale-[1.02] transition-transform duration-300

  Lock row: text-gray-500 material-icons text-base
*/
export default function CheckoutPage() {
    const { items, getTotalPrice, clearCart } = useCartStore();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [newsletter, setNewsletter] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [paymentDetails] = useState({ cardNumber: '', expiry: '', cvv: '' });

    const checkoutMutation = useMutation({
        mutationFn: async () => {
            const order = await createOrder(items);
            if (!order?.id) throw new Error('Order creation failed.');
            await processPayment(order.id, paymentDetails);
            return order.id;
        },
        onSuccess: (orderId) => { clearCart(); navigate(`/order-confirmation/${orderId}`); },
        onError: (err) => { setErrorMsg(err.message || 'Payment failed. Please try again.'); },
    });

    const subtotal = getTotalPrice();
    const taxes = Math.round(subtotal * 0.18);
    const total = subtotal + taxes;

    return (
        /*
          Stitch: font-display (Space Grotesk) text-gray-900 min-h-screen
          body bg: linear-gradient(135deg,#e0eafc 0%,#cfdef3 100%) fixed
        */
        <div
            className="font-['Space_Grotesk',sans-serif] text-gray-900 min-h-screen"
            style={{ background: 'linear-gradient(135deg,#e0eafc 0%,#cfdef3 100%)', backgroundAttachment: 'fixed' }}
        >
            {/* Stitch: nav.w-full.px-8.py-6.flex.justify-between.items-center.fixed.top-0.z-50
                .mix-blend-difference.text-white */}
            <nav className="w-full px-8 py-6 flex justify-between items-center fixed top-0 z-50 mix-blend-difference text-white">
                <Link to="/" className="text-3xl font-black tracking-tighter uppercase">KIXX</Link>
                <div className="flex gap-6 items-center">
                    <ShoppingBag className="w-6 h-6 cursor-pointer" />
                </div>
            </nav>

            {/* Stitch: main.pt-32.pb-24.px-8.max-w-7xl.mx-auto */}
            <main className="pt-32 pb-24 px-8 max-w-7xl mx-auto">
                {/* Stitch: h1.text-5xl.md:text-6xl.font-bold.tracking-tighter.mb-12.uppercase.mix-blend-overlay */}
                <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-12 uppercase mix-blend-overlay">
                    Secure Checkout
                </h1>

                {errorMsg && (
                    <div className="mb-8 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-2xl border-l-4 border-red-500">
                        {errorMsg}
                    </div>
                )}

                {/* Stitch: div.grid.grid-cols-1.lg:grid-cols-12.gap-12.items-start */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                    {/* Left: lg:col-span-7 space-y-6 */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Stitch: div.bg-white.rounded-[32px].p-8.shadow-xl */}
                        <div className="bg-white rounded-[32px] p-8 shadow-xl">
                            {/* Stitch: div.flex.justify-between.items-center.mb-6.cursor-pointer */}
                            <div className="flex justify-between items-center mb-6 cursor-pointer">
                                {/* Stitch: h2.text-2xl.font-bold.uppercase.tracking-tight text-gray-900 */}
                                <h2 className="text-2xl font-bold uppercase tracking-tight text-gray-900">1. Contact Information</h2>
                                <ChevronDown className="w-6 h-6 text-gray-900" />
                            </div>
                            {/* Stitch: div.space-y-6 */}
                            <div className="space-y-6">
                                {/*
                                  .input-brutalist LIGHT:
                                  border-none  border-b-2 border-b-black  bg-transparent  rounded-none
                                  py-[12px] px-0  font:Space Grotesk weight:500
                                  placeholder: text-gray-400
                                */}
                                <input
                                    type="email" placeholder="Email Address"
                                    value={email} onChange={(e) => setEmail(e.target.value)}
                                    className="w-full text-lg bg-transparent border-0 border-b-2 border-b-black rounded-none py-[12px] px-0 font-medium text-gray-900 focus:outline-none focus:ring-0 focus:border-b-[#333] placeholder:text-gray-400"
                                />
                                {/* Stitch: div.flex.items-center.gap-3 */}
                                <div className="flex items-center gap-3">
                                    {/* Stitch: input.w-5.h-5.border-2.border-black.rounded-none */}
                                    <input
                                        type="checkbox" id="newsletter" checked={newsletter}
                                        onChange={(e) => setNewsletter(e.target.checked)}
                                        className="w-5 h-5 border-2 border-black rounded-none text-black focus:ring-black"
                                    />
                                    <label htmlFor="newsletter" className="text-sm font-medium text-gray-900">
                                        Keep me up to date on news and exclusive offers
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Shipping card — inactive: opacity-50 pointer-events-none */}
                        <div className="bg-white rounded-[32px] p-8 shadow-xl opacity-50 pointer-events-none">
                            <div className="flex justify-between items-center cursor-pointer">
                                <h2 className="text-2xl font-bold uppercase tracking-tight text-gray-900">2. Shipping Address</h2>
                                <ChevronRight className="w-6 h-6 text-gray-900" />
                            </div>
                        </div>

                        {/* Payment card — inactive */}
                        <div className="bg-white rounded-[32px] p-8 shadow-xl opacity-50 pointer-events-none">
                            <div className="flex justify-between items-center cursor-pointer">
                                <h2 className="text-2xl font-bold uppercase tracking-tight text-gray-900">3. Payment</h2>
                                <ChevronRight className="w-6 h-6 text-gray-900" />
                            </div>
                        </div>
                    </div>

                    {/* Right: lg:col-span-5 sticky top-32 */}
                    <div className="lg:col-span-5 sticky top-32">
                        {/*
                          Stitch .glass-panel LIGHT: rounded-[32px] p-8 shadow-2xl
                          bg: rgba(255,255,255,0.5)  blur:20px  border: rgba(255,255,255,0.2)
                        */}
                        <div className="rounded-[32px] p-8 shadow-2xl
                            bg-[rgba(255,255,255,0.5)]
                            backdrop-blur-[20px] [-webkit-backdrop-filter:blur(20px)]
                            border border-[rgba(255,255,255,0.2)]">

                            {/* Stitch: h2.text-2xl.font-bold.uppercase.tracking-tight.mb-8 text-gray-900 */}
                            <h2 className="text-2xl font-bold uppercase tracking-tight mb-8 text-gray-900">Order Summary</h2>

                            {/* Items list */}
                            <div className="space-y-4 mb-8 border-b border-black/10 pb-6 max-h-60 overflow-y-auto">
                                {items.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-4">Your cart is empty.</p>
                                ) : items.map(item => (
                                    /* Stitch: div.flex.items-center.gap-6.mb-8.border-b.border-black/10.pb-6 */
                                    <div key={item.variantId} className="flex items-center gap-6">
                                        {/* Stitch: div.w-24.h-24.bg-gray-200.rounded-xl.overflow-hidden.flex-shrink-0 */}
                                        <div className="w-24 h-24 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                                            {item.imageUrl
                                                ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                                                : <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">IMG</div>
                                            }
                                        </div>
                                        <div className="flex-grow">
                                            {/* Stitch: h3.font-bold.text-lg.leading-tight.uppercase text-gray-900 */}
                                            <h3 className="font-bold text-lg leading-tight uppercase text-gray-900">{item.name}</h3>
                                            {/* Stitch: p.text-sm.text-gray-500.mb-2 */}
                                            <p className="text-sm text-gray-500 mb-2">
                                                {item.color && item.size ? `${item.color} • Size ${item.size}` : 'One Size'}
                                            </p>
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-gray-900">{formatPrice(item.price)}</span>
                                                <span className="text-sm font-medium text-gray-900">Qty: {item.quantity}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Stitch: div.space-y-4.mb-8.text-lg */}
                            <div className="space-y-4 mb-8 text-lg">
                                {/* Stitch: div.flex.justify-between  label:text-gray-600  value:font-medium */}
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="font-medium text-gray-900">Calculated next step</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Taxes (18% GST)</span>
                                    <span className="font-medium text-gray-900">{formatPrice(taxes)}</span>
                                </div>
                                {/* Stitch: div.flex.justify-between.items-center.pt-4.border-t.border-black/10.mt-4 */}
                                <div className="flex justify-between items-center pt-4 border-t border-black/10 mt-4">
                                    {/* Stitch: span.font-bold.text-2xl.uppercase */}
                                    <span className="font-bold text-2xl uppercase text-gray-900">Total</span>
                                    {/* Stitch: span.font-bold.text-3xl.tracking-tighter */}
                                    <span className="font-bold text-3xl tracking-tighter text-gray-900">{formatPrice(total)}</span>
                                </div>
                            </div>

                            {/* Stitch: button.w-full.bg-primary.text-white.font-bold.uppercase.tracking-widest
                                .py-5.rounded-full.hover:scale-[1.02].transition-transform.duration-300 */}
                            <button
                                onClick={() => {
                                    if (items.length === 0) { setErrorMsg('Your cart is empty!'); return; }
                                    checkoutMutation.mutate();
                                }}
                                disabled={checkoutMutation.isPending || items.length === 0}
                                className="w-full bg-[#800000] text-white font-bold uppercase tracking-widest py-5 rounded-full hover:scale-[1.02] transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
                            >
                                {checkoutMutation.isPending ? 'Processing…' : 'Continue to Shipping'}
                            </button>

                            {/* Stitch: div.mt-6.flex.justify-center.items-center.gap-2.text-sm.text-gray-500 */}
                            <div className="mt-6 flex justify-center items-center gap-2 text-sm text-gray-500">
                                <Lock className="w-4 h-4" />
                                <span>Secure SSL encrypted checkout</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
