import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  Users,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/inventory', label: 'Inventory', icon: Package },
  { to: '/admin/sales', label: 'Sales', icon: TrendingUp },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const { clearAuth } = useAuthStore();
  const clearCart = useCartStore((state) => state.clearCart);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      clearCart();
      await signOut(auth);
      clearAuth();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden font-[Inter,sans-serif]">
      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside className="w-64 flex-shrink-0 bg-[#0F0F0F] text-white flex flex-col border-r border-white/5">
        {/* Logo block */}
        <div className="h-20 flex items-center px-7 border-b border-white/10">
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-[#800000] flex items-center justify-center
                            text-white font-black text-sm tracking-tight
                            group-hover:scale-110 transition-transform duration-200">
              K
            </div>
            <span className="text-2xl font-black tracking-[-0.06em] text-white">
              KIXX
            </span>
          </NavLink>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
            Main Menu
          </p>
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                ${
                  isActive
                    ? 'bg-[#800000] text-white shadow-lg shadow-[#800000]/25'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
                }`
              }
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              <span className="flex-1">{label}</span>
              <ChevronRight
                className="w-3.5 h-3.5 opacity-0 -translate-x-1
                           group-hover:opacity-50 group-hover:translate-x-0
                           transition-all duration-200"
              />
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="px-4 py-5 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                       text-sm font-semibold text-white/40
                       hover:text-red-400 hover:bg-red-500/10
                       transition-all duration-200"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <main className="flex-1 bg-[#FAFAF8] overflow-y-auto">
        <div className="p-8 max-w-[1440px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
