import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, ChevronDown, ChevronRight, Lock, Trash2, CheckCircle, Pencil } from 'lucide-react';
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
    const { items, getTotalPrice, clearCart, removeItem } = useCartStore();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [email, setEmail] = useState('');
    const [newsletter, setNewsletter] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [paymentDetails] = useState({ cardNumber: '', expiry: '', cvv: '' });

    // Shipping form state
    const [shipping, setShipping] = useState({
        firstName: '', lastName: '', address: '',
        city: '', state: '', pinCode: '', phone: '',
    });
    const updateShipping = (field, value) => setShipping(prev => ({ ...prev, [field]: value }));

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

    // Promo code state
    const [promoCodeInput, setPromoCodeInput] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [promoError, setPromoError] = useState(null);

    const handleApplyPromo = () => {
        if (!promoCodeInput.trim()) return;
        if (promoCodeInput.trim().toUpperCase() === 'FIRSTDROP') {
            setAppliedPromo('FIRSTDROP');
            setPromoError(null);
        } else {
            setPromoError('Invalid promo code');
            setAppliedPromo(null);
        }
    };

    const subtotal = getTotalPrice();
    const discount = appliedPromo === 'FIRSTDROP' ? subtotal * 0.10 : 0;
    const discountedSubtotal = subtotal - discount;
    const taxes = Math.round(discountedSubtotal * 0.18);
    const total = discountedSubtotal + taxes;

    // Persist checkout data to sessionStorage before navigating to payment
    const goToPayment = () => {
        sessionStorage.setItem('kixx-checkout-data', JSON.stringify({ email, shipping, promoCode: appliedPromo }));
        navigate('/payment');
    };

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

                        {/* ─── STEP 1: Contact Information ─── */}
                        <div className={`bg-white rounded-[32px] p-8 shadow-xl transition-all duration-300 ${
                            currentStep < 1 ? 'opacity-50 pointer-events-none' : ''
                        }`}>
                            <div
                                className="flex justify-between items-center cursor-pointer"
                                onClick={() => currentStep > 1 && setCurrentStep(1)}
                            >
                                <div className="flex items-center gap-3">
                                    {currentStep > 1 && <CheckCircle className="w-6 h-6 text-green-600" />}
                                    <h2 className="text-2xl font-bold uppercase tracking-tight text-gray-900">1. Contact Information</h2>
                                </div>
                                {currentStep === 1 ? (
                                    <ChevronDown className="w-6 h-6 text-gray-900" />
                                ) : currentStep > 1 ? (
                                    <button className="flex items-center gap-1.5 text-sm font-semibold text-[#800000] hover:text-[#600000] transition-colors uppercase tracking-wider">
                                        <Pencil size={14} /> Edit
                                    </button>
                                ) : (
                                    <ChevronRight className="w-6 h-6 text-gray-900" />
                                )}
                            </div>

                            {/* Collapsed summary */}
                            {currentStep > 1 && email && (
                                <p className="mt-3 text-sm text-gray-500 pl-9">{email}</p>
                            )}

                            {/* Expanded form */}
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                currentStep === 1 ? 'max-h-[500px] opacity-100 mt-6' : 'max-h-0 opacity-0'
                            }`}>
                                <div className="space-y-6">
                                    <input
                                        type="email" placeholder="Email Address"
                                        value={email} onChange={(e) => setEmail(e.target.value)}
                                        className="w-full text-lg bg-transparent border-0 border-b-2 border-b-black rounded-none py-[12px] px-0 font-medium text-gray-900 focus:outline-none focus:ring-0 focus:border-b-[#333] placeholder:text-gray-400"
                                    />
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox" id="newsletter" checked={newsletter}
                                            onChange={(e) => setNewsletter(e.target.checked)}
                                            className="w-5 h-5 border-2 border-black rounded-none text-black focus:ring-black"
                                        />
                                        <label htmlFor="newsletter" className="text-sm font-medium text-gray-900">
                                            Keep me up to date on news and exclusive offers
                                        </label>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (!email.trim()) { setErrorMsg('Please enter your email address.'); return; }
                                            setErrorMsg(null);
                                            setCurrentStep(2);
                                        }}
                                        className="w-full bg-[#800000] text-white font-bold uppercase tracking-widest py-4 rounded-full hover:scale-[1.02] transition-transform duration-300 mt-2"
                                    >
                                        Continue to Shipping
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ─── STEP 2: Shipping Address ─── */}
                        <div className={`bg-white rounded-[32px] p-8 shadow-xl transition-all duration-300 ${
                            currentStep < 2 ? 'opacity-50 pointer-events-none' : ''
                        }`}>
                            <div
                                className="flex justify-between items-center cursor-pointer"
                                onClick={() => currentStep > 2 && setCurrentStep(2)}
                            >
                                <div className="flex items-center gap-3">
                                    {currentStep > 2 && <CheckCircle className="w-6 h-6 text-green-600" />}
                                    <h2 className="text-2xl font-bold uppercase tracking-tight text-gray-900">2. Shipping Address</h2>
                                </div>
                                {currentStep === 2 ? (
                                    <ChevronDown className="w-6 h-6 text-gray-900" />
                                ) : currentStep > 2 ? (
                                    <button className="flex items-center gap-1.5 text-sm font-semibold text-[#800000] hover:text-[#600000] transition-colors uppercase tracking-wider">
                                        <Pencil size={14} /> Edit
                                    </button>
                                ) : (
                                    <ChevronRight className="w-6 h-6 text-gray-900" />
                                )}
                            </div>

                            {/* Collapsed summary */}
                            {currentStep > 2 && shipping.firstName && (
                                <p className="mt-3 text-sm text-gray-500 pl-9">
                                    {shipping.firstName} {shipping.lastName}, {shipping.city} — {shipping.pinCode}
                                </p>
                            )}

                            {/* Expanded form */}
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                currentStep === 2 ? 'max-h-[800px] opacity-100 mt-6' : 'max-h-0 opacity-0'
                            }`}>
                                <div className="space-y-5">
                                    {/* First Name / Last Name — side by side */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text" placeholder="First Name"
                                            value={shipping.firstName}
                                            onChange={(e) => updateShipping('firstName', e.target.value)}
                                            className="w-full text-lg bg-transparent border-0 border-b-2 border-b-black rounded-none py-[12px] px-0 font-medium text-gray-900 focus:outline-none focus:ring-0 focus:border-b-[#333] placeholder:text-gray-400"
                                        />
                                        <input
                                            type="text" placeholder="Last Name"
                                            value={shipping.lastName}
                                            onChange={(e) => updateShipping('lastName', e.target.value)}
                                            className="w-full text-lg bg-transparent border-0 border-b-2 border-b-black rounded-none py-[12px] px-0 font-medium text-gray-900 focus:outline-none focus:ring-0 focus:border-b-[#333] placeholder:text-gray-400"
                                        />
                                    </div>

                                    {/* Street Address — full width */}
                                    <input
                                        type="text" placeholder="Street Address"
                                        value={shipping.address}
                                        onChange={(e) => updateShipping('address', e.target.value)}
                                        className="w-full text-lg bg-transparent border-0 border-b-2 border-b-black rounded-none py-[12px] px-0 font-medium text-gray-900 focus:outline-none focus:ring-0 focus:border-b-[#333] placeholder:text-gray-400"
                                    />

                                    {/* City / PIN Code — side by side */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text" placeholder="City"
                                            value={shipping.city}
                                            onChange={(e) => updateShipping('city', e.target.value)}
                                            className="w-full text-lg bg-transparent border-0 border-b-2 border-b-black rounded-none py-[12px] px-0 font-medium text-gray-900 focus:outline-none focus:ring-0 focus:border-b-[#333] placeholder:text-gray-400"
                                        />
                                        <input
                                            type="text" placeholder="PIN Code"
                                            value={shipping.pinCode}
                                            onChange={(e) => updateShipping('pinCode', e.target.value)}
                                            className="w-full text-lg bg-transparent border-0 border-b-2 border-b-black rounded-none py-[12px] px-0 font-medium text-gray-900 focus:outline-none focus:ring-0 focus:border-b-[#333] placeholder:text-gray-400"
                                        />
                                    </div>

                                    {/* State — full width */}
                                    <input
                                        type="text" placeholder="State"
                                        value={shipping.state}
                                        onChange={(e) => updateShipping('state', e.target.value)}
                                        className="w-full text-lg bg-transparent border-0 border-b-2 border-b-black rounded-none py-[12px] px-0 font-medium text-gray-900 focus:outline-none focus:ring-0 focus:border-b-[#333] placeholder:text-gray-400"
                                    />

                                    {/* Phone Number — full width */}
                                    <input
                                        type="tel" placeholder="Phone Number"
                                        value={shipping.phone}
                                        onChange={(e) => updateShipping('phone', e.target.value)}
                                        className="w-full text-lg bg-transparent border-0 border-b-2 border-b-black rounded-none py-[12px] px-0 font-medium text-gray-900 focus:outline-none focus:ring-0 focus:border-b-[#333] placeholder:text-gray-400"
                                    />

                                    <button
                                        onClick={() => {
                                            if (!shipping.firstName.trim() || !shipping.address.trim() || !shipping.city.trim() || !shipping.pinCode.trim()) {
                                                setErrorMsg('Please fill in all required shipping fields.');
                                                return;
                                            }
                                            setErrorMsg(null);
                                            setCurrentStep(3);
                                        }}
                                        className="w-full bg-[#800000] text-white font-bold uppercase tracking-widest py-4 rounded-full hover:scale-[1.02] transition-transform duration-300 mt-2"
                                    >
                                        Continue to Payment
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ─── STEP 3: Payment ─── */}
                        <div className={`bg-white rounded-[32px] p-8 shadow-xl transition-all duration-300 ${
                            currentStep < 3 ? 'opacity-50 pointer-events-none' : ''
                        }`}>
                            <div className="flex justify-between items-center cursor-pointer">
                                <h2 className="text-2xl font-bold uppercase tracking-tight text-gray-900">3. Payment</h2>
                                {currentStep === 3 ? (
                                    <ChevronDown className="w-6 h-6 text-gray-900" />
                                ) : (
                                    <ChevronRight className="w-6 h-6 text-gray-900" />
                                )}
                            </div>

                            {/* Payment redirect — when step 3 is active */}
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                currentStep === 3 ? 'max-h-[300px] opacity-100 mt-6' : 'max-h-0 opacity-0'
                            }`}>
                                <div className="flex items-center gap-3 mb-4">
                                    <Lock className="w-5 h-5 text-green-600" />
                                    <p className="text-sm font-medium text-gray-700">All transactions are secure and encrypted.</p>
                                </div>
                                <p className="text-xs text-gray-400 mb-6">You will be redirected to Razorpay's secure payment gateway to complete your purchase.</p>
                                <button
                                    onClick={() => {
                                        if (items.length === 0) { setErrorMsg('Your cart is empty!'); return; }
                                        goToPayment();
                                    }}
                                    disabled={items.length === 0}
                                    className="w-full bg-[#800000] text-white font-bold uppercase tracking-widest py-4 rounded-full hover:scale-[1.02] transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
                                >
                                    Proceed to Secure Payment
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right: lg:col-span-5 sticky top-32 */}
                    <div className="lg:col-span-5 sticky top-32">
                        <div className="rounded-[32px] p-8 shadow-2xl
                            bg-[rgba(255,255,255,0.5)]
                            backdrop-blur-[20px] [-webkit-backdrop-filter:blur(20px)]
                            border border-[rgba(255,255,255,0.2)]">

                            <h2 className="text-2xl font-bold uppercase tracking-tight mb-8 text-gray-900">Order Summary</h2>

                            {/* Items list */}
                            <div className="space-y-4 mb-8 border-b border-black/10 pb-6 max-h-60 overflow-y-auto">
                                {items.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-4">Your cart is empty.</p>
                                ) : items.map(item => (
                                    <div key={item.variantId} className="flex items-center gap-4">
                                        <div className="w-24 h-24 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                                            {item.imageUrl
                                                ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                                                : <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">IMG</div>
                                            }
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <h3 className="font-bold text-lg leading-tight uppercase text-gray-900 truncate">{item.name}</h3>
                                            <p className="text-sm text-gray-500 mb-2">
                                                {item.color && item.size ? `${item.color} • Size ${item.size}` : 'One Size'}
                                            </p>
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-gray-900">{formatPrice(item.price)}</span>
                                                <span className="text-sm font-medium text-gray-900">Qty: {item.quantity}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.variantId)}
                                            aria-label={`Remove ${item.name}`}
                                            className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors focus:outline-none"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="mb-6 border-b border-black/10 pb-6">
                                <label className="block text-sm font-bold uppercase tracking-wider text-gray-900 mb-2">Promo Code</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={promoCodeInput}
                                        onChange={(e) => setPromoCodeInput(e.target.value)}
                                        placeholder="Enter code" 
                                        className="flex-grow text-sm bg-transparent border-0 border-b-2 border-b-black rounded-none py-2 px-0 font-medium text-gray-900 focus:outline-none focus:ring-0 focus:border-b-[#333] placeholder:text-gray-400 uppercase"
                                        disabled={!!appliedPromo}
                                    />
                                    {!appliedPromo ? (
                                        <button 
                                            onClick={handleApplyPromo}
                                            className="px-6 py-2 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors"
                                        >
                                            Apply
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => {
                                                setAppliedPromo(null);
                                                setPromoCodeInput('');
                                                setPromoError(null);
                                            }}
                                            className="px-6 py-2 bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest hover:bg-red-100 transition-colors"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                                {promoError && <p className="text-red-600 text-xs mt-2 font-medium">{promoError}</p>}
                                {appliedPromo && <p className="text-green-600 text-xs mt-2 font-medium">Promo code '{appliedPromo}' applied! (10% OFF)</p>}
                            </div>

                            <div className="space-y-4 mb-8 text-lg">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-[#800000]">
                                        <span className="font-medium">Discount (10%)</span>
                                        <span className="font-bold">-{formatPrice(discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="font-medium text-gray-900">Free</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Taxes (18% GST)</span>
                                    <span className="font-medium text-gray-900">{formatPrice(taxes)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-black/10 mt-4">
                                    <span className="font-bold text-2xl uppercase text-gray-900">Total</span>
                                    <span className="font-bold text-3xl tracking-tighter text-gray-900">{formatPrice(total)}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    if (items.length === 0) return;
                                    if (currentStep < 3) { setErrorMsg('Please complete all checkout steps first.'); return; }
                                    goToPayment();
                                }}
                                disabled={items.length === 0 || currentStep < 3}
                                className="w-full bg-[#800000] text-white font-bold uppercase tracking-widest py-5 rounded-full hover:scale-[1.02] transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
                            >
                                {currentStep < 3 ? 'Complete All Steps' : 'Proceed to Payment'}
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
