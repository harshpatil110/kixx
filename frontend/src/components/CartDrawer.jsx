import React from 'react';
import useCartStore from '../store/cartStore';
import { formatPrice } from '../utils/currency';
import { Link, useNavigate } from 'react-router-dom';

export default function CartDrawer({ isOpen, onClose }) {
    const { items, removeItem, getTotalPrice, getItemCount } = useCartStore();
    const navigate = useNavigate();

    if (!isOpen) return null;

    const itemCount = getItemCount();
    const totalPrice = getTotalPrice();

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden antialiased font-display">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Drawer */}
            <div className="absolute inset-y-0 right-0 w-full md:w-[30%] min-w-[320px] max-w-md bg-black/40 backdrop-blur-[25px] border-l border-white/10 shadow-2xl flex flex-col text-white transform transition-transform duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]">
                {/* Header */}
                <div className="px-6 py-5 flex items-center justify-between border-b border-white/10">
                    <h2 className="text-lg font-bold tracking-tight uppercase">
                        Your Cart <span className="text-gray-400 font-medium ml-2">({itemCount})</span>
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors focus:outline-none"
                    >
                        <span className="material-icons">close</span>
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                            <span className="material-icons text-5xl mb-4 opacity-50">shopping_bag</span>
                            <p className="text-lg font-medium tracking-tight uppercase">Your cart is empty</p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.variantId} className="flex gap-4 items-start group">
                                <div className="w-20 h-20 bg-white/5 rounded-md flex-shrink-0 overflow-hidden relative">
                                    {item.imageUrl ? (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.name}
                                            className="object-cover w-full h-full mix-blend-overlay opacity-80 group-hover:opacity-100 transition-opacity"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-white/10 text-xs">No img</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-sm truncate uppercase tracking-tight text-white">{item.name}</h3>
                                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{item.brand?.name || item.category || 'Sneaker'}</p>
                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-xs text-gray-300 font-medium">Qty: {item.quantity}</span>
                                        <span className="font-bold text-sm text-white">{formatPrice(item.price)}</span>
                                    </div>
                                </div>
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

                {/* Footer */}
                <div className="px-6 py-6 border-t border-white/10 bg-black/20">
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-sm text-gray-300">
                            <span>Subtotal</span>
                            <span className="font-medium text-white">{formatPrice(totalPrice)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-300">
                            <span>Shipping</span>
                            <span className="font-medium text-white">Calculated at next step</span>
                        </div>
                        <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-white/10 mt-2">
                            <span>Total</span>
                            <span>{formatPrice(totalPrice)}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            navigate('/checkout');
                            onClose();
                        }}
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
