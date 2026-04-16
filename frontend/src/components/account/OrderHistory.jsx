import React from 'react';
import { Link } from 'react-router-dom';
import { Package, PlusCircle, ChevronDown, Download, Archive, ArrowRight, Star, MapPin } from 'lucide-react';
import { formatPrice } from '../../utils/currency';
import { generateInvoice } from '../../utils/generateInvoice';

export default function OrderHistory({ 
    orders, 
    ordersLoading, 
    setIsModalOpen, 
    openReviewModal,
    statusColor,
    statusDot,
    deriveShippingStatus,
    getStatusConfig,
    openTrackingModal
}) {
    return (
        <div className="animate-fade-in">
            <header className="flex flex-wrap justify-between items-end mb-12 border-b border-stone-100 pb-8 gap-6">
                <div>
                    <p className="text-[10px] font-bold tracking-[0.25em] text-stone-400 mb-2 uppercase">Order History</p>
                    <h1 className="text-3xl lg:text-4xl font-black tracking-tighter text-stone-900 uppercase">
                        Archive <span className="text-stone-300">Vault</span>
                    </h1>
                </div>
                
                <div className="flex flex-wrap items-center gap-6">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2.5 px-6 py-3 bg-stone-900 text-white rounded-sm text-[10px] font-black uppercase tracking-[0.2em] hover:bg-stone-800 transition-all shadow-md shadow-stone-900/10"
                    >
                        <PlusCircle size={14} />
                        Append Past Kicks
                    </button>
                    <div className="hidden sm:flex items-center gap-2 border-l border-stone-200 pl-6">
                        <select className="appearance-none bg-transparent py-1 pr-8 text-[10px] font-bold uppercase tracking-widest text-stone-500 focus:outline-none cursor-pointer">
                            <option>Last 30 Days</option>
                            <option>Last 6 Months</option>
                            <option>All Time History</option>
                        </select>
                        <ChevronDown size={14} className="text-stone-400 pointer-events-none -ml-6" />
                    </div>
                </div>
            </header>

            {ordersLoading ? (
                <div className="space-y-8">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="animate-pulse flex gap-8 p-8 border border-stone-100 rounded-sm bg-white">
                            <div className="w-40 h-40 bg-stone-50 rounded-sm" />
                            <div className="flex-grow space-y-4 py-4">
                                <div className="h-4 bg-stone-50 w-1/3" />
                                <div className="h-3 bg-stone-50 w-1/4" />
                                <div className="h-10 bg-stone-50 w-full mt-4" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : orders && orders.length > 0 ? (
                <div className="space-y-6">
                    {orders.map((order, orderIndex) => (
                        <div key={order.id} className="group relative bg-white border border-stone-200 rounded-sm p-8 hover:border-stone-400 transition-all duration-500 overflow-hidden">
                            <div className="flex flex-col sm:flex-row gap-8 items-start relative z-10">
                                {/* Product Image Thumbnail */}
                                <div className="w-full sm:w-40 h-40 bg-stone-50 rounded-sm overflow-hidden flex-shrink-0 flex items-center justify-center p-6 border border-stone-100">
                                    {order.items?.[0]?.imageUrl
                                        ? <img src={order.items[0].imageUrl} alt="Order" className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700" />
                                        : <Archive size={40} strokeWidth={1} className="text-stone-200" />
                                    }
                                </div>

                                <div className="flex-grow flex flex-col justify-between h-40 w-full">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-black text-xl lg:text-2xl uppercase tracking-tighter text-stone-900 leading-none">
                                                    {order.items?.[0]?.name || 'Archived Order'}
                                                    {order.items?.length > 1 && <span className="text-stone-300 ml-2">[{order.items.length}]</span>}
                                                </h3>
                                            </div>
                                            <p className="text-[10px] font-bold text-stone-400 tracking-[0.2em] uppercase">Ref: AX-{order.id.slice(0,8)}</p>
                                            <p className="text-[10px] font-medium text-stone-400 uppercase mt-1 tracking-widest">
                                                {new Date(order.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className="text-right flex flex-col items-end">
                                            <p className="font-black text-2xl tracking-tighter text-stone-900">{formatPrice(order.totalAmount || 0)}</p>
                                            {(() => {
                                                const shippingStatus = deriveShippingStatus ? deriveShippingStatus(order, orderIndex) : (order.status || 'LOGGED');
                                                const cfg = getStatusConfig ? getStatusConfig(shippingStatus) : { label: order.status || 'LOGGED', dotColor: statusDot(order.status) };
                                                return (
                                                    <span className={`inline-flex items-center gap-2 mt-2 px-3 py-1 bg-stone-50 border border-stone-100 text-[9px] font-black uppercase tracking-[0.2em] ${statusColor(order.status)}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
                                                        {cfg.label}
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-6 border-t border-stone-50 pt-5 mt-auto">
                                        <div className="flex items-center gap-8">
                                            <button onClick={() => generateInvoice(order)} className="text-[10px] font-bold tracking-[0.2em] text-stone-400 hover:text-stone-900 transition-colors uppercase flex items-center gap-2">
                                                <Download size={14} /> Export Invoice
                                            </button>
                                            <Link to={`/orders/${order.id}`} className="text-[10px] font-bold tracking-[0.2em] text-stone-900 hover:text-stone-500 transition-colors uppercase flex items-center gap-2">
                                                View Transaction <ArrowRight size={14} />
                                            </Link>
                                        </div>
                                        
                                        <div className="flex items-center gap-4">
                                            {openTrackingModal && (
                                                <button
                                                    onClick={() => openTrackingModal(order)}
                                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-stone-900 hover:bg-stone-100 border border-stone-200 px-4 py-2 transition-all bg-white shadow-sm"
                                                >
                                                    <MapPin size={12} />
                                                    Track
                                                </button>
                                            )}
                                            {order.status === 'DELIVERED' ? (
                                                <button
                                                    onClick={() => openReviewModal(order)}
                                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-stone-900 hover:bg-stone-900 hover:text-white border border-stone-900 px-4 py-2 transition-all shadow-sm"
                                                >
                                                    <Star size={12} />
                                                    Evaluate
                                                </button>
                                            ) : (
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-stone-300 italic whitespace-nowrap hidden md:block">
                                                    * Logistics pending
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    <div className="pt-12 flex justify-center">
                        <button className="px-10 py-3 bg-white border border-stone-200 text-stone-900 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-stone-900 hover:text-white transition-all shadow-sm">
                            Query Older Records
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white border border-stone-200 rounded-sm p-24 flex flex-col items-center text-center">
                    <div className="w-20 h-20 border border-stone-100 rounded-full flex items-center justify-center mb-8 bg-stone-50 opacity-60">
                        <Archive size={32} strokeWidth={1} className="text-stone-300" />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-widest text-stone-900 mb-2">Zero Transactions Logged</h3>
                    <p className="text-sm text-stone-400 max-w-xs mx-auto mb-10 font-medium">Your purchase history and archive contributions will be visualized here once initialized.</p>
                    <Link to="/catalog" className="px-10 py-5 bg-stone-900 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-stone-800 transition-all rounded-sm shadow-xl shadow-stone-900/10">
                        Initiate First Acquisition
                    </Link>
                </div>
            )}
        </div>
    );
}
