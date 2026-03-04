import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { createOrder, processPayment } from '../services/orderService';
import useCartStore from '../store/cartStore';
import { Loader2, CreditCard } from 'lucide-react';
import { formatPrice } from '../utils/currency';

export default function CheckoutPage() {
    const { items, getTotalPrice, clearCart } = useCartStore();
    const navigate = useNavigate();
    const [errorMsg, setErrorMsg] = useState(null);

    const [paymentDetails, setPaymentDetails] = useState({
        cardNumber: '',
        expiry: '',
        cvv: '',
    });

    const checkoutMutation = useMutation({
        mutationFn: async () => {
            // Create the order
            const order = await createOrder(items);
            if (!order || !order.id) throw new Error("Order creation failed or returned invalid data.");

            // Process payment mock
            await processPayment(order.id, paymentDetails);

            return order.id;
        },
        onSuccess: (orderId) => {
            clearCart();
            navigate(`/order-confirmation/${orderId}`);
        },
        onError: (err) => {
            console.error("Checkout failed:", err);
            setErrorMsg(err.message || 'Payment processing failed. Please try again.');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (items.length === 0) {
            setErrorMsg("Your cart is empty!");
            return;
        }
        checkoutMutation.mutate();
    };

    const isPending = checkoutMutation.isPending;

    return (
        <div className="min-h-screen bg-[#F5F5DC] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Payment Form */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
                        <CreditCard className="w-6 h-6 mr-3 text-[#800000]" />
                        Payment Details
                    </h2>

                    {errorMsg && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-lg border-l-4 border-red-500">
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                            <input
                                type="text"
                                required
                                maxLength="16"
                                placeholder="0000 0000 0000 0000"
                                value={paymentDetails.cardNumber}
                                onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                                className="w-full border-gray-300 rounded-lg p-3 bg-gray-50 focus:bg-white focus:ring-[#800000] focus:border-[#800000] outline-none border transition-colors"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry (MM/YY)</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="12/26"
                                    value={paymentDetails.expiry}
                                    onChange={(e) => setPaymentDetails({ ...paymentDetails, expiry: e.target.value })}
                                    className="w-full border-gray-300 rounded-lg p-3 bg-gray-50 focus:bg-white focus:ring-[#800000] focus:border-[#800000] outline-none border transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                                <input
                                    type="text"
                                    required
                                    maxLength="4"
                                    placeholder="123"
                                    value={paymentDetails.cvv}
                                    onChange={(e) => setPaymentDetails({ ...paymentDetails, cvv: e.target.value })}
                                    className="w-full border-gray-300 rounded-lg p-3 bg-gray-50 focus:bg-white focus:ring-[#800000] focus:border-[#800000] outline-none border transition-colors"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isPending || items.length === 0}
                            className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white bg-[#800000] hover:bg-[#600000] focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-[#800000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-8"
                        >
                            {isPending && <Loader2 className="animate-spin h-5 w-5 mr-3" />}
                            {isPending ? 'Processing...' : `Pay ${formatPrice(getTotalPrice())}`}
                        </button>
                    </form>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 p-8 rounded-2xl shadow-sm border border-gray-200">
                    <h2 className="text-2xl font-black text-gray-900 mb-6 border-b border-gray-200 pb-4">
                        Order Summary
                    </h2>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {items.map((item) => (
                            <div key={item.variantId} className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                                <div className="flex items-center">
                                    <div className="w-16 h-16 bg-white rounded-lg border border-gray-100 overflow-hidden flex-shrink-0 mr-4">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">IMG</div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{item.productName}</h4>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {item.size} / {item.color} <span className="mx-1">•</span> Qty: {item.quantity}
                                        </p>
                                    </div>
                                </div>
                                <div className="font-bold text-gray-900 ml-4">
                                    {formatPrice(item.price * item.quantity)}
                                </div>
                            </div>
                        ))}

                        {items.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-8">Your cart is empty.</p>
                        )}
                    </div>

                    <div className="border-t border-gray-200 pt-6 mt-6">
                        <div className="flex justify-between items-center text-xl">
                            <span className="font-bold text-gray-900">Total</span>
                            <span className="font-black text-[#800000]">{formatPrice(getTotalPrice())}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
