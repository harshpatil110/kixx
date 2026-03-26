import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { formatPrice } from '../utils/currency';

/**
 * StyleMatchBadge
 * A small circular indicator showing the Style Match Score.
 * Color: red < 40, orange 40-70, green ≥ 70
 */
export function StyleMatchBadge({ score }) {
    if (score === undefined || score === null) return null;

    const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f97316' : '#dc2626';

    const radius = 14;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 100) * circumference;

    return (
        <div className="flex items-center gap-1.5" title={`Style Match: ${score}/100`}>
            <svg width="36" height="36" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="18" cy="18" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="4" />
                <circle
                    cx="18" cy="18" r={radius} fill="none"
                    stroke={color} strokeWidth="4"
                    strokeDasharray={`${progress} ${circumference}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.6s ease' }}
                />
                <text
                    x="18" y="22" textAnchor="middle" fill={color}
                    fontSize="9" fontWeight="bold"
                    style={{ transform: 'rotate(90deg)', transformOrigin: '18px 18px' }}
                >
                    {score}%
                </text>
            </svg>
            <span className="text-xs font-bold" style={{ color }}>
                {score >= 70 ? 'Great Match' : score >= 40 ? 'Good Match' : 'Style Fit'}
            </span>
        </div>
    );
}

export function GuestStyleMatchInfo() {
    return (
        <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-full px-4 py-2 opacity-80">
            <span className="material-icons text-gray-400 text-sm">lock</span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Login for Personal Style Match Score
            </span>
        </div>
    );
}

/**
 * RecommendedFeed
 * Shows a personalized horizontal scrolling feed for a given userId.
 * Falls back to "Trending Now" if no userId is provided (Guest Mode).
 */
export default function RecommendedFeed({ userId }) {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['recommendations', userId || 'trending'],
        queryFn: async () => {
            // If logged in, fetch personalized recommendations
            if (userId) {
                const res = await api.get(`/api/recommendations/${userId}`);
                return res.data.products;
            }
            // If guest, fetch general product catalog as "Trending" feed
            const res = await api.get('/api/products');
            return res.data.slice(0, 10);
        },
        staleTime: 1000 * 60 * 5, 
    });

    if (isError || (!isLoading && !data?.length)) return null;

    return (
        <div className="bg-[#F5F5DC] py-12 px-4 sm:px-6 lg:px-8 border-y border-stone-200/50">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-end gap-3 mb-8">
                    <div>
                        <p className="text-xs font-bold tracking-widest uppercase text-[#800000] mb-2 px-1">
                            {userId ? 'Powered by KIXX AI' : 'Market Trending'}
                        </p>
                        <h2 className="text-3xl font-black text-gray-900 uppercase tracking-wide">
                            {userId ? 'Recommended for You' : 'Trending Hits'}
                        </h2>
                    </div>
                    {userId && (
                        <div className="ml-auto hidden sm:flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#800000] bg-red-50/50 px-3 py-1.5 rounded-full border border-red-100/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#800000] inline-block animate-ping"></span>
                            Refining Live
                        </div>
                    )}
                </div>

                {/* Loading skeleton */}
                {isLoading && (
                    <div className="flex gap-4 overflow-x-hidden">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex-none w-48 h-64 rounded-2xl bg-gray-100 animate-pulse" />
                        ))}
                    </div>
                )}

                {/* Horizontal scroll cards */}
                {!isLoading && data && (
                    <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory hide-scrollbar">
                        {data.map(product => (
                            <Link
                                key={product.id}
                                to={`/products/${product.id}`}
                                className="flex-none w-48 sm:w-56 snap-start group"
                            >
                                <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-square mb-2 shadow-sm group-hover:shadow-lg transition-shadow">
                                    {product.imageUrl ? (
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs uppercase tracking-widest">
                                            No Image
                                        </div>
                                    )}
                                    {/* Style match score overlay */}
                                    {product.styleMatchScore !== undefined && (
                                        <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-black text-[#800000]">
                                            {product.styleMatchScore}%
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 font-medium truncate">{product.brand?.name}</p>
                                <p className="text-sm font-bold text-gray-900 truncate">{product.name}</p>
                                <p className="text-sm font-black text-[#800000]">{formatPrice(parseFloat(product.basePrice))}</p>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
