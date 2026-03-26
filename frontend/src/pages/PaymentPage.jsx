import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Lock, Shield, ArrowLeft, Trash2, Loader2, Zap, CreditCard, Smartphone, X } from 'lucide-react';
import toast from 'react-hot-toast';
import useCartStore from '../store/cartStore';
import { formatPrice } from '../utils/currency';
import { saveCompletedOrder } from '../services/orderService';
import { generateInvoice } from '../utils/generateInvoice';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function PaymentPage() {
    const { items, getTotalPrice, removeItem, clearCart } = useCartStore();
    const navigate = useNavigate();
    const [errorMsg, setErrorMsg] = useState(null);

    // Modal state
    const [showMockModal, setShowMockModal] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState('upi');
    const [isProcessing, setIsProcessing] = useState(false);

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
    // The Fake Processor
    // -----------------------------------------------------------------------
    const executeMockPayment = async () => {
        if (items.length === 0) return;

        const checkoutData = getCheckoutData();
        if (!checkoutData?.email) {
            setErrorMsg('Missing checkout info. Please go back and complete checkout steps.');
            setShowMockModal(false);
            return;
        }

        setIsProcessing(true);
        setErrorMsg(null);

        const toastId = toast.loading('Processing Securely...');

        try {
            // Simulate network latency (2000ms as per directive)
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Save the order directly (no real payment gateway involved)
            await saveCompletedOrder({
                email: checkoutData.email,
                shippingAddress: checkoutData.shipping,
                items: items.map((item) => ({
                    id: item.id || item._id || item.productId,
                    quantity: item.quantity,
                    price: item.price
                })),
                totalAmount: total,
            });

            const orderData = {
                id: `ORD-${Date.now()}`,
                email: checkoutData.email,
                shippingAddress: checkoutData.shipping,
                items: items,
                totalAmount: total,
                createdAt: new Date().toISOString()
            };

            generateInvoice(orderData);

            clearCart();
            sessionStorage.removeItem('kixx-checkout-data');
            toast.success('Payment Successful!', { id: toastId });
            setShowMockModal(false);
            navigate('/account');
        } catch (err) {
            console.error('Mock payment error:', err);
            const backendMsg = err?.response?.data?.message || err.message || 'Transaction failed. Please try again.';
            toast.error(backendMsg, { id: toastId });
            setErrorMsg(backendMsg);
            setIsProcessing(false);
        }
    };

    return (
        <div
            className="font-['Space_Grotesk',sans-serif] text-gray-900 min-h-screen relative"
            style={{ background: 'linear-gradient(135deg,#e0eafc 0%,#cfdef3 100%)', backgroundAttachment: 'fixed' }}
        >
            {/* Nav — same as CheckoutPage */}
            <nav className="w-full px-8 py-6 flex justify-between items-center fixed top-0 z-50 mix-blend-difference text-white">
                <Link to="/" className="text-3xl font-black tracking-tighter uppercase relative z-50">KIXX</Link>
                <div className="flex gap-6 items-center relative z-50">
                    <ShoppingBag className="w-6 h-6 cursor-pointer" />
                </div>
            </nav>

            <main className="pt-32 pb-24 px-8 max-w-7xl mx-auto">
                {/* Back link */}
                <button
                    onClick={() => navigate('/checkout')}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-8 uppercase tracking-wider relative z-10"
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
                        <div className="bg-white rounded-[32px] p-8 shadow-xl relative z-10">
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

                            <div className="border-2 border-black rounded-2xl p-6 mb-6 bg-gray-50/50">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-black" />
                                        <span className="font-bold text-lg uppercase tracking-tight">Secure Payment</span>
                                    </div>
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:block">
                                        UPI • Cards • NetBanking • Wallets
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mb-6 font-medium">
                                    Click below to securely complete your order. You can choose from multiple payment methods including UPI and Cards.
                                </p>
                                <button
                                    onClick={() => setShowMockModal(true)}
                                    disabled={items.length === 0}
                                    className="w-full bg-black text-white font-bold uppercase tracking-widest py-5 rounded-full
                                        hover:bg-gray-900 hover:scale-[1.02] transition-all duration-300
                                        disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none
                                        shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
                                >
                                    Proceed to Pay {formatPrice(total)}
                                </button>
                            </div>

                            {/* Fine print */}
                            <p className="text-xs text-gray-400 text-center leading-relaxed font-medium">
                                By proceeding, you agree to KIXX's{' '}
                                <span className="underline cursor-pointer hover:text-gray-600">Terms of Service</span>{' '}
                                and{' '}
                                <span className="underline cursor-pointer hover:text-gray-600">Privacy Policy</span>.
                            </p>
                        </div>
                    </div>

                    {/* Right: Order Summary */}
                    <div className="lg:col-span-5 sticky top-32 z-10">
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
                                            <p className="text-sm text-gray-500 mb-2 font-medium">
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

                            <div className="space-y-4 mb-8 text-lg font-medium">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-bold text-gray-900">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="font-bold text-gray-900">Free</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Taxes (18% GST)</span>
                                    <span className="font-bold text-gray-900">{formatPrice(taxes)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-black/10 mt-4">
                                    <span className="font-bold text-2xl uppercase text-gray-900">Total</span>
                                    <span className="font-bold text-3xl tracking-tighter text-gray-900">{formatPrice(total)}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowMockModal(true)}
                                disabled={items.length === 0}
                                className="w-full bg-black text-white font-bold uppercase tracking-widest py-5 rounded-full
                                    hover:bg-gray-900 hover:scale-[1.02] transition-all duration-300
                                    disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
                            >
                                Place Order {formatPrice(total)}
                            </button>

                            <div className="mt-6 flex justify-center items-center gap-2 text-sm text-gray-500 font-medium">
                                <Lock className="w-4 h-4" />
                                <span>Secure SSL encrypted checkout</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ----------------------------------------------------------------------- */}
                {/* MOCK RAZORPAY MODAL (Simulating Payment Gateway)                        */}
                {/* ----------------------------------------------------------------------- */}
                {showMockModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="max-w-4xl w-full flex bg-white rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative max-h-[90vh] flex-col md:flex-row">
                            
                            <button 
                                onClick={() => !isProcessing && setShowMockModal(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors z-10 bg-white/50 md:bg-transparent rounded-full p-1"
                                disabled={isProcessing}
                            >
                                <X size={24} />
                            </button>

                            {/* Left Panel (Dark) */}
                            <div className="bg-[#1A1A1A] text-white w-full md:w-1/3 p-8 md:p-10 flex flex-col justify-between">
                                <div>
                                    <div className="font-black tracking-tighter text-4xl mb-10 uppercase text-white hidden md:block">KIXX</div>
                                    <div className="font-black tracking-tighter text-2xl mb-4 uppercase text-white md:hidden">KIXX</div>
                                    
                                    <div className="mb-2 text-gray-400 text-xs font-bold uppercase tracking-[0.2em]">Price Summary</div>
                                    <div className="text-4xl md:text-5xl font-black tracking-tight text-white mb-8 border-b border-gray-800 pb-8">
                                        {formatPrice(total)}
                                    </div>
                                    
                                    <div className="space-y-4 mb-8 text-sm font-medium">
                                        <div className="flex justify-between text-gray-400">
                                            <span>Subtotal</span>
                                            <span className="text-white">{formatPrice(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-400">
                                            <span>GST (18%)</span>
                                            <span className="text-white">{formatPrice(taxes)}</span>
                                        </div>
                                        <div className="mt-6 bg-white/5 px-4 py-3 rounded-xl border border-white/10">
                                            <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-bold">Billed to</div>
                                            <div className="text-sm text-gray-300 truncate">
                                                {getCheckoutData()?.email || 'guest@example.com'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 font-bold bg-white/5 py-4 rounded-xl mt-4 md:mt-0">
                                    <Shield size={14} className="text-green-500" />
                                    <span>256-bit Secure Mock Gateway</span>
                                </div>
                            </div>

                            {/* Right Panel (Light) */}
                            <div className="w-full md:w-2/3 p-8 md:p-10 overflow-y-auto">
                                <h3 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-tight">Payment Options</h3>
                                
                                <div className="space-y-4">
                                    {/* UPI Option */}
                                    <div className={`border-2 rounded-2xl transition-all duration-300 overflow-hidden ${selectedMethod === 'upi' ? 'border-[#800000] shadow-[0_4px_20px_rgba(128,0,0,0.1)]' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <button 
                                            className="w-full p-5 flex items-center gap-4 text-left focus:outline-none bg-white"
                                            onClick={() => setSelectedMethod('upi')}
                                            disabled={isProcessing}
                                        >
                                            <div className="flex-grow font-black text-lg text-gray-900 flex items-center gap-3">
                                                <Smartphone size={24} className={selectedMethod === 'upi' ? 'text-[#800000]' : 'text-gray-400'} />
                                                UPI Transaction
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'upi' ? 'border-[#800000]' : 'border-gray-300'}`}>
                                                {selectedMethod === 'upi' && <div className="w-3 h-3 rounded-full bg-[#800000]" />}
                                            </div>
                                        </button>

                                        {selectedMethod === 'upi' && (
                                            <div className="px-5 pb-5 animate-in slide-in-from-top-2 duration-300 bg-red-50/30">
                                                <input 
                                                    type="text" 
                                                    placeholder="Enter any UPI ID (e.g., test@ybl)" 
                                                    disabled={isProcessing}
                                                    defaultValue="test@ybl"
                                                    className="w-full p-4 border-2 border-gray-200 rounded-xl outline-none focus:border-[#800000] mb-4 bg-white font-medium text-gray-900 transition-colors shadow-sm"
                                                />
                                                <button
                                                    onClick={executeMockPayment}
                                                    disabled={isProcessing}
                                                    className="w-full bg-[#800000] text-white font-black uppercase tracking-widest py-4 rounded-xl
                                                        hover:bg-[#600000] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                                                >
                                                    {isProcessing ? (
                                                        <>
                                                            <Loader2 size={20} className="animate-spin" /> Processing Securely...
                                                        </>
                                                    ) : (
                                                        'Verify & Pay'
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Option */}
                                    <div className={`border-2 rounded-2xl transition-all duration-300 ${selectedMethod === 'card' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <button 
                                            className="w-full p-5 flex items-center gap-4 text-left focus:outline-none bg-transparent"
                                            onClick={() => setSelectedMethod('card')}
                                            disabled={isProcessing}
                                        >
                                            <div className="flex-grow font-bold text-lg text-gray-900 flex items-center gap-3">
                                                <CreditCard size={24} className="text-gray-400" />
                                                Credit / Debit Card
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'card' ? 'border-gray-900' : 'border-gray-300'}`}>
                                                {selectedMethod === 'card' && <div className="w-3 h-3 rounded-full bg-gray-900" />}
                                            </div>
                                        </button>
                                        
                                        {selectedMethod === 'card' && (
                                            <div className="px-5 pb-5 animate-in slide-in-from-top-2 duration-300 border-t border-gray-200 pt-5">
                                                <p className="text-sm font-medium text-gray-500 mb-5 text-center">
                                                    Card processing simulated. Click below to confirm order.
                                                </p>
                                                <button
                                                    onClick={executeMockPayment}
                                                    disabled={isProcessing}
                                                    className="w-full bg-gray-900 text-white font-black uppercase tracking-widest py-4 rounded-xl
                                                        hover:bg-black transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
                                                >
                                                    {isProcessing ? (
                                                        <>
                                                            <Loader2 size={20} className="animate-spin" /> Processing Securely...
                                                        </>
                                                    ) : (
                                                        'Confirm & Pay'
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Netbanking Option */}
                                    <div className={`border-2 rounded-2xl transition-all duration-300 ${selectedMethod === 'netbanking' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <button 
                                            className="w-full p-5 flex items-center gap-4 text-left focus:outline-none bg-transparent"
                                            onClick={() => setSelectedMethod('netbanking')}
                                            disabled={isProcessing}
                                        >
                                            <div className="flex-grow font-bold text-lg text-gray-900 flex items-center gap-3">
                                                <Zap size={24} className="text-gray-400" />
                                                NetBanking
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'netbanking' ? 'border-gray-900' : 'border-gray-300'}`}>
                                                {selectedMethod === 'netbanking' && <div className="w-3 h-3 rounded-full bg-gray-900" />}
                                            </div>
                                        </button>
                                        
                                        {selectedMethod === 'netbanking' && (
                                            <div className="px-5 pb-5 animate-in slide-in-from-top-2 duration-300 border-t border-gray-200 pt-5">
                                                <p className="text-sm font-medium text-gray-500 mb-5 text-center">
                                                    Netbanking processing simulated. Click below to confirm order.
                                                </p>
                                                <button
                                                    onClick={executeMockPayment}
                                                    disabled={isProcessing}
                                                    className="w-full bg-gray-900 text-white font-black uppercase tracking-widest py-4 rounded-xl
                                                        hover:bg-black transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
                                                >
                                                    {isProcessing ? (
                                                        <>
                                                            <Loader2 size={20} className="animate-spin" /> Processing Securely...
                                                        </>
                                                    ) : (
                                                        'Confirm & Pay'
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
