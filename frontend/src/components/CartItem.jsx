import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import useCartStore from '../store/cartStore';
import { formatPrice } from '../utils/currency';

export default function CartItem({ item }) {
    const { updateQuantity, removeItem } = useCartStore();

    const handleDecrease = () => {
        if (item.quantity > 1) {
            updateQuantity(item.variantId, item.quantity - 1);
        }
    };

    const handleIncrease = () => {
        if (item.quantity < item.stock) {
            updateQuantity(item.variantId, item.quantity + 1);
        }
    };

    const handleRemove = () => {
        removeItem(item.variantId);
    };

    const subtotal = item.price * item.quantity;

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center py-6 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors px-4 rounded-xl">
            {/* Product Image */}
            <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-xl overflow-hidden mb-4 sm:mb-0 mr-6 border border-gray-200">
                {item.imageUrl ? (
                    <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-full h-full object-cover object-center"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-medium">
                        No Image
                    </div>
                )}
            </div>

            {/* Product Details */}
            <div className="flex-grow flex flex-col justify-between self-stretch">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-2">
                        {item.productName}
                    </h3>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-1">
                        {item.brandName || 'KIXX EXCLUSIVE'}
                    </p>
                    <div className="flex items-center text-gray-500 text-sm mt-2 space-x-4 font-medium">
                        <span className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-gray-300 mr-2"></span>
                            Size: <strong className="ml-1 text-gray-700">{item.size}</strong>
                        </span>
                        <span className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-gray-300 mr-2"></span>
                            Color: <strong className="ml-1 text-gray-700">{item.color}</strong>
                        </span>
                    </div>
                </div>

                {/* Pricing for mobile */}
                <div className="mt-4 sm:hidden font-black text-lg text-[#800000]">
                    {formatPrice(subtotal)}
                </div>
            </div>

            {/* Quantity & Actions */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto mt-4 sm:mt-0 space-y-0 sm:space-y-4">
                {/* Desktop Pricing */}
                <div className="hidden sm:block font-black text-2xl text-[#800000]">
                    {formatPrice(subtotal)}
                </div>

                <div className="flex items-center flex-row space-x-6">
                    {/* Quantity Selector */}
                    <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                        <button
                            onClick={handleDecrease}
                            disabled={item.quantity <= 1}
                            className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2 font-bold text-gray-900 min-w-[3rem] text-center border-x-2 border-gray-100">
                            {item.quantity}
                        </span>
                        <button
                            onClick={handleIncrease}
                            disabled={item.quantity >= item.stock}
                            className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Remove Button */}
                    <button
                        onClick={handleRemove}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors flex items-center justify-center sm:self-end"
                        title="Remove item"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
