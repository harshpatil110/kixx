import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Lock, Shield, ArrowLeft, Trash2, Loader2, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import useCartStore from '../store/cartStore';
import { formatPrice } from '../utils/currency';
import { saveCompletedOrder } from '../services/orderService';
import api from '../services/api';

// ---------------------------------------------------------------------------
// Environment detection
// ---------------------------------------------------------------------------
const isLocalhost = window.location.hostname === 'localhost';

// ---------------------------------------------------------------------------
// Razorpay SDK — dynamic script loader (only used on localhost)
// ---------------------------------------------------------------------------
function loadRazorpayScript() {
    return new Promise((resolve, reject) => {
        if (window.Razorpay) { resolve(true); return; }

        const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
        if (existing) { existing.onload = () => resolve(true); return; }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => reject(new Error('Failed to load Razorpay SDK.'));
        document.body.appendChild(script);
    });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function PaymentPage() {
    const { items, getTotalPrice, removeItem, clearCart } = useCartStore();
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    const subtotal = getTotalPrice();
    const taxes = Math.round(subtotal * 0.18);
    const total = subtotal + taxes;

    // Retrieve checkout data stored from CheckoutPage
    const getCheckoutData = () => {
        try {
            const raw = sessionStorage.getItem('kixx-checkout-data');
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    };

    // -----------------------------------------------------------------------
    // Mock payment handler — used on production (Vercel) to bypass Razorpay
    // -----------------------------------------------------------------------
    const handleMockPayment = async () => {
        if (items.length === 0) return;

        const checkoutData = getCheckoutData();
        if (!checkoutData?.email) {
            setErrorMsg('Missing checkout info. Please go back and complete checkout steps.');
            return;
        }

        setProcessing(true);
        setErrorMsg(null);

        const toastId = toast.loading('Simulating secure transaction...');

        try {
            // Simulate network latency
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Save the order directly (no real payment gateway involved)
            await saveCompletedOrder({
                email: checkoutData.email,
                shippingAddress: checkoutData.shipping,
                items: items.map((item) => ({
                    variantId: item.variantId,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    size: item.size || null,
                    color: item.color || null,
                    imageUrl: item.imageUrl || null,
                })),
                totalAmount: total,
            });

            clearCart();
            sessionStorage.removeItem('kixx-checkout-data');
            toast.success('Order Placed Successfully!', { id: toastId });
            navigate('/account');
        } catch (err) {
            console.error('Mock payment error:', err);
            toast.error('Simulated checkout failed. Please try again.', { id: toastId });
            setErrorMsg(err?.response?.data?.message || err.message || 'Simulated checkout failed.');
            setProcessing(false);
        }
    };

    // -----------------------------------------------------------------------
    // Full Razorpay checkout flow (localhost only)
    // -----------------------------------------------------------------------
    const handleRazorpay = async () => {
        if (items.length === 0) return;

        const checkoutData = getCheckoutData();
        if (!checkoutData?.email) {
            setErrorMsg('Missing checkout info. Please go back and complete checkout steps.');
            return;
        }

        setProcessing(true);
        setErrorMsg(null);

        try {
            // 1 — Load the Razorpay SDK
            await loadRazorpayScript();

            // 2 — Create order on our backend (amount in INR, backend converts to paise)
            const { data: order } = await api.post('/api/payment/create-order', { amount: total });

            // 3 — Configure & open the Razorpay checkout modal
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,       // already in paise from backend
                currency: order.currency,
                name: 'KIXX Sneakers',
                description: 'Secure Checkout',
                order_id: order.id,
                theme: { color: '#111111' },
                prefill: {
                    email: checkoutData.email,
                    contact: checkoutData.shipping?.phone || '',
                },

                // ── Payment SUCCESS ──
                handler: async (response) => {
                    try {
                        // Save order snapshot to our database
                        await saveCompletedOrder({
                            email: checkoutData.email,
                            shippingAddress: checkoutData.shipping,
                            items: items.map(item => ({
                                variantId: item.variantId,
                                name: item.name,
                                price: item.price,
                                quantity: item.quantity,
                                size: item.size || null,
                                color: item.color || null,
                                imageUrl: item.imageUrl || null,
                            })),
                            totalAmount: total,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpayOrderId: response.razorpay_order_id,
                        });

                        // Clear cart + session, redirect
                        clearCart();
                        sessionStorage.removeItem('kixx-checkout-data');
                        navigate('/account');
                    } catch (saveErr) {
                        console.error('Order save after payment failed:', saveErr);
                        setErrorMsg('Payment succeeded but order saving failed. Please contact support.');
                        setProcessing(false);
                    }
                },

                // ── Modal dismissed / payment failed ──
                modal: {
                    ondismiss: () => {
                        setProcessing(false);
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (resp) => {
                console.error('Razorpay payment failed:', resp.error);
                setErrorMsg(`Payment failed: ${resp.error.description || 'Please try again.'}`);
                setProcessing(false);
            });
            rzp.open();
        } catch (err) {
            console.error('Razorpay checkout error:', err);
            setErrorMsg(err?.response?.data?.message || err.message || 'Could not initiate payment. Please try again.');
            setProcessing(false);
        }
    };

    // -----------------------------------------------------------------------
    // Pick the correct handler based on environment
    // -----------------------------------------------------------------------
    const handlePay = isLocalhost ? handleRazorpay : handleMockPayment;

    return (
        <div
            className="font-['Space_Grotesk',sans-serif] text-gray-900 min-h-screen"
            style={{ background: 'linear-gradient(135deg,#e0eafc 0%,#cfdef3 100%)', backgroundAttachment: 'fixed' }}
        >
            {/* Nav — same as CheckoutPage */}
            <nav className="w-full px-8 py-6 flex justify-between items-center fixed top-0 z-50 mix-blend-difference text-white">
                <Link to="/" className="text-3xl font-black tracking-tighter uppercase">KIXX</Link>
                <div className="flex gap-6 items-center">
                    <ShoppingBag className="w-6 h-6 cursor-pointer" />
                </div>
            </nav>

            <main className="pt-32 pb-24 px-8 max-w-7xl mx-auto">
                {/* Back link */}
                <button
                    onClick={() => navigate('/checkout')}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-8 uppercase tracking-wider"
                >
                    <ArrowLeft size={16} />
                    Back to Checkout
                </button>

                <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-12 uppercase mix-blend-overlay">
                    Payment
                </h1>

                {errorMsg && (
                    <div className="mb-8 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-2xl border-l-4 border-red-500">
                        {errorMsg}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                    {/* Left: Payment Method Card */}
                    <div className="lg:col-span-7">
                        <div className="bg-white rounded-[32px] p-8 shadow-xl">
                            <h2 className="text-2xl font-bold uppercase tracking-tight text-gray-900 mb-8">
                                Payment Method
                            </h2>

                            {/* Security badges */}
                            <div className="flex items-center gap-6 mb-8 pb-6 border-b border-gray-100">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Shield size={18} className="text-green-600" />
                                    <span>100% Secure</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Lock size={18} className="text-green-600" />
                                    <span>SSL Encrypted</span>
                                </div>
                            </div>

                            {/* ── Conditional: Razorpay (localhost) vs Simulate (production) ── */}
                            {isLocalhost ? (
                                /* ── LOCALHOST: Real Razorpay flow ── */
                                <div className="border-2 border-black rounded-2xl p-6 mb-6 bg-gray-50/50">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full bg-black" />
                                            <span className="font-bold text-lg uppercase tracking-tight">Razorpay</span>
                                        </div>
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            UPI • Cards • NetBanking • Wallets
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-6">
                                        You will be redirected to Razorpay's secure gateway to complete your payment. All major payment methods accepted.
                                    </p>
                                    <button
                                        id="btn-pay-razorpay"
                                        onClick={handleRazorpay}
                                        disabled={items.length === 0 || processing}
                                        className="w-full bg-black text-white font-bold uppercase tracking-widest py-5 rounded-full
                                            hover:bg-gray-900 hover:scale-[1.02] transition-all duration-300
                                            disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none
                                            shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
                                    >
                                        {processing ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <Loader2 size={20} className="animate-spin" /> Processing…
                                            </span>
                                        ) : (
                                            `Pay ${formatPrice(total)} with Razorpay`
                                        )}
                                    </button>
                                </div>
                            ) : (
                                /* ── PRODUCTION: Simulated checkout bypass ── */
                                <div className="border-2 border-blue-200 rounded-2xl p-6 mb-6 bg-blue-50/40">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <Zap size={18} className="text-blue-600" />
                                            <span className="font-bold text-lg uppercase tracking-tight text-blue-900">Demo Checkout</span>
                                        </div>
                                        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                                            Simulated
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-6">
                                        Razorpay is disabled in this live demo. Clicking below will simulate a successful transaction and save your order.
                                    </p>
                                    <button
                                        id="btn-simulate-checkout"
                                        onClick={handleMockPayment}
                                        disabled={items.length === 0 || processing}
                                        className="w-full bg-blue-600 text-white font-bold uppercase tracking-widest py-5 rounded-full
                                            hover:bg-blue-700 hover:scale-[1.02] transition-all duration-300
                                            disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none
                                            shadow-[0_4px_24px_rgba(37,99,235,0.35)]"
                                    >
                                        {processing ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <Loader2 size={20} className="animate-spin" /> Simulating…
                                            </span>
                                        ) : (
                                            `Simulate Checkout (Demo Mode)`
                                        )}
                                    </button>
                                    <p className="text-xs text-blue-400 text-center mt-3">
                                        Razorpay is disabled in this live demo. Clicking this will simulate a successful transaction.
                                    </p>
                                </div>
                            )}

                            {/* Fine print */}
                            <p className="text-xs text-gray-400 text-center leading-relaxed">
                                By proceeding, you agree to KIXX's{' '}
                                <span className="underline cursor-pointer hover:text-gray-600">Terms of Service</span>{' '}
                                and{' '}
                                <span className="underline cursor-pointer hover:text-gray-600">Privacy Policy</span>.
                                {isLocalhost
                                    ? ' Your payment information is handled securely by Razorpay.'
                                    : ' This demo does not process real payments.'}
                            </p>
                        </div>
                    </div>

                    {/* Right: Order Summary — same glass panel as CheckoutPage */}
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

                            <div className="space-y-4 mb-8 text-lg">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
                                </div>
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

                            {/* Summary CTA also respects environment */}
                            {isLocalhost ? (
                                <button
                                    id="btn-summary-razorpay"
                                    onClick={handleRazorpay}
                                    disabled={items.length === 0 || processing}
                                    className="w-full bg-black text-white font-bold uppercase tracking-widest py-5 rounded-full
                                        hover:bg-gray-900 hover:scale-[1.02] transition-all duration-300
                                        disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
                                >
                                    {processing ? 'Processing…' : `Pay ${formatPrice(total)}`}
                                </button>
                            ) : (
                                <button
                                    id="btn-summary-simulate"
                                    onClick={handleMockPayment}
                                    disabled={items.length === 0 || processing}
                                    className="w-full bg-blue-600 text-white font-bold uppercase tracking-widest py-5 rounded-full
                                        hover:bg-blue-700 hover:scale-[1.02] transition-all duration-300
                                        disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
                                >
                                    {processing ? 'Simulating…' : `Place Order ${formatPrice(total)}`}
                                </button>
                            )}

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
