import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getOrderById } from '../services/orderService';
import { Loader2, ArrowLeft, Package } from 'lucide-react';
import { formatPrice } from '../utils/currency';

export default function OrderDetailPage() {
    const { id } = useParams();

    const { data: order, isLoading, isError } = useQuery({
        queryKey: ['order', id],
        queryFn: () => getOrderById(id),
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center">
                <Loader2 className="animate-spin text-[#800000] h-12 w-12" />
            </div>
        );
    }

    if (isError || !order) {
        return (
            <div className="min-h-screen bg-[#F5F5DC] flex flex-col items-center justify-center p-4">
                <div className="text-center bg-white p-10 rounded-2xl shadow-sm border border-red-100 max-w-md w-full">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
                    <p className="text-gray-500 mb-8">We couldn't track down this specific order.</p>
                    <Link to="/order-history" className="inline-flex items-center font-bold text-[#800000] hover:underline">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to History
                    </Link>
                </div>
            </div>
        );
    }

    const orderDate = new Date(order.createdAt).toLocaleDateString(undefined, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    const statusColor =
        order.status === 'completed' || order.status === 'paid' ? 'bg-green-100 text-green-800 border-green-200' :
            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                order.status === 'cancelled' ? 'bg-red-100 text-red-800 border-red-200' :
                    'bg-gray-100 text-gray-800 border-gray-200';

    return (
        <div className="min-h-screen bg-[#F5F5DC] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link to="/order-history" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-[#800000] transition-colors uppercase tracking-wider">
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Back to Orders
                    </Link>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="p-8 sm:p-10 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 flex items-center mb-2">
                                <Package className="w-8 h-8 mr-3 text-[#800000]" />
                                Order Details
                            </h1>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                                ID: {order.id}
                            </p>
                            <div className="text-gray-600 font-medium mb-1">{orderDate}</div>
                        </div>
                        <div className="flex flex-col md:items-end gap-3">
                            <span className={`px-4 py-2 rounded-lg text-sm font-bold uppercase border ${statusColor} self-start md:self-auto`}>
                                {order.status || 'pending'}
                            </span>
                            <div className="text-3xl font-black text-[#800000]">
                                {formatPrice(order.totalPrice || 0)}
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="p-8 sm:p-10">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 uppercase tracking-wider">Ordered Items</h3>
                        <div className="space-y-6">
                            {order.items?.map((item, idx) => {
                                // Safeguard nested data expecting Drizzle structure: item -> variant -> product
                                const productName = item.variant?.product?.name || 'Unknown Product';
                                const productImageUrl = item.variant?.product?.imageUrl;
                                const size = item.variant?.size || 'N/A';
                                const color = item.variant?.color || 'N/A';

                                return (
                                    <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center py-4 border-b border-gray-100 last:border-0 last:pb-0">
                                        <div className="w-20 h-20 bg-gray-100 border border-gray-200 rounded-xl overflow-hidden flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                                            {productImageUrl ? (
                                                <img src={productImageUrl} alt={productName} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">IMG</div>
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="text-lg font-bold text-gray-900 mb-1">{productName}</h4>
                                            <p className="text-sm text-gray-500 font-medium">
                                                Size: {size} <span className="mx-2">•</span> Color: {color} <span className="mx-2">•</span> Qty: {item.quantity}
                                            </p>
                                        </div>
                                        <div className="mt-2 sm:mt-0 font-black text-gray-900 text-xl whitespace-nowrap">
                                            {formatPrice((parseFloat(item.price || 0) * (item.quantity || 1)))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
