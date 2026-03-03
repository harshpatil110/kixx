import React, { useState, useEffect, useMemo } from 'react';

export default function VariantSelector({ variants = [], onSelectVariant }) {
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');

    // Extract unique sizes and colors directly from variants array
    const sizes = useMemo(() => {
        const allSizes = variants.map(v => v.size).filter(Boolean);
        return [...new Set(allSizes)].sort();
    }, [variants]);

    const colors = useMemo(() => {
        const allColors = variants.map(v => v.color).filter(Boolean);
        return [...new Set(allColors)].sort();
    }, [variants]);

    // Find currently matched variant based on size & color state
    const matchedVariant = useMemo(() => {
        if (!selectedSize || !selectedColor) return null;
        return variants.find(v => v.size === selectedSize && v.color === selectedColor);
    }, [selectedSize, selectedColor, variants]);

    // Report the matched variant back to parent component
    useEffect(() => {
        if (onSelectVariant) {
            onSelectVariant(matchedVariant || null);
        }
    }, [matchedVariant, onSelectVariant]);

    return (
        <div className="space-y-8">
            {/* Colors */}
            {colors.length > 0 && (
                <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-3">Color</h4>
                    <div className="flex flex-wrap gap-3">
                        {colors.map(color => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => setSelectedColor(color)}
                                className={`px-5 py-2.5 text-sm font-medium rounded-lg border-2 transition-all ${selectedColor === color
                                        ? 'border-[#800000] bg-[#800000] text-white shadow-md'
                                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {color}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Sizes */}
            {sizes.length > 0 && (
                <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-3">Size</h4>
                    <div className="flex flex-wrap gap-3">
                        {sizes.map(size => (
                            <button
                                key={size}
                                type="button"
                                onClick={() => setSelectedSize(size)}
                                className={`w-14 h-14 flex items-center justify-center text-sm font-bold rounded-lg border-2 transition-all ${selectedSize === size
                                        ? 'border-[#800000] text-[#800000] shadow-md bg-red-50'
                                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Stock Availability Indicator */}
            <div className="pt-2 h-6">
                {selectedSize && selectedColor ? (
                    matchedVariant ? (
                        matchedVariant.stock > 0 ? (
                            <p className="text-sm font-bold text-green-600 flex items-center">
                                <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                In Stock: {matchedVariant.stock} available
                            </p>
                        ) : (
                            <p className="text-sm font-bold text-red-600 flex items-center">
                                <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                                Out of Stock
                            </p>
                        )
                    ) : (
                        <p className="text-sm font-medium text-gray-500 italic">This combination is unavailable.</p>
                    )
                ) : (
                    <p className="text-sm font-medium text-gray-400">Please select a size and color.</p>
                )}
            </div>
        </div>
    );
}
