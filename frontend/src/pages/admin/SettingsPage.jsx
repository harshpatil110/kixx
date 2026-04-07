import React, { useState } from 'react';
import { Loader2, Mail, Lock, ShieldAlert, Power } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function SettingsPage() {
  // Account Form State
  const [accountEmail, setAccountEmail] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [isAccountSaving, setIsAccountSaving] = useState(false);

  // Store Form State
  const [storeEmail, setStoreEmail] = useState('support@kixx.com');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isStoreSaving, setIsStoreSaving] = useState(false);

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    if (!accountEmail && !accountPassword) {
      toast.error('Please enter an email or password to update.');
      return;
    }

    setIsAccountSaving(true);
    try {
      const payload = {};
      if (accountEmail) payload.email = accountEmail;
      if (accountPassword) payload.password = accountPassword;

      const res = await api.put('/api/admin/settings/account', payload);
      if (res.data.success) {
        toast.success(res.data.message || 'Account updated successfully');
        setAccountPassword(''); // clear password field after save
      } else {
        throw new Error(res.data.message);
      }
    } catch (error) {
      console.error('Account Settings Error:', error);
      toast.error(error.response?.data?.message || 'Failed to update account settings.');
    } finally {
      setIsAccountSaving(false);
    }
  };

  const handleStoreSubmit = async (e) => {
    e.preventDefault();
    setIsStoreSaving(true);
    
    try {
      const res = await api.put('/api/admin/settings/store', {
        contactEmail: storeEmail,
        maintenanceMode
      });
      
      if (res.data.success) {
        toast.success(res.data.message || 'Store preferences saved');
      } else {
        throw new Error(res.data.message);
      }
    } catch (error) {
      console.error('Store Settings Error:', error);
      toast.error(error.response?.data?.message || 'Failed to save store preferences.');
    } finally {
      setIsStoreSaving(false);
    }
  };

  return (
    <div className="bg-[#F7F5F0] min-h-[calc(100vh-80px)] space-y-8 pb-12">
      {/* ── Header ── */}
      <div>
        <h1 className="text-3xl font-black font-headline tracking-tight text-stone-900">
          Admin Settings
        </h1>
        <p className="text-sm text-stone-500 font-medium mt-1">
          Manage system preferences and core account security.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* ── Account Settings Card ── */}
        <section className="bg-white border border-stone-200 shadow-none rounded-sm">
          <div className="p-6 border-b border-stone-200 bg-stone-50/50">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-stone-900" />
              <h2 className="text-lg font-black text-stone-900 tracking-tight">Account Settings</h2>
            </div>
            <p className="text-xs text-stone-500 font-medium mt-1">
               Update your primary administrator credentials.
            </p>
          </div>
          
          <form onSubmit={handleAccountSubmit} className="p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-stone-600">
                Update Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-stone-400" />
                </div>
                <input
                  type="email"
                  value={accountEmail}
                  onChange={(e) => setAccountEmail(e.target.value)}
                  placeholder="admin@kixx.com"
                  className="block w-full pl-10 pr-3 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-sm focus:ring-1 focus:ring-stone-900 focus:border-stone-900 focus:outline-none transition-all placeholder:text-stone-400 font-medium text-stone-900"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-stone-600">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-stone-400" />
                </div>
                <input
                  type="password"
                  value={accountPassword}
                  onChange={(e) => setAccountPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-sm focus:ring-1 focus:ring-stone-900 focus:border-stone-900 focus:outline-none transition-all placeholder:text-stone-400 font-medium text-stone-900"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isAccountSaving}
                className="w-full flex items-center justify-center py-2.5 px-4 bg-stone-900 text-white rounded-sm hover:bg-stone-800 transition-colors text-xs font-bold uppercase tracking-widest disabled:opacity-70"
              >
                {isAccountSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Save Security Settings'
                )}
              </button>
            </div>
          </form>
        </section>

        {/* ── Store Preferences Card ── */}
        <section className="bg-white border border-stone-200 shadow-none rounded-sm">
          <div className="p-6 border-b border-stone-200 bg-stone-50/50">
            <div className="flex items-center gap-3">
              <Power className="w-5 h-5 text-stone-900" />
              <h2 className="text-lg font-black text-stone-900 tracking-tight">Store Preferences</h2>
            </div>
            <p className="text-xs text-stone-500 font-medium mt-1">
               Manage global storefront flags and contact routing.
            </p>
          </div>

          <form onSubmit={handleStoreSubmit} className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-stone-600">
                Public Contact Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-stone-400" />
                </div>
                <input
                  type="email"
                  required
                  value={storeEmail}
                  onChange={(e) => setStoreEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-sm focus:ring-1 focus:ring-stone-900 focus:border-stone-900 focus:outline-none transition-all placeholder:text-stone-400 font-medium text-stone-900"
                />
              </div>
              <p className="text-[10px] text-stone-400 font-medium mt-1">
                This email is displayed in the footer for customer support.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-bold uppercase tracking-widest text-stone-600">
                Maintenance Mode
              </label>
              <div 
                className="flex items-center justify-between p-4 bg-stone-50 border border-stone-200 rounded-sm cursor-pointer hover:bg-stone-100 transition-colors"
                onClick={() => setMaintenanceMode(!maintenanceMode)}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-stone-900">
                    Halt Storefront Traffic
                  </span>
                  <span className="text-xs text-stone-500 font-medium mt-0.5">
                    Redirects standard users to a temporary "Under Construction" page.
                  </span>
                </div>
                
                {/* Custom Toggle Switch */}
                <div className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out border ${maintenanceMode ? 'bg-[#800000] border-[#800000]' : 'bg-stone-200 border-stone-300'}`}>
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-none transition duration-200 ease-in-out ${maintenanceMode ? 'translate-x-2.5' : '-translate-x-2'}`} />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isStoreSaving}
                className="w-full flex items-center justify-center py-2.5 px-4 bg-stone-900 text-white rounded-sm hover:bg-stone-800 transition-colors text-xs font-bold uppercase tracking-widest disabled:opacity-70"
              >
                {isStoreSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Apply Store Changes'
                )}
              </button>
            </div>
          </form>
        </section>

      </div>
    </div>
  );
}
