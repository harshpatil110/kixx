import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getUserOrders } from '../services/orderService';
import useAuthStore from '../store/authStore';
import { Loader2, Package, ChevronRight } from 'lucide-react';
import { formatPrice } from '../utils/currency';

export default function OrderHistoryPage() {
    const { user } = useAuthStore();

    // user object from neon DB should have .id
    const { data: orders, isLoading, isError } = useQuery({
        queryKey: ['userOrders', user?.id],
        queryFn: () => getUserOrders(user?.id),
        enabled: !!user?.id,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center">
                <Loader2 className="animate-spin text-[#800000] h-12 w-12" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-[#F5F5DC] py-16 px-4 text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Error loading order history</h2>
                <p className="text-gray-600">Please try again later.</p>
            </div>
        );
    }

    const isEmpty = !orders || orders.length === 0;

    return (
        <div className="min-h-screen bg-[#F5F5DC] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-black text-gray-900 mb-10 tracking-tight flex items-center">
                    <Package className="w-8 h-8 mr-4 text-[#800000]" />
                    Order History
                </h1>

                {isEmpty ? (
                    <div className="bg-white p-16 rounded-3xl shadow-sm border border-gray-100 text-center flex flex-col items-center">
                        <div className="bg-gray-50 p-6 rounded-full border-2 border-dashed border-gray-200 mb-6">
                            <Package className="h-12 w-12 text-gray-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">No orders yet</h2>
                        <p className="text-gray-500 mb-8 max-w-md font-medium">
                            You haven't placed any orders yet. Once you make a purchase, your complete history will show up here.
                        </p>
                        <Link
                            to="/"
                            className="inline-flex items-center px-8 py-3 rounded-xl bg-[#800000] hover:bg-[#600000] text-white font-bold transition-colors shadow-md"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => {
                            const statusColor =
                                order.status === 'completed' || order.status === 'paid' ? 'bg-green-100 text-green-800 border-green-200' :
                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                        order.status === 'cancelled' ? 'bg-red-100 text-red-800 border-red-200' :
                                            'bg-gray-100 text-gray-800 border-gray-200';

                            return (
                                <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between">
                                        <div className="mb-4 sm:mb-0">
                                            <div className="flex items-center mb-2">
                                                <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mr-4">
                                                    Order #{String(order.id).slice(-8)}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${statusColor}`}>
                                                    {order.status || 'pending'}
                                                </span>
                                            </div>
                                            <div className="text-gray-900 font-medium">
                                                {new Date(order.createdAt).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end sm:w-1/3">
                                            <div className="text-2xl font-black text-[#800000] sm:mr-8">
                                                {formatPrice(order.totalPrice || 0)}
                                            </div>
                                            <Link
                                                to={`/order/${order.id}`}
                                                className="inline-flex items-center justify-center p-3 sm:px-6 sm:py-3 rounded-xl border-2 border-gray-100 hover:border-[#800000] hover:bg-red-50 text-gray-600 hover:text-[#800000] font-bold transition-all group"
                                            >
                                                <span className="hidden sm:inline">View Details</span>
                                                <ChevronRight className="w-5 h-5 sm:ml-2 text-gray-400 group-hover:text-[#800000]" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
