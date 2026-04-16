import React, { useState, useRef, useCallback } from 'react';
import { ScanSearch, X, Sparkles, RefreshCcw, Loader2, Camera, User } from 'lucide-react';
import api from '../services/api';
import imageCompression from 'browser-image-compression';
import ReactMarkdown from 'react-markdown';

// ── Main Page Component ──────────────────────────────────────────────────────
export default function OutfitCheckerPage() {
    const [dragOver, setDragOver] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const fileInputRef = useRef(null);

    const handleFile = useCallback((file) => {
        if (!file) return;
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowed.includes(file.type)) {
            setError('Unsupported format. Please use JPEG, PNG, WEBP, or GIF.');
            return;
        }
        if (file.size > 50 * 1024 * 1024) {
            setError('Image is too large. Maximum size is 50 MB.');
            return;
        }
        setError(null);
        setResult(null);
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
        handleFile(e.dataTransfer.files?.[0]);
    }, [handleFile]);

    const handleAnalyze = async () => {
        if (!imageFile) return;
        setLoading(true);
        setError(null);
        setResult(null);

        const options = {
            maxSizeMB: 1,          // Optimizing for AI throughput
            maxWidthOrHeight: 1920, 
            useWebWorker: true,
        };

        let compressedFile = imageFile;
        try {
            compressedFile = await imageCompression(imageFile, options);
        } catch (error) {
            console.error("Compression error:", error);
            setError("Failed to process image for analytics.");
            setLoading(false);
            return; 
        }

        try {
            const reader = new FileReader();
            reader.readAsDataURL(compressedFile);
            reader.onloadend = async () => {
                try {
                    const base64String = reader.result;
                    const res = await api.post('/api/ai/analyze-outfit', {
                        image: base64String
                    });
                    
                    if (res.data.success) {
                        setResult({ analysis: res.data.analysis });
                    } else {
                        setError(res.data.message || 'Analysis failed. Please try again.');
                    }
                } catch (err) {
                    setError(err.response?.data?.message || 'Server-side analysis error.');
                } finally {
                    setLoading(false);
                }
            };
        } catch (err) {
            setError('Failed to initiate analysis sequence.');
            setLoading(false);
        }
    };

    const handleReset = () => {
        setImageFile(null);
        setImagePreview(null);
        setResult(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="min-h-screen bg-[#F7F5F0] pt-24 pb-32 px-6">
            <div className="max-w-4xl mx-auto bg-white border border-stone-200 shadow-none p-12 rounded-sm relative overflow-hidden">
                
                {/* ── Background Branding Accent ── */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50/50 pointer-events-none -mr-16 -mt-16 rounded-full blur-3xl" />

                <header className="mb-12 border-b border-stone-50 pb-8">
                    <p className="text-[10px] font-bold tracking-[0.25em] text-stone-400 mb-2 uppercase">The Data Intake Portal</p>
                    <h1 className="text-4xl font-black tracking-tighter text-stone-900 leading-[0.9] uppercase">
                        Submit Your Fit<br />
                        <span className="text-stone-300">For AI Analysis</span>
                    </h1>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                    {/* ── Upload Area / Preview ── */}
                    <div className="md:col-span-12 lg:col-span-6 space-y-6">
                        <div 
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            onClick={() => !imagePreview && fileInputRef.current?.click()}
                            className={`
                                relative aspect-[3/4] bg-stone-50 border-2 border-dashed transition-all duration-500
                                flex flex-col items-center justify-center p-4 overflow-hidden
                                ${dragOver ? 'border-[#800000] bg-stone-100/50' : 'border-stone-200'}
                                ${!imagePreview ? 'cursor-pointer hover:border-stone-400' : ''}
                            `}
                        >
                            {imagePreview ? (
                                <>
                                    <img 
                                        src={imagePreview} 
                                        alt="Preview" 
                                        className="w-full h-full object-contain mix-blend-multiply opacity-0 animate-fade-in"
                                        style={{ animationFillMode: 'forwards' }}
                                        onLoad={(e) => e.target.classList.remove('opacity-0')}
                                    />
                                    {!loading && !result && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleReset(); }}
                                            className="absolute top-4 right-4 bg-white/80 backdrop-blur-md p-2 hover:bg-stone-900 hover:text-white transition-all border border-stone-100"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </>
                            ) : (
                                <div className="text-center space-y-4">
                                    <div className="w-16 h-16 border border-stone-200 rounded-full flex items-center justify-center mx-auto bg-white mb-2">
                                        <ScanSearch className="w-6 h-6 text-stone-300" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">Awaiting Digital Input</p>
                                        <p className="text-xs text-stone-300 mt-1 italic">Drag & drop portrait or select below</p>
                                    </div>
                                </div>
                            )}

                            {/* Scanning Animation for Loading */}
                            {loading && (
                                <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
                                    <div className="w-full h-1 bg-[#800000] absolute animate-scan-y shadow-[0_0_20px_#800000]" />
                                    <div className="absolute inset-0 bg-stone-900/5 backdrop-blur-[1px]" />
                                </div>
                            )}
                        </div>

                        {!result && !loading && (
                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full py-4 bg-stone-900 text-white text-[10px] uppercase font-black tracking-[0.25em] hover:bg-stone-800 transition-all border border-transparent shadow-md active:scale-[0.98]"
                                >
                                    {imagePreview ? 'Change Portrait' : 'Select Portrait'}
                                </button>
                                {imagePreview && (
                                    <button 
                                        onClick={handleAnalyze}
                                        className="w-full py-4 bg-white text-stone-900 text-[10px] uppercase font-black tracking-[0.25em] hover:bg-stone-50 transition-all border border-stone-900 flex items-center justify-center gap-2"
                                    >
                                        <Sparkles size={14} className="text-[#800000]" />
                                        Initialize Scan
                                    </button>
                                )}
                            </div>
                        )}

                        {result && (
                            <button 
                                onClick={handleReset}
                                className="text-[10px] font-bold tracking-widest text-stone-400 hover:text-stone-900 uppercase border-b border-stone-200 transition-all flex items-center gap-2 group"
                            >
                                <RefreshCcw size={12} className="group-hover:rotate-180 transition-transform duration-500" />
                                Initiate Re-Scan
                            </button>
                        )}
                    </div>

                    {/* ── Side Interface: Logic & Result ── */}
                    <div className="md:col-span-12 lg:col-span-6">
                        {error && (
                            <div className="p-6 border border-red-50 bg-red-50/30 text-red-800 text-xs font-medium space-y-2 mb-6">
                                <div className="flex items-center gap-2">
                                    <X className="w-4 h-4" />
                                    <p className="uppercase tracking-widest font-black">Input Error</p>
                                </div>
                                <p className="opacity-70 leading-relaxed">{error}</p>
                            </div>
                        )}

                        {!result && !loading && (
                            <div className="p-8 border border-stone-50 bg-stone-50/20 space-y-6">
                                <div>
                                    <h3 className="text-[10px] font-black tracking-[0.2em] text-stone-900 uppercase mb-3">Analysis Parameters</h3>
                                    <ul className="space-y-4">
                                        {[
                                            { icon: <User size={14}/>, t: "Fit Correlation", d: "Evaluating silhouette harmony" },
                                            { icon: <Camera size={14}/>, t: "Color Balance", d: "Checking palette temperature" },
                                            { icon: <Sparkles size={14}/>, t: "Contextual Rating", d: "Rating based on current archival trends" }
                                        ].map((item, idx) => (
                                            <li key={idx} className="flex gap-4">
                                                <div className="w-8 h-8 rounded-full border border-stone-100 flex items-center justify-center bg-white text-stone-400 shadow-sm">
                                                    {item.icon}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-stone-900 uppercase">{item.t}</p>
                                                    <p className="text-[10px] text-stone-400 font-medium italic">{item.d}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="pt-6 border-t border-stone-100">
                                    <p className="text-[10px] text-stone-400 leading-relaxed">
                                        * Uploaded images are processed via NVIDIA style-engines. By submitting, you acknowledge that your outfit will be reduced to data points for aesthetic optimization.
                                    </p>
                                </div>
                            </div>
                        )}

                        {loading && (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                <Loader2 className="w-10 h-10 text-stone-200 animate-spin mb-4" />
                                <p className="text-[10px] font-black tracking-[0.3em] text-stone-400 uppercase animate-pulse">Processing Digital Double</p>
                                <p className="text-xs text-stone-300 mt-2 font-medium italic">Deconstructing silhouette and palette...</p>
                            </div>
                        )}

                        {result && result.analysis && (
                            <div className="h-full animate-fade-in space-y-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#800000] flex items-center justify-center shadow-lg shadow-[#800000]/20">
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                    <h3 className="text-xs font-black tracking-[0.2em] text-stone-900 uppercase">Analysis Results</h3>
                                </div>

                                <div className="prose prose-stone max-w-none">
                                    <ReactMarkdown
                                        components={{
                                            p: ({node, ...props}) => <p className="text-[13px] text-stone-600 leading-relaxed mb-4 font-medium" {...props} />,
                                            ul: ({node, ...props}) => <ul className="space-y-4 border-l-2 border-stone-50 pl-4 mb-6" {...props} />,
                                            li: ({node, ...props}) => (
                                                <li className="text-[11px] text-stone-500 font-bold uppercase tracking-wide leading-snug flex items-start" {...props}>
                                                    <span className="w-1.5 h-1.5 bg-stone-900 rounded-full mr-2 mt-1.5 flex-shrink-0" />
                                                    {props.children}
                                                </li>
                                            ),
                                            strong: ({node, ...props}) => <strong className="text-stone-900 font-black border-b border-[#800000]/30" {...props} />,
                                            h2: ({node, ...props}) => <h2 className="text-xs font-black tracking-[0.2em] text-[#800000] uppercase mb-4 mt-8" {...props} />,
                                            h3: ({node, ...props}) => <h3 className="text-[11px] font-black tracking-widest text-stone-400 uppercase mb-2 mt-6" {...props} />
                                        }}
                                    >
                                        {result.analysis}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                />
            </div>

            {/* Pagination / Context indicator */}
            <div className="max-w-4xl mx-auto flex justify-between items-center mt-8 px-2">
                <span className="text-[9px] font-bold text-stone-400 tracking-[0.25em] uppercase">Archive Portal // AI_CHECK_v2.0</span>
                <div className="flex gap-2">
                    <div className="w-10 h-[1px] bg-stone-900" />
                    <div className="w-10 h-[1px] bg-stone-200" />
                </div>
            </div>
        </div>
    );
}
