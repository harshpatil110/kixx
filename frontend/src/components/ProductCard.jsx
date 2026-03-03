import React from 'react';
import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
    if (!product) return null;

    return (
        <Link to={`/product/${product.id}`} className="group block h-full">
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-transform duration-300 hover:scale-105 hover:shadow-md h-full flex flex-col">
                <div className="relative aspect-square w-full bg-gray-100 overflow-hidden flex items-center justify-center">
                    {product.imageUrl ? (
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover object-center group-hover:opacity-90 transition-opacity"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium bg-gray-50">
                            No Image
                        </div>
                    )}
                </div>

                <div className="p-5 flex flex-col flex-grow">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                        {product.brand?.name || 'Unknown Brand'}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
                        {product.name}
                    </h3>
                    <div className="mt-auto pt-2">
                        <span className="text-[#800000] font-black text-xl">
                            ${parseFloat(product.basePrice).toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
