import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getOrderById } from '../services/orderService';
import { Loader2, CheckCircle } from 'lucide-react';
import { formatPrice } from '../utils/currency';

export default function OrderConfirmationPage() {
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
            <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-md text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error loading order</h2>
                    <p className="text-gray-600 mb-6">We couldn't retrieve your order details at this time.</p>
                    <Link to="/" className="text-[#800000] font-bold hover:underline">Return Home</Link>
                </div>
            </div>
        );
    }

    const orderDate = new Date(order.createdAt || new Date()).toLocaleDateString();

    return (
        <div className="min-h-screen bg-[#F5F5DC] flex flex-col items-center pt-20 px-4">
            <div className="bg-white max-w-lg w-full rounded-3xl shadow-lg border border-gray-100 p-10 text-center animate-in fade-in zoom-in-95">
                <div className="flex justify-center mb-6">
                    <CheckCircle className="h-24 w-24 text-[#800000]" />
                </div>
                <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">Payment Successful!</h1>
                <p className="text-lg text-gray-500 mb-8 font-medium">
                    Your order has been placed and is being processed.
                </p>

                <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100 text-left">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-gray-500 font-medium">Order ID</span>
                        <span className="text-gray-900 font-bold">{order.id}</span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-gray-500 font-medium">Date</span>
                        <span className="text-gray-900 font-bold">{orderDate}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                        <span className="text-gray-500 font-medium">Total Paid</span>
                        <span className="text-xl text-[#800000] font-black">{formatPrice(order.totalPrice || 0)}</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <Link
                        to={`/order/${order.id}`}
                        className="w-full block py-4 px-6 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-[#800000] hover:bg-[#600000] transition-colors"
                    >
                        View Order Details
                    </Link>
                    <Link
                        to="/"
                        className="w-full block py-4 px-6 border-2 border-gray-200 rounded-xl shadow-sm text-lg font-bold text-gray-600 bg-white hover:bg-gray-50 transition-colors"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}
