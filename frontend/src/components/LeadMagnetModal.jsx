import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function LeadMagnetModal() {
    const [isVisible, setIsVisible] = useState(false);
    const [isRevealed, setIsRevealed] = useState(false);
    const [email, setEmail] = useState('');

    useEffect(() => {
        // Check if the user has already dismissed or interacted with the modal
        const hasDismissed = localStorage.getItem('kixx_first_drop_dismissed');
        if (hasDismissed) return;

        // Delay the pop-up by 3 seconds so it's not overly aggressive on page load
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const closeAndDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('kixx_first_drop_dismissed', 'true');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email) return;
        
        // At a later stage, this would hit an API to securely store the prospect lead. 
        // For now, we instantly reveal the code.
        setIsRevealed(true);
        // We set the local storage flag here too so returning visitors don't see it again
        localStorage.setItem('kixx_first_drop_dismissed', 'true');
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-300">
            <div className="bg-white rounded-[32px] w-full max-w-md p-8 sm:p-10 shadow-2xl relative">
                
                <button 
                    onClick={closeAndDismiss}
                    className="absolute top-5 right-5 text-gray-400 hover:text-black transition-colors"
                >
                    <X size={24} />
                </button>

                {!isRevealed ? (
                    <div className="text-center font-['Space_Grotesk',sans-serif]">
                        <h2 className="text-3xl font-black uppercase tracking-tighter text-black mb-3">
                            Join The Inner Circle
                        </h2>
                        <p className="text-gray-500 font-medium text-sm leading-relaxed mb-8">
                            Unlock 10% off your first pair. Enter your email for The First Drop Credit.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input 
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address"
                                className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-xl outline-none focus:border-black text-black font-medium transition-colors"
                                required
                            />
                            <button 
                                type="submit"
                                className="w-full bg-black text-white font-bold uppercase tracking-widest py-4 rounded-xl hover:bg-gray-900 transition-all duration-300 hover:scale-[1.02] shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
                            >
                                Get 10% Off
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="text-center font-['Space_Grotesk',sans-serif] animate-in slide-in-from-bottom-2 duration-300">
                        <div className="w-16 h-16 bg-black rounded-full text-white flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-black mb-3">
                            You're In.
                        </h2>
                        <p className="text-gray-500 font-medium text-sm leading-relaxed mb-8">
                            Use this code at checkout. Welcome to the club.
                        </p>

                        <div className="bg-gray-100 border border-gray-200 rounded-xl py-6 px-4 mb-8 select-all">
                            <span className="text-3xl font-black tracking-widest text-black">FIRSTDROP</span>
                        </div>

                        <button 
                            onClick={closeAndDismiss}
                            className="w-full bg-black text-white font-bold uppercase tracking-widest py-4 rounded-xl hover:bg-gray-900 transition-all duration-300 hover:scale-[1.02]"
                        >
                            Start Shopping
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
