import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-stone-950 pt-20 pb-10 px-6 lg:px-12 border-t border-stone-900 border-opacity-50">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-16">
                    {/* Brand Identifier */}
                    <div className="space-y-4">
                        <Link to="/" className="text-4xl font-black tracking-tighter text-white uppercase block hover:text-stone-200 transition-colors">
                            KIXX
                        </Link>
                        <p className="text-stone-500 text-[11px] font-medium tracking-wide max-w-xs leading-relaxed uppercase opacity-80">
                            A curated archival platform for performance footwear and technical silhouettes. Engineered for the obsession.
                        </p>
                    </div>

                    {/* Navigation Clusters */}
                    <nav className="flex flex-wrap gap-x-16 gap-y-10">
                        <div className="flex flex-col gap-3">
                            <span className="text-[10px] font-black text-stone-700 uppercase tracking-[0.3em] mb-2">Inventory</span>
                            <Link to="/catalog" className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 hover:text-white hover:translate-x-1 transition-all">Shop</Link>
                            <Link to="/catalog" className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 hover:text-white hover:translate-x-1 transition-all">Catalog</Link>
                            <Link to="/catalog" className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 hover:text-white hover:translate-x-1 transition-all">New Drops</Link>
                        </div>
                        <div className="flex flex-col gap-3">
                            <span className="text-[10px] font-black text-stone-700 uppercase tracking-[0.3em] mb-2">Access</span>
                            <Link to="/register" className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 hover:text-white hover:translate-x-1 transition-all">Register</Link>
                            <Link to="/login" className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 hover:text-white hover:translate-x-1 transition-all">Login</Link>
                            <Link to="/account" className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 hover:text-white hover:translate-x-1 transition-all">My Account</Link>
                        </div>
                        <div className="flex flex-col gap-3">
                            <span className="text-[10px] font-black text-stone-700 uppercase tracking-[0.3em] mb-2">Support</span>
                            <Link to="/faq" className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 hover:text-white hover:translate-x-1 transition-all">FAQ</Link>
                            <Link to="/outfit-checker" className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 hover:text-white hover:translate-x-1 transition-all">Outfit Checker</Link>
                            <Link to="/catalog" className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 hover:text-white hover:translate-x-1 transition-all">Privacy</Link>
                        </div>
                    </nav>
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-stone-900 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-[10px] font-bold text-stone-600 uppercase tracking-[0.2em]">
                        © 2026 KIXX. ALL RIGHTS RESERVED.
                    </div>
                    <div className="flex items-center gap-6">
                        <span className="text-[10px] font-bold text-stone-800 uppercase tracking-[0.25em]">
                            Crafted with obsession.
                        </span>
                        <div className="flex gap-4 opacity-30">
                            <div className="w-1 h-1 bg-stone-600 rounded-full" />
                            <div className="w-1 h-1 bg-stone-600 rounded-full" />
                            <div className="w-1 h-1 bg-stone-600 rounded-full" />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
