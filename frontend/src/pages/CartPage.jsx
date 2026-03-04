import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import useCartStore from '../store/cartStore';
import CartItem from '../components/CartItem';
import { formatPrice } from '../utils/currency';

export default function CartPage() {
    const { items, getTotalPrice, getItemCount } = useCartStore();
    const navigate = useNavigate();

    const handleCheckout = () => {
        navigate('/checkout');
    };

    const isEmpty = items.length === 0;

    return (
        <div className="min-h-screen bg-[#F5F5DC] py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-black text-gray-900 mb-10 tracking-tight">Shopping Cart</h1>

                {isEmpty ? (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95">
                        <div className="bg-gray-50 p-6 rounded-full border-2 border-dashed border-gray-200 mb-6">
                            <ShoppingBag className="h-16 w-16 text-gray-300" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
                        <p className="text-gray-500 mb-8 max-w-sm font-medium">
                            Looks like you haven't added any kicks to your collection yet. Start browsing to step up your game.
                        </p>
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-[#800000] hover:bg-[#600000] transition-transform hover:scale-105 shadow-md"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                        {/* Main Cart Items Column */}
                        <div className="lg:w-2/3 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
                            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-50">
                                <h2 className="text-xl font-bold text-gray-900">Items ({getItemCount()})</h2>
                            </div>
                            <div className="space-y-2">
                                {items.map((item) => (
                                    <CartItem key={item.variantId} item={item} />
                                ))}
                            </div>
                        </div>

                        {/* Order Summary Column */}
                        <div className="lg:w-1/3">
                            <div className="bg-gray-50 rounded-3xl shadow-sm border border-gray-200 p-8 sticky top-8">
                                <h2 className="text-2xl font-black text-gray-900 mb-6 uppercase tracking-wider">
                                    Order Summary
                                </h2>

                                <div className="space-y-4 text-sm font-medium text-gray-600 mb-8">
                                    <div className="flex justify-between">
                                        <span>Subtotal ({getItemCount()} items)</span>
                                        <span className="font-bold text-gray-900">{formatPrice(getTotalPrice())}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-gray-100 p-3 rounded-lg">
                                        <span>Shipping</span>
                                        <span className="text-gray-500 font-bold italic text-xs">Calculated at checkout</span>
                                    </div>
                                    <div className="flex justify-between items-center border-t-2 border-gray-200 pt-4 mt-4">
                                        <span className="text-xl font-bold text-gray-900">Total</span>
                                        <span className="text-3xl font-black text-[#800000]">
                                            {formatPrice(getTotalPrice())}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <button
                                        onClick={handleCheckout}
                                        disabled={isEmpty}
                                        className="w-full flex items-center justify-center py-5 px-6 border border-transparent rounded-2xl shadow-lg text-xl font-black text-white bg-[#800000] hover:bg-[#600000] focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-[#800000] transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                                    >
                                        Proceed to Checkout
                                        <ArrowRight className="ml-3 h-6 w-6" />
                                    </button>
                                    <Link
                                        to="/"
                                        className="w-full flex justify-center py-4 px-6 border-2 border-gray-200 rounded-2xl shadow-sm text-lg font-bold text-gray-600 bg-white hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                    >
                                        Continue Shopping
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
