import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProductById } from '../services/productService';
import VariantSelector from '../components/VariantSelector';
import useCartStore from '../store/cartStore';
import { Loader2, ArrowLeft, CheckCircle2, ShoppingBag } from 'lucide-react';

export default function ProductDetailPage() {
    const { id } = useParams();
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const addItem = useCartStore((state) => state.addItem);

    const { data: product, isLoading, isError, error } = useQuery({
        queryKey: ['product', id],
        queryFn: () => getProductById(id),
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center">
                <Loader2 className="animate-spin text-[#800000] h-14 w-14" />
            </div>
        );
    }

    if (isError || !product) {
        return (
            <div className="min-h-screen bg-[#F5F5DC] flex flex-col items-center justify-center px-4">
                <div className="text-center p-10 bg-white rounded-2xl shadow-lg border border-red-100 max-w-lg w-full">
                    <h2 className="text-3xl font-black text-gray-900 mb-4">Item Not Found</h2>
                    <p className="text-gray-500 mb-8 text-lg">
                        {error?.message || "We couldn't track down this specific product. It may have been removed."}
                    </p>
                    <Link to="/" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-bold rounded-lg text-white bg-[#800000] hover:bg-[#600000] transition-colors">
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Back to Catalog
                    </Link>
                </div>
            </div>
        );
    }

    const handleAddToCart = () => {
        if (!selectedVariant || selectedVariant.stock <= 0) return;

        // Favor variant price if specific; otherwise fallback to basePrice
        const priceToUse = selectedVariant.price ? parseFloat(selectedVariant.price) : parseFloat(product.basePrice);

        addItem({
            productId: product.id,
            productName: product.name,
            brandName: product.brand?.name || 'Unknown',
            imageUrl: product.imageUrl,
            variantId: selectedVariant.id,
            size: selectedVariant.size,
            color: selectedVariant.color,
            price: priceToUse,
            stock: selectedVariant.stock,
            quantity: 1,
        });

        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000); // Hide toast after 3s
    };

    const isAddToCartDisabled = !selectedVariant || selectedVariant.stock <= 0;

    // Real-time UI price 
    const displayPrice = selectedVariant?.price
        ? parseFloat(selectedVariant.price)
        : parseFloat(product.basePrice);

    return (
        <div className="min-h-screen bg-[#F5F5DC] py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="mb-8">
                    <Link to="/" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-[#800000] transition-colors uppercase tracking-wider">
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Back to Catalog
                    </Link>
                </div>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden lg:flex border border-gray-100">
                    {/* Image Pane */}
                    <div className="lg:w-[55%] p-10 flex items-center justify-center bg-gray-50 relative border-r border-gray-100">
                        {product.imageUrl ? (
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full max-w-xl h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full aspect-square max-w-md bg-gray-200 rounded-2xl flex items-center justify-center text-gray-400 font-bold text-xl tracking-widest uppercase">
                                Image Placeholder
                            </div>
                        )}
                    </div>

                    {/* Configuration Pane */}
                    <div className="lg:w-[45%] p-10 lg:p-14 flex flex-col bg-white">
                        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">
                            {product.brand?.name || 'Unknown Brand'}
                        </h2>
                        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6 leading-tight">
                            {product.name}
                        </h1>

                        <div className="text-4xl font-black text-[#800000] mb-8">
                            ${displayPrice.toFixed(2)}
                        </div>

                        <p className="text-gray-600 text-lg leading-relaxed mb-10 font-medium">
                            {product.description || 'No specialized description provided.'}
                        </p>

                        <div className="mb-10 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <VariantSelector
                                variants={product.variants || []}
                                onSelectVariant={setSelectedVariant}
                            />
                        </div>

                        <div className="mt-auto pt-4 relative">
                            <button
                                onClick={handleAddToCart}
                                disabled={isAddToCartDisabled}
                                className="w-full flex items-center justify-center py-5 px-8 border border-transparent rounded-2xl shadow-lg text-xl font-black text-white bg-[#800000] hover:bg-[#600000] focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-[#800000] transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                            >
                                <ShoppingBag className="w-6 h-6 mr-3" />
                                {isAddToCartDisabled
                                    ? (selectedVariant && selectedVariant.stock <= 0 ? 'Out of Stock' : 'Select Size & Color')
                                    : 'Add to Cart'
                                }
                            </button>

                            {/* Temporary Success Toast */}
                            <div
                                className={`absolute -top-16 left-0 right-0 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center shadow-lg text-green-700 transition-all duration-300 transform ${showSuccess ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
                            >
                                <CheckCircle2 className="h-6 w-6 mr-3" />
                                <span className="font-bold text-lg">Added to cart successfully!</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
