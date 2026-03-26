import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Upload, X, Sparkles, RefreshCw, ChevronRight, Star } from 'lucide-react';
import api from '../services/api';
import { formatPrice } from '../utils/currency';

// ── Color swatch helper ──────────────────────────────────────────────────────
const COLOR_MAP = {
    black: '#111111', white: '#f5f5f5', grey: '#9ca3af', gray: '#9ca3af',
    red: '#dc2626', blue: '#3b82f6', navy: '#1e3a5f', green: '#16a34a',
    beige: '#d4b896', brown: '#92400e', yellow: '#eab308', orange: '#f97316',
    pink: '#ec4899', purple: '#7c3aed', gold: '#d97706', neon: '#4ade80',
    white: '#f5f5f5', 'light grey': '#d1d5db', 'dark grey': '#374151',
};

function ColorSwatch({ color }) {
    const bg = COLOR_MAP[color?.toLowerCase()] || '#e5e7eb';
    return (
        <span
            title={color}
            className="w-7 h-7 rounded-full border-2 border-white shadow-md inline-block flex-shrink-0"
            style={{ backgroundColor: bg }}
        />
    );
}

// ── Rating stars ─────────────────────────────────────────────────────────────
function RatingMeter({ rating }) {
    const color = rating >= 8 ? '#22c55e' : rating >= 5 ? '#f97316' : '#dc2626';
    const label = rating >= 8 ? 'Fire 🔥' : rating >= 5 ? 'Decent 👍' : 'Needs Work 🛠️';
    return (
        <div className="flex items-center gap-3">
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                    <div
                        key={i}
                        className="w-3 h-6 rounded-sm transition-all"
                        style={{
                            backgroundColor: i <= rating ? color : '#e5e7eb',
                            transform: i <= rating ? 'scaleY(1)' : 'scaleY(0.6)',
                        }}
                    />
                ))}
            </div>
            <span className="text-lg font-black" style={{ color }}>{rating}/10 — {label}</span>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
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
        if (file.size > 5 * 1024 * 1024) {
            setError('Image is too large. Maximum size is 5 MB.');
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
        try {
            const formData = new FormData();
            formData.append('image', imageFile);
            const res = await api.post('/api/outfit/analyze', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Analysis failed. Please try again.');
        } finally {
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

    const { analysis, matchedProducts } = result || {};

    return (
        <div className="min-h-screen bg-[#F5F5DC]">
            {/* ── Page Header ── */}
            <div className="bg-gray-900 text-white py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-[#800000]/20 border border-[#800000]/40 rounded-full px-4 py-1.5 mb-6">
                        <Sparkles className="w-4 h-4 text-[#ff6b6b]" />
                        <span className="text-xs font-black uppercase tracking-widest text-[#ff6b6b]">
                            Powered by Gemini AI
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight mb-4 leading-none">
                        Outfit <span className="text-[#800000]">Checker</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-xl mx-auto">
                        Upload your photo. Get instant AI-powered style feedback, a fit rating, and hand-picked shoe recommendations.
                    </p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">

                {/* ── Upload Zone ── */}
                {!result && (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-8">
                            <h2 className="text-xl font-black uppercase tracking-widest text-gray-900 mb-6">
                                Step 1 — Upload your photo
                            </h2>

                            {/* Drop area */}
                            <div
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                                onClick={() => !imagePreview && fileInputRef.current?.click()}
                                className={`relative border-2 border-dashed rounded-2xl transition-all cursor-pointer
                                    ${dragOver ? 'border-[#800000] bg-red-50' : 'border-gray-200 hover:border-[#800000]/60 hover:bg-gray-50'}
                                    ${imagePreview ? 'cursor-default' : ''}`}
                                style={{ minHeight: 320 }}
                            >
                                {imagePreview ? (
                                    <div className="relative flex items-center justify-center p-4">
                                        <img
                                            src={imagePreview}
                                            alt="Outfit preview"
                                            className="max-h-80 max-w-full object-contain rounded-xl shadow-md"
                                        />
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleReset(); }}
                                            className="absolute top-4 right-4 w-9 h-9 bg-gray-900/70 backdrop-blur-sm hover:bg-gray-900 text-white rounded-full flex items-center justify-center transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-4 py-16 px-8 text-center">
                                        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                                            <Upload className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-gray-800 mb-1">
                                                {dragOver ? 'Drop it here!' : 'Drag & drop your outfit photo'}
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                or <span className="text-[#800000] font-bold underline">browse to upload</span>
                                            </p>
                                            <p className="text-xs text-gray-300 mt-2">JPEG, PNG, WEBP — max 5 MB</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                className="hidden"
                                onChange={(e) => handleFile(e.target.files?.[0])}
                            />

                            {error && (
                                <div className="mt-4 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700 font-medium flex items-center gap-2">
                                    <X className="w-4 h-4 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            {imagePreview && !loading && (
                                <button
                                    onClick={handleAnalyze}
                                    className="mt-6 w-full py-4 bg-[#800000] hover:bg-[#600000] text-white font-black text-lg uppercase tracking-widest rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-3"
                                >
                                    <Sparkles className="w-5 h-5" />
                                    Analyze My Outfit
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Loading state ── */}
                {loading && (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 flex flex-col items-center gap-6">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full border-4 border-gray-100 border-t-[#800000] animate-spin" />
                            <Sparkles className="w-8 h-8 text-[#800000] absolute inset-0 m-auto" />
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-black text-gray-900 uppercase tracking-widest">Analyzing your outfit…</p>
                            <p className="text-gray-400 text-sm mt-2">Gemini AI is checking your style, colors, and fit</p>
                        </div>
                    </div>
                )}

                {/* ── Results ── */}
                {result && analysis && (
                    <div className="space-y-6">
                        {/* ── Image + Quick Stats ── */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Image preview */}
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex items-center justify-center">
                                <img
                                    src={imagePreview}
                                    alt="Analyzed outfit"
                                    className="max-h-72 object-contain rounded-xl shadow"
                                />
                            </div>

                            {/* Stats card */}
                            <div className="bg-gray-900 text-white rounded-3xl shadow-sm p-8 flex flex-col justify-between">
                                <div>
                                    <div className="inline-flex items-center gap-2 bg-[#800000]/20 border border-[#800000]/40 rounded-full px-3 py-1 mb-6">
                                        <Sparkles className="w-3 h-3 text-[#ff6b6b]" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#ff6b6b]">AI Analysis</span>
                                    </div>
                                    <h3 className="text-3xl font-black uppercase tracking-wide mb-1">{analysis.style}</h3>
                                    <p className="text-gray-400 text-sm mb-6">{analysis.occasion}</p>
                                    <RatingMeter rating={analysis.rating} />
                                </div>
                                <div className="mt-8">
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Color Palette</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {(analysis.colorPalette || []).map((c, i) => (
                                            <div key={i} className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1">
                                                <ColorSwatch color={c} />
                                                <span className="text-xs font-medium capitalize">{c}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Feedback ── */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                            <h3 className="text-lg font-black uppercase tracking-widest text-gray-900 mb-4">Style Verdict</h3>
                            <p className="text-gray-700 leading-relaxed text-base">{analysis.feedback}</p>
                        </div>

                        {/* ── Suggestions ── */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                            <h3 className="text-lg font-black uppercase tracking-widest text-gray-900 mb-5">Improvements</h3>
                            <ul className="space-y-3">
                                {(analysis.suggestions || []).map((s, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <span className="w-6 h-6 rounded-full bg-[#800000] text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                                            {i + 1}
                                        </span>
                                        <span className="text-gray-700 text-sm leading-relaxed">{s}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* ── Matched Products ── */}
                        {matchedProducts?.length > 0 && (
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-black uppercase tracking-widest text-gray-900">
                                        These Shoes Match Your Look
                                    </h3>
                                    <Link to="/catalog" className="text-xs font-black text-[#800000] uppercase tracking-widest flex items-center gap-1 hover:underline">
                                        View All <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {matchedProducts.map(product => (
                                        <Link
                                            key={product.id}
                                            to={`/product/${product.id}`}
                                            className="group rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
                                        >
                                            <div className="aspect-square bg-gray-100 overflow-hidden">
                                                {product.imageUrl ? (
                                                    <img
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs uppercase tracking-widest">
                                                        No Image
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-3">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                                                    {product.brand?.name}
                                                </p>
                                                <p className="text-sm font-black text-gray-900 truncate">{product.name}</p>
                                                <p className="text-sm font-bold text-[#800000]">
                                                    {formatPrice(parseFloat(product.basePrice))}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Try Again ── */}
                        <div className="text-center">
                            <button
                                onClick={handleReset}
                                className="inline-flex items-center gap-2 px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white font-black rounded-2xl transition-all uppercase tracking-widest shadow"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Check Another Outfit
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
