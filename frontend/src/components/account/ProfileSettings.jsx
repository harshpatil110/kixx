import React from 'react';
import { Target, Star } from 'lucide-react';

export default function ProfileSettings({ 
    user, 
    dob, 
    setDob, 
    selectedPersona, 
    setSelectedPersona, 
    handleUpdateProfile, 
    isUpdatingProfile 
}) {
    const displayName = user?.name || 'Sneakerhead';
    const email = user?.email || '—';

    const personas = [
        { id: 'Sneakerhead', label: 'Sneakerhead', desc: 'Archive & Hype' },
        { id: 'Athlete', label: 'Athlete', desc: 'Performance' },
        { id: 'Casual', label: 'Casual', desc: 'Clean Minimal' },
        { id: 'Gifter', label: 'Gifter', desc: 'Gift Guides' }
    ];

    return (
        <div className="animate-fade-in max-w-3xl">
            <header className="mb-12">
                <p className="text-[10px] font-bold tracking-[0.25em] text-stone-400 mb-2 uppercase">Core Identity</p>
                <h1 className="text-3xl lg:text-4xl font-black tracking-tighter text-stone-900 uppercase">
                    Profile <span className="text-stone-300">Settings</span>
                </h1>
            </header>
            
            <form onSubmit={handleUpdateProfile} className="space-y-12">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <div className="flex flex-col">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-1">Full Name</label>
                        <input 
                            type="text" 
                            disabled 
                            value={displayName}
                            className="w-full bg-transparent border-b border-stone-200 py-3 text-stone-400 focus:outline-none rounded-none cursor-not-allowed font-medium text-sm"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-1">Authenticated Email</label>
                        <input 
                            type="email" 
                            disabled 
                            value={email}
                            className="w-full bg-transparent border-b border-stone-200 py-3 text-stone-400 focus:outline-none rounded-none cursor-not-allowed font-medium text-sm"
                        />
                    </div>
                </div>

                {/* Style Profile Selection */}
                <div className="space-y-6 pt-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-stone-900 flex items-center justify-center text-white">
                            <Target size={16} />
                        </div>
                        <h3 className="text-xs font-black tracking-[0.2em] text-stone-900 uppercase">Archive Persona</h3>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {personas.map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => setSelectedPersona(p.id)}
                                className={`
                                    p-6 border transition-all text-left rounded-sm
                                    ${selectedPersona === p.id 
                                        ? 'border-stone-900 bg-stone-900 text-white shadow-xl shadow-stone-900/10' 
                                        : 'border-stone-200 bg-white text-stone-600 hover:border-stone-400'}
                                `}
                            >
                                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${selectedPersona === p.id ? 'text-stone-300' : 'text-stone-400'}`}>
                                    {p.label}
                                </p>
                                <p className={`text-[11px] font-bold leading-tight ${selectedPersona === p.id ? 'text-white' : 'text-stone-900'}`}>
                                    {p.desc}
                                </p>
                            </button>
                        ))}
                    </div>
                    <p className="text-[10px] text-stone-400 italic">Determines your personalized catalog badges and editorial feed curation.</p>
                </div>

                {/* Date of Birth/Rewards */}
                <div className="space-y-6 pt-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-stone-900 flex items-center justify-center text-white">
                            <Star size={16} />
                        </div>
                        <h3 className="text-xs font-black tracking-[0.2em] text-stone-900 uppercase">Retention Rewards</h3>
                    </div>

                    <div className="max-w-md">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-1">Birthdate</label>
                        <input 
                            type="date" 
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            className="w-full bg-transparent border-b border-stone-300 py-3 text-stone-900 focus:outline-none focus:border-stone-900 transition-colors rounded-none font-medium"
                        />
                        <p className="text-[10px] text-stone-400 mt-4 leading-relaxed font-medium">
                            * Registered birthdays grant access to exclusive annual drop credits and early access tiers. This interaction is immutable once verified.
                        </p>
                    </div>
                </div>

                <div className="pt-8 flex justify-end">
                    <button 
                        type="submit"
                        disabled={isUpdatingProfile}
                        className="px-12 py-5 bg-stone-900 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-sm hover:bg-stone-800 transition-all disabled:opacity-50 shadow-lg shadow-stone-900/10"
                    >
                        {isUpdatingProfile ? 'Applying Sync…' : 'Update Profile Registry'}
                    </button>
                </div>
            </form>
        </div>
    );
}
