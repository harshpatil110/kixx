import React, { useEffect, useState } from 'react';
import { Loader2, AlertTriangle, RefreshCw, Users, X, Package } from 'lucide-react';
import api from '../../services/api';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Slide-over state
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/api/admin/customers');
      if (res.data.success) {
        setCustomers(res.data.data || []);
      } else {
        throw new Error(res.data.message);
      }
    } catch (err) {
      console.error('[Admin Customers] Fetch error:', err.message);
      setError('Unable to load customer directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Fetch detailed orders when a customer is clicked
  useEffect(() => {
    if (!selectedCustomer) {
      setCustomerOrders([]);
      return;
    }
    const fetchCustomerOrders = async () => {
      try {
        setOrdersLoading(true);
        const res = await api.get(`/api/admin/customers/${encodeURIComponent(selectedCustomer.email)}/orders`);
        if (res.data.success) {
          setCustomerOrders(res.data.data || []);
        } else {
          throw new Error('Failed to load orders.');
        }
      } catch (err) {
        console.error('Fetch customer orders error:', err);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchCustomerOrders();
  }, [selectedCustomer]);

  // Formatters
  const formatJoinDate = (isoString) => {
    if (!isoString) return 'N/A';
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      year: 'numeric',
    }).format(d);
  };

  const formatCurrency = (amount) => {
    const num = parseInt(amount, 10) || 0;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const formatFullDate = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  };

  // Metrics
  const totalCustomers = customers.length;
  const customersWithOrders = customers.filter(c => c.totalOrders > 0).length;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-stone-900" />
        <p className="font-label text-xs font-bold text-stone-400 uppercase tracking-widest">
          Loading Directory…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <AlertTriangle className="w-10 h-10 text-red-500" />
        <p className="text-lg font-bold text-stone-900">{error}</p>
        <button
          onClick={fetchCustomers}
          className="px-6 py-2 border border-stone-300 text-stone-900 text-sm font-bold rounded-sm
                     hover:bg-stone-100 transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#F7F5F0] min-h-[calc(100vh-80px)] space-y-6 relative">
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black font-headline tracking-tight text-stone-900">
            Customer Directory
          </h1>
          <p className="text-sm text-stone-500 font-medium mt-1">
            Registered accounts and their lifetime transaction value.
          </p>
        </div>
        <div className="flex items-center gap-4">
           {/* Ledger Metrics Strip */}
           <div className="flex items-center gap-6 px-5 py-2 bg-white border border-stone-200">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Total</span>
                <span className="text-sm font-black text-stone-900">{totalCustomers} Users</span>
              </div>
              <div className="w-px h-8 bg-stone-200" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Active</span>
                <span className="text-sm font-black text-[#800000]">{customersWithOrders} Purchasers</span>
              </div>
           </div>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="flex items-center justify-end">
        <button
          onClick={fetchCustomers}
          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-stone-200
                     rounded-sm text-[11px] font-bold uppercase tracking-widest text-stone-600 
                     hover:bg-stone-50 hover:text-stone-900 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Sync
        </button>
      </div>

      {/* ── Table Container ── */}
      <div className="bg-white border border-stone-200 shadow-none rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-[#F7F5F0] border-b border-stone-200">
              <tr>
                <th className="text-left px-6 py-4 text-[10px] font-bold text-stone-500 uppercase tracking-[0.15em]">
                  Customer Email
                </th>
                <th className="text-left px-6 py-4 text-[10px] font-bold text-stone-500 uppercase tracking-[0.15em]">
                  Join Date
                </th>
                <th className="text-left px-6 py-4 text-[10px] font-bold text-stone-500 uppercase tracking-[0.15em]">
                  Total Orders
                </th>
                <th className="text-right px-6 py-4 text-[10px] font-bold text-stone-500 uppercase tracking-[0.15em]">
                  Lifetime Value
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <p className="text-sm font-bold text-stone-400">No customers found.</p>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr 
                    key={customer.id} 
                    onClick={() => setSelectedCustomer(customer)}
                    className="cursor-pointer hover:bg-stone-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#f1efe9] flex flex-shrink-0 items-center justify-center border border-stone-200">
                           <Users className="w-4 h-4 text-stone-400" />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-sm font-bold text-stone-900">
                             {customer.name || 'Anonymous User'}
                           </span>
                           <span className="text-xs font-medium text-stone-500">
                             {customer.email}
                           </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-stone-500">
                        {formatJoinDate(customer.joinDate)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-stone-900 border border-stone-200 bg-[#F7F5F0] px-2 py-0.5 inline-block">
                        {customer.totalOrders}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-medium text-stone-900">
                        {formatCurrency(customer.lifetimeValue)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer info strip */}
        <div className="bg-stone-50 border-t border-stone-200 px-6 py-3 flex justify-between items-center">
           <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
             Click a row to view customer profile
           </p>
           <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 text-right">
             End of Directory
           </p>
        </div>
      </div>

      {/* ── Slide-Over Panel ── */}
      {selectedCustomer && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-stone-900/40 z-40 transition-opacity"
            onClick={() => setSelectedCustomer(null)}
          />
          
          {/* Panel */}
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#F7F5F0] border-l border-stone-200 shadow-none z-50 overflow-y-auto transform transition-transform duration-300">
            {/* Header */}
            <div className="bg-white border-b border-stone-200 px-6 py-5 flex items-start justify-between sticky top-0 z-10">
              <div className="flex flex-col">
                 <h2 className="text-xl font-black text-stone-900 leading-tight">
                    {selectedCustomer.name || 'Anonymous User'}
                 </h2>
                 <p className="text-sm text-stone-500 font-medium">
                    {selectedCustomer.email}
                 </p>
              </div>
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="p-1 hover:bg-stone-100 rounded-sm transition-colors text-stone-400 hover:text-stone-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile Stats */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white border border-stone-200 p-4 rounded-sm flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold uppercase text-stone-400 tracking-widest mb-1">Total Orders</span>
                    <span className="text-2xl font-black text-stone-900">{selectedCustomer.totalOrders}</span>
                 </div>
                 <div className="bg-white border border-stone-200 p-4 rounded-sm flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold uppercase text-stone-400 tracking-widest mb-1">Lifetime Value</span>
                    <span className="text-2xl font-black text-[#800000]">{formatCurrency(selectedCustomer.lifetimeValue)}</span>
                 </div>
              </div>

              {/* Mini Ledger */}
              <div>
                 <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-stone-500 mb-4 border-b border-stone-200 pb-2">
                   Transaction Ledger
                 </h3>
                 
                 {ordersLoading ? (
                   <div className="py-12 flex justify-center">
                     <Loader2 className="w-6 h-6 animate-spin text-stone-300" />
                   </div>
                 ) : customerOrders.length === 0 ? (
                   <div className="bg-white border border-stone-200 p-6 rounded-sm text-center">
                      <p className="text-sm font-medium text-stone-500">No orders recorded for this user.</p>
                   </div>
                 ) : (
                   <div className="space-y-3">
                     {customerOrders.map(order => {
                        const shortId = order.id ? order.id.split('-')[0].toUpperCase() : 'UNKNOWN';
                        // Extract item names directly from JSON blob
                        const itemsList = order.items && Array.isArray(order.items) 
                          ? order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')
                          : 'Unknown Items';

                        return (
                          <div key={order.id} className="bg-white border border-stone-200 p-4 rounded-sm hover:-translate-y-0.5 transition-transform duration-200">
                             <div className="flex items-center justify-between mb-2">
                               <div className="flex items-center gap-2">
                                 <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 bg-stone-100 text-stone-600 border border-stone-200 rounded-sm">
                                   ID: {shortId}
                                 </span>
                                 <span className="text-xs font-semibold text-stone-500">
                                   {formatFullDate(order.createdAt)}
                                 </span>
                               </div>
                               <span className="text-sm font-black text-stone-900">
                                 {formatCurrency(order.totalAmount)}
                               </span>
                             </div>
                             
                             <div className="flex items-start gap-2 mt-3 pt-3 border-t border-stone-100">
                                <Package className="w-3.5 h-3.5 text-stone-400 mt-0.5 shrink-0" />
                                <p className="text-xs font-medium text-stone-600 leading-relaxed truncate" title={itemsList}>
                                  {itemsList}
                                </p>
                             </div>
                          </div>
                        );
                     })}
                   </div>
                 )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
