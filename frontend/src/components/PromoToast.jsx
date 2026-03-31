import React from 'react';
import { X, Gift } from 'lucide-react';

export default function PromoToast({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)]
                        bg-[#1A1A1A] text-white rounded-2xl shadow-2xl
                        border border-white/10
                        animate-[slideUp_0.4s_ease-out]
                        font-[Inter,sans-serif]"
            style={{
                animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
        >
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-3 right-3 text-white/40 hover:text-white transition-colors"
                aria-label="Dismiss promotion"
            >
                <X size={18} />
            </button>

            <div className="p-5">
                {/* Icon + Heading */}
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#800000] flex items-center justify-center shrink-0 shadow-lg shadow-[#800000]/30">
                        <Gift size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-black tracking-tight uppercase leading-tight">
                            Unlock 10% Off
                        </h3>
                        <p className="text-[11px] text-white/50 font-medium tracking-wide uppercase">
                            First Drop Credit
                        </p>
                    </div>
                </div>

                {/* Description */}
                <p className="text-sm text-white/70 leading-relaxed mb-4">
                    Your exclusive welcome discount is waiting. Use it at checkout on your first pair.
                </p>

                {/* Code pill */}
                <div className="flex items-center justify-between bg-white/[0.07] border border-white/10 rounded-xl px-4 py-3">
                    <span className="font-mono font-black text-lg tracking-[0.2em] text-white select-all">
                        FIRSTDROP
                    </span>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText('FIRSTDROP');
                        }}
                        className="text-[11px] font-bold uppercase tracking-widest text-[#800000] bg-[#800000]/20 hover:bg-[#800000]/30 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        Copy
                    </button>
                </div>
            </div>

            {/* Inline keyframes for the slide-up animation */}
            <style>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(24px) scale(0.96);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
            `}</style>
        </div>
    );
}
