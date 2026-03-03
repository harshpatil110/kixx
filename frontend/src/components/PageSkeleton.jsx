import React from 'react';

/**
 * A collection of skeleton shimmer components used as Suspense fallbacks
 * while lazy-loaded route chunks are being fetched.
 */

// Base animated shimmer block
const Shimmer = ({ className = '' }) => (
    <div
        className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded ${className}`}
        style={{ animation: 'shimmer 1.5s infinite linear' }}
    />
);

// Skeleton for the HomePage product grid
export function HomePageSkeleton() {
    return (
        <div className="min-h-screen bg-[#F5F5DC] pb-24">
            {/* Hero shimmer */}
            <div className="bg-gradient-to-tr from-[#800000] to-[#600000] py-24 px-4 sm:px-6 lg:px-8 mb-12 flex flex-col items-center gap-4">
                <Shimmer className="h-12 w-72 md:w-[500px] rounded-xl bg-white/20" />
                <Shimmer className="h-6 w-48 md:w-80 rounded-lg bg-white/10" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Filter bar shimmer */}
                <div className="mb-10 flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <Shimmer className="h-8 w-48 rounded-lg" />
                    <Shimmer className="h-10 w-40 rounded-xl" />
                </div>

                {/* Product grid shimmer — 4 col on desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                            <Shimmer className="aspect-square w-full rounded-none" />
                            <div className="p-5 space-y-3">
                                <Shimmer className="h-3 w-20 rounded" />
                                <Shimmer className="h-5 w-full rounded" />
                                <Shimmer className="h-4 w-3/4 rounded" />
                                <Shimmer className="h-6 w-24 rounded mt-2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
        </div>
    );
}

// Skeleton for the ProductDetailPage
export function ProductDetailSkeleton() {
    return (
        <div className="min-h-screen bg-[#F5F5DC] py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Shimmer className="h-5 w-32 mb-8 rounded" />
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden lg:flex border border-gray-100">
                    {/* Image pane shimmer */}
                    <div className="lg:w-[55%] p-10 bg-gray-50">
                        <Shimmer className="w-full aspect-square max-w-xl mx-auto rounded-2xl" />
                    </div>
                    {/* Info pane shimmer */}
                    <div className="lg:w-[45%] p-10 lg:p-14 space-y-5">
                        <Shimmer className="h-4 w-24 rounded" />
                        <Shimmer className="h-10 w-3/4 rounded-lg" />
                        <Shimmer className="h-10 w-28 rounded-lg" />
                        <Shimmer className="h-4 w-full rounded" />
                        <Shimmer className="h-4 w-5/6 rounded" />
                        <Shimmer className="h-4 w-4/6 rounded" />
                        <div className="pt-6 space-y-3">
                            <Shimmer className="h-12 w-full rounded-xl" />
                            <Shimmer className="h-12 w-full rounded-xl" />
                        </div>
                        <Shimmer className="h-14 w-full rounded-2xl mt-4" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Generic full-page skeleton for auth / simple pages
export function GenericPageSkeleton() {
    return (
        <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center p-8">
            <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-md space-y-5">
                <Shimmer className="h-10 w-40 mx-auto rounded-lg" />
                <Shimmer className="h-4 w-full rounded" />
                <Shimmer className="h-4 w-5/6 rounded" />
                <Shimmer className="h-12 w-full rounded-xl mt-4" />
                <Shimmer className="h-12 w-full rounded-xl" />
                <Shimmer className="h-14 w-full rounded-2xl mt-6" />
            </div>
        </div>
    );
}

// Cart / Order pages skeleton (list-style)
export function ListPageSkeleton() {
    return (
        <div className="min-h-screen bg-[#F5F5DC] py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <Shimmer className="h-10 w-48 rounded-xl mb-8" />
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex gap-6">
                        <Shimmer className="h-28 w-28 rounded-xl flex-shrink-0" />
                        <div className="flex-1 space-y-3">
                            <Shimmer className="h-4 w-24 rounded" />
                            <Shimmer className="h-6 w-3/4 rounded-lg" />
                            <Shimmer className="h-4 w-1/2 rounded" />
                            <Shimmer className="h-5 w-20 rounded mt-2" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
