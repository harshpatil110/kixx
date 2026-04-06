import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { saveCompletedOrder } from '../services/orderService';
import useCartStore from '../store/cartStore';
import { formatPrice } from '../utils/currency';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
    const { items, getTotalPrice, clearCart } = useCartStore();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [shipping, setShipping] = useState({
        firstName: '', lastName: '', address: '', city: '', pinCode: ''
    });

    const updateShipping = (field, value) => setShipping(prev => ({ ...prev, [field]: value }));

    const [promoCodeInput, setPromoCodeInput] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [promoError, setPromoError] = useState(null);

    const handleApplyPromo = (e) => {
        e.preventDefault();
        if (!promoCodeInput.trim()) return;
        if (promoCodeInput.trim().toUpperCase() === 'FIRSTDROP') {
            setAppliedPromo('FIRSTDROP');
            setPromoError(null);
            toast.success("Promo code FIRSTDROP applied!");
        } else {
            setPromoError('Invalid promo code');
            setAppliedPromo(null);
        }
    };

    const handleRemovePromo = (e) => {
        e.preventDefault();
        setAppliedPromo(null);
        setPromoCodeInput('');
        setPromoError(null);
    };

    const subtotal = getTotalPrice();
    const discount = appliedPromo === 'FIRSTDROP' ? subtotal * 0.10 : 0;
    const discountedSubtotal = subtotal - discount;
    const taxes = Math.round(discountedSubtotal * 0.18);
    const total = discountedSubtotal + taxes;

    const checkoutMutation = useMutation({
        mutationFn: async () => {
             if (!email || !shipping.firstName || !shipping.lastName || !shipping.address || !shipping.city || !shipping.pinCode) {
                 throw new Error("Please fill out all shipping details.");
             }
             if (items.length === 0) {
                 throw new Error("Your cart is empty.");
             }

             // Submit the final payload directly to our backend endpoint that registers 
             // the complete transaction and flips the firstPurchase boolean
             const payload = {
                 email,
                 shippingAddress: shipping,
                 items: items.map(item => ({
                     id: item.productId || item.id || item._id || item.variantId,
                     productId: item.productId || item.id || item._id || item.variantId,
                     quantity: item.quantity,
                     size: item.size,
                     price: item.price
                 })),
                 promoCode: appliedPromo
             };
             return await saveCompletedOrder(payload);
        },
        onSuccess: (data) => {
            clearCart();
            // Expecting data { success: true, order: { id: ...} } from the /save endpoint
            const orderId = data?.order?.id || data?.id || 'new';
            navigate(`/order-confirmation/${orderId}`);
        },
        onError: (err) => {
            toast.error(err.message || 'Payment failed. Please try again.');
        }
    });

    const handleCheckout = (e) => {
        e.preventDefault();
        checkoutMutation.mutate();
    };

    return (
        <div className="font-['Newsreader',serif] bg-[#fbf9f4] text-[#31332c] min-h-screen selection:bg-[#3856c4] selection:text-[#faf8ff]">
            {/* Minimal Background Blur Header */}
            <header className="fixed top-0 w-full z-50 bg-[#fbf9f4]/80 backdrop-blur-md">
                <div className="flex justify-between items-center px-8 h-20 w-full max-w-2xl mx-auto">
                    <Link to="/" className="text-2xl font-black text-[#31332c] tracking-tighter font-['Inter',sans-serif]">KIXX</Link>
                    <div className="flex items-center gap-4 border border-[#b1b3a9]/30 rounded-sm px-4 py-1 hover:bg-[#31332c] hover:text-white transition-colors group">
                        <Link to="/catalog" className="text-[10px] font-bold uppercase tracking-widest font-['Inter',sans-serif] transition-colors">Catalog / Edit Cart</Link>
                    </div>
                </div>
            </header>

            <main className="pt-32 pb-24 px-6 md:px-8 max-w-2xl mx-auto">
                <div className="flex flex-col gap-16">
                    {/* Summary Section */}
                    <section className="border-b border-[#b1b3a9]/20 pb-8">
                        <h1 className="text-4xl font-['Inter',sans-serif] font-black tracking-tight mb-8">Review & Checkout</h1>
                        <div className="space-y-4">
                            
                            <div className="bg-[#f5f4ed]/50 p-6 rounded-sm shadow-sm border border-[#b1b3a9]/20 space-y-4">
                                {items.length === 0 ? (
                                    <p className="text-sm italic text-[#5e6058] text-center pt-2">Your cart is empty.</p>
                                ) : items.map((item, idx) => (
                                    <div key={item.variantId || idx} className="flex justify-between items-center p-3 border-b border-[#b1b3a9]/10 pt-2 pb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-1 border border-[#b1b3a9]/20 bg-white rounded-sm">
                                                <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-contain" />
                                            </div>
                                            <div>
                                                <p className="font-['Inter',sans-serif] font-bold text-xs tracking-tight uppercase text-[#31332c]">{item.name}</p>
                                                <p className="font-['Inter',sans-serif] text-[10px] text-[#5e6058] uppercase mt-1">Qty: {item.quantity} • Size: {item.size || 'OS'}</p>
                                            </div>
                                        </div>
                                        <p className="font-['Inter',sans-serif] font-black text-xs text-[#31332c]">{formatPrice(item.price)}</p>
                                    </div>
                                ))}
                                
                                {/* Promo Logic Integration */}
                                <div className="mt-4 pt-4 border-b border-[#b1b3a9]/20 pb-6">
                                    <label className="font-['Inter',sans-serif] text-[10px] uppercase tracking-widest text-[#5e6058] block mb-3">Redeem Credit</label>
                                    <div className="flex gap-2 h-12">
                                        <input 
                                            value={promoCodeInput} onChange={e => setPromoCodeInput(e.target.value)}
                                            className="flex-1 bg-white border border-[#b1b3a9]/30 rounded-sm px-4 focus:ring-0 focus:border-[#3856c4] font-['Inter',sans-serif] font-bold text-sm outline-none uppercase placeholder:text-[#b1b3a9]" 
                                            placeholder="PROMO CODE" 
                                            disabled={!!appliedPromo}
                                        />
                                        {!appliedPromo ? (
                                            <button onClick={handleApplyPromo} type="button" className="bg-[#31332c] text-white px-6 font-['Inter',sans-serif] font-bold text-[10px] uppercase tracking-widest rounded-sm hover:bg-black transition-colors min-w-[100px]">Apply</button>
                                        ) : (
                                            <button onClick={handleRemovePromo} type="button" className="bg-red-50 text-red-600 px-6 font-['Inter',sans-serif] font-bold text-[10px] uppercase tracking-widest rounded-sm transition-colors border border-red-200 hover:bg-red-100 min-w-[100px]">Remove</button>
                                        )}
                                    </div>
                                    {promoError && <p className="text-[#9e422c] font-['Inter',sans-serif] text-[10px] uppercase tracking-widest mt-3 font-bold">{promoError}</p>}
                                    {appliedPromo && <p className="text-[#3856c4] font-['Inter',sans-serif] font-bold text-[10px] uppercase tracking-widest mt-3">Discount Applied (10% OFF): -{formatPrice(discount)}</p>}
                                </div>

                                <div className="flex justify-between items-end pt-4">
                                    <div className="text-left font-['Inter',sans-serif] text-[9px] uppercase tracking-widest text-[#5e6058] space-y-1">
                                        <p>Subtotal: {formatPrice(subtotal)}</p>
                                        <p>Taxes (18% GST): {formatPrice(taxes)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-['Inter',sans-serif] text-[9px] uppercase tracking-widest text-[#5e6058] mb-1">Total Amount</p>
                                        <p className="font-['Inter',sans-serif] text-2xl font-black tracking-tighter text-[#31332c]">{formatPrice(total)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <form className="space-y-16" onSubmit={handleCheckout}>
                        {/* Shipping Section */}
                        <section>
                            <div className="flex items-center gap-4 mb-8">
                                <span className="w-6 h-6 flex items-center justify-center bg-[#31332c] text-white rounded-full text-[10px] font-['Inter',sans-serif] font-bold">1</span>
                                <h2 className="font-['Inter',sans-serif] text-[10px] uppercase tracking-[0.2em] text-[#5e6058]">Shipping Information</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="font-['Inter',sans-serif] text-[11px] font-bold uppercase tracking-wider text-[#31332c]">Email Address</label>
                                    <input value={email} onChange={e => setEmail(e.target.value)} required type="email" placeholder="curator@kixx.digital" className="w-full bg-[#ffffff] border border-[#b1b3a9]/30 rounded-sm py-4 px-4 focus:ring-0 focus:border-[#3856c4] transition-colors font-['Inter',sans-serif] text-sm outline-none placeholder:font-normal" />
                                </div>
                                <div className="space-y-2">
                                    <label className="font-['Inter',sans-serif] text-[11px] font-bold uppercase tracking-wider text-[#31332c]">First Name</label>
                                    <input value={shipping.firstName} onChange={e => updateShipping('firstName', e.target.value)} required type="text" className="w-full bg-[#ffffff] border border-[#b1b3a9]/30 rounded-sm py-4 px-4 focus:ring-0 focus:border-[#3856c4] transition-colors font-['Inter',sans-serif] text-sm outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="font-['Inter',sans-serif] text-[11px] font-bold uppercase tracking-wider text-[#31332c]">Last Name</label>
                                    <input value={shipping.lastName} onChange={e => updateShipping('lastName', e.target.value)} required type="text" className="w-full bg-[#ffffff] border border-[#b1b3a9]/30 rounded-sm py-4 px-4 focus:ring-0 focus:border-[#3856c4] transition-colors font-['Inter',sans-serif] text-sm outline-none" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="font-['Inter',sans-serif] text-[11px] font-bold uppercase tracking-wider text-[#31332c]">Address</label>
                                    <input value={shipping.address} onChange={e => updateShipping('address', e.target.value)} required type="text" placeholder="House number and street name" className="w-full bg-[#ffffff] border border-[#b1b3a9]/30 rounded-sm py-4 px-4 focus:ring-0 focus:border-[#3856c4] transition-colors font-['Inter',sans-serif] text-sm outline-none placeholder:font-normal" />
                                </div>
                                <div className="space-y-2">
                                    <label className="font-['Inter',sans-serif] text-[11px] font-bold uppercase tracking-wider text-[#31332c]">City</label>
                                    <input value={shipping.city} onChange={e => updateShipping('city', e.target.value)} required type="text" className="w-full bg-[#ffffff] border border-[#b1b3a9]/30 rounded-sm py-4 px-4 focus:ring-0 focus:border-[#3856c4] transition-colors font-['Inter',sans-serif] text-sm outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="font-['Inter',sans-serif] text-[11px] font-bold uppercase tracking-wider text-[#31332c]">Postal Code</label>
                                    <input value={shipping.pinCode} onChange={e => updateShipping('pinCode', e.target.value)} required type="text" className="w-full bg-[#ffffff] border border-[#b1b3a9]/30 rounded-sm py-4 px-4 focus:ring-0 focus:border-[#3856c4] transition-colors font-['Inter',sans-serif] text-sm outline-none" />
                                </div>
                            </div>
                        </section>

                        {/* Payment Section */}
                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <span className="w-6 h-6 flex items-center justify-center bg-[#31332c] text-white rounded-full text-[10px] font-['Inter',sans-serif] font-bold">2</span>
                                    <h2 className="font-['Inter',sans-serif] text-[10px] uppercase tracking-[0.2em] text-[#5e6058]">Payment Method</h2>
                                </div>
                                <div className="flex items-center gap-2 grayscale opacity-60">
                                    <span className="text-[8px] font-['Inter',sans-serif] font-bold uppercase tracking-tighter">Secured by</span>
                                    <span className="font-['Inter',sans-serif] font-black italic tracking-tighter text-[#31332c]">Razorpay</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="relative block cursor-pointer group">
                                    <input defaultChecked className="peer sr-only" name="payment" type="radio" value="razorpay" />
                                    <div className="border border-[#b1b3a9]/20 bg-[#ffffff] p-6 rounded-sm flex items-start gap-4 transition-all peer-checked:border-[#31332c] peer-checked:ring-1 peer-checked:ring-[#31332c]">
                                        <div className="w-4 h-4 rounded-full border border-[#b1b3a9] mt-1 flex items-center justify-center peer-checked:border-[#31332c]">
                                            <div className="w-2 h-2 rounded-full bg-[#31332c] opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-['Inter',sans-serif] font-bold text-sm text-[#31332c]">Online Payment</span>
                                                <div className="flex gap-2 opacity-40 text-[#31332c]">
                                                    <span className="material-symbols-outlined text-lg">credit_card</span>
                                                    <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-[#5e6058] font-['Newsreader',serif]">Cards, UPI, Netbanking, and Wallets via Razorpay.</p>
                                        </div>
                                    </div>
                                </label>
                                <div className="border border-[#b1b3a9]/10 bg-[#f5f4ed]/30 p-6 rounded-sm flex items-start gap-4 opacity-50 cursor-not-allowed">
                                    <div className="w-4 h-4 rounded-full border border-[#b1b3a9]/30 mt-1"></div>
                                    <div className="flex-1">
                                        <span className="font-['Inter',sans-serif] font-bold text-sm text-[#31332c]">Cash on Delivery</span>
                                        <p className="text-xs text-[#5e6058] font-['Newsreader',serif] mt-1">Unavailable for this curated drop.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="pt-8">
                            <button 
                                type="submit"
                                disabled={checkoutMutation.isPending || items.length === 0}
                                className="w-full bg-[#31332c] text-white py-6 rounded-sm font-['Inter',sans-serif] font-bold uppercase text-xs tracking-[0.2em] hover:bg-black transition-all flex justify-center items-center gap-3 active:scale-[0.99] duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {checkoutMutation.isPending ? 'Processing Payment...' : (
                                    <>
                                        Complete Payment <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </>
                                )}
                            </button>
                            <div className="mt-8 flex items-center justify-center gap-6 text-[#5e6058]/60">
                                <div className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-base">verified_user</span>
                                    <span className="text-[9px] font-['Inter',sans-serif] font-bold uppercase tracking-widest text-[#5e6058]">SSL Encrypted</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-base">package_2</span>
                                    <span className="text-[9px] font-['Inter',sans-serif] font-bold uppercase tracking-widest text-[#5e6058]">Insured Delivery</span>
                                </div>
                            </div>
                        </div>
                    </form>

                    {/* Final Minimalist Quote */}
                    <div className="border-t border-[#b1b3a9]/10 pt-16 text-center">
                        <p className="font-['Newsreader',serif] italic text-[#5e6058] text-lg leading-relaxed max-w-lg mx-auto">
                            "True curation is the act of choosing what to exclude. Every pair in your order has passed the KIXX standard for archival longevity."
                        </p>
                        <p className="font-['Inter',sans-serif] text-[10px] font-bold uppercase tracking-widest mt-6 text-[#3856c4]">— The Digital Curator</p>
                    </div>
                </div>
            </main>

            <footer className="w-full py-16 px-8 border-t border-[#b1b3a9]/10 bg-[#f5f4ed]/30 mt-16">
                <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">
                    <div className="font-['Inter',sans-serif] font-black uppercase text-xs tracking-[0.2em] text-[#31332c]">KIXX DIGITAL CURATION</div>
                    <nav className="flex flex-wrap justify-center gap-8">
                        <Link to="/" className="font-['Newsreader',serif] text-xs italic text-[#5e6058] hover:text-[#31332c] transition-opacity opacity-70 hover:opacity-100">Privacy</Link>
                        <Link to="/" className="font-['Newsreader',serif] text-xs italic text-[#5e6058] hover:text-[#31332c] transition-opacity opacity-70 hover:opacity-100">Terms</Link>
                        <Link to="/" className="font-['Newsreader',serif] text-xs italic text-[#5e6058] hover:text-[#31332c] transition-opacity opacity-70 hover:opacity-100">Returns</Link>
                        <Link to="/" className="font-['Newsreader',serif] text-xs italic text-[#5e6058] hover:text-[#31332c] transition-opacity opacity-70 hover:opacity-100">Contact</Link>
                    </nav>
                    <div className="text-[9px] font-['Inter',sans-serif] font-bold text-[#5e6058]/40 uppercase tracking-[0.25em]">
                        © 2026 KIXX DIGITAL. ALL RIGHTS RESERVED.
                    </div>
                </div>
            </footer>
        </div>
    );
}
