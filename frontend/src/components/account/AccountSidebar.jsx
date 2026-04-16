import React from 'react';
import { Link } from 'react-router-dom';
import { User, Package, Heart, CreditCard, LogOut } from 'lucide-react';

export default function AccountSidebar({ user, activeTab, setActiveTab, onSignOut, isSigningOut }) {
    const displayName = user?.name || 'Sneakerhead';
    const persona = user?.persona || 'Casual';

    const navItems = [
        { id: 'PROFILE', label: 'Profile', icon: User },
        { id: 'ORDERS', label: 'Order History', icon: Package },
    ];

    return (
        <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white border border-stone-200 rounded-sm p-8 sticky top-32">
                {/* User Header */}
                <div className="flex flex-col items-center text-center mb-10 pb-8 border-b border-stone-50">
                    <div className="w-16 h-16 rounded-full bg-stone-900 flex items-center justify-center text-white font-bold text-xl mb-4 shadow-sm">
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                    <h2 className="font-bold text-lg text-stone-900 tracking-tight uppercase leading-none mb-1">{displayName}</h2>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">{persona}</p>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`
                                    w-full flex items-center gap-4 py-3 pl-4 border-l-2 transition-all duration-300
                                    ${isActive 
                                        ? 'border-stone-900 text-stone-900 bg-stone-50/30' 
                                        : 'border-transparent text-stone-400 hover:text-stone-900 hover:pl-5'}
                                `}
                            >
                                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                <span className={`text-xs font-bold uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                    
                    <Link to="/catalog" className="flex items-center gap-4 py-3 pl-4 border-l-2 border-transparent text-stone-400 hover:text-stone-900 transition-all duration-300 hover:pl-5">
                        <Heart size={18} />
                        <span className="text-xs font-bold uppercase tracking-widest opacity-80">Wishlist</span>
                    </Link>
                    
                    <Link to="/catalog" className="flex items-center gap-4 py-3 pl-4 border-l-2 border-transparent text-stone-400 hover:text-stone-900 transition-all duration-300 hover:pl-5">
                        <CreditCard size={18} />
                        <span className="text-xs font-bold uppercase tracking-widest opacity-80">Payments</span>
                    </Link>

                    <div className="pt-8 mt-4 border-t border-stone-50">
                        <button
                            onClick={onSignOut}
                            disabled={isSigningOut}
                            className="flex items-center gap-4 py-3 pl-4 text-stone-400 hover:text-red-900 transition-all duration-300 group disabled:opacity-50"
                        >
                            <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.25em]">
                                {isSigningOut ? 'Disconnecting…' : 'Log Out'}
                            </span>
                        </button>
                    </div>
                </nav>
            </div>
        </aside>
    );
}
