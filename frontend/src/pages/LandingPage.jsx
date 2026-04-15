import React, { useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

gsap.registerPlugin(ScrollTrigger);

// ─── Frame loader ─────────────────────────────────────────────────────────────
const TOTAL_FRAMES = 242;
const frameSrc = (n) =>
    `/Nike tiger image/ezgif-frame-${String(n).padStart(3, '0')}.jpg`;

// ─── Canvas drawing helpers ───────────────────────────────────────────────────
function drawContain(ctx, img, W, H) {
    const iw = img.naturalWidth, ih = img.naturalHeight;
    if (!iw || !ih) return;
    const s = Math.min(W / iw, H / ih);
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(img, (W - iw * s) / 2, (H - ih * s) / 2, iw * s, ih * s);
}
function drawCover(ctx, img, W, H, zoom = 1.14) {
    const iw = img.naturalWidth, ih = img.naturalHeight;
    if (!iw || !ih) return;
    const s = Math.max(W / iw, H / ih) * zoom;
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(img, (W - iw * s) / 2, (H - ih * s) / 2, iw * s, ih * s);
}

// ─── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({ number, title, body }) {
    return (
        <div className="group relative p-10 border-t border-gray-200 hover:border-[#800000] transition-colors duration-500">
            <span
                className="block font-black text-gray-100 group-hover:text-[#f0e0e0] transition-colors duration-500 select-none mb-6"
                style={{ fontSize: 'clamp(4rem, 8vw, 7rem)', lineHeight: 1, letterSpacing: '-0.05em' }}
            >
                {number}
            </span>
            <h3 className="font-black uppercase text-[#111] tracking-tight mb-3"
                style={{ fontSize: 'clamp(1.1rem, 2vw, 1.5rem)', letterSpacing: '-0.02em' }}>
                {title}
            </h3>
            <p className="text-gray-500 leading-relaxed text-base">{body}</p>
            <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#800000] group-hover:w-full transition-all duration-500 ease-out" />
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
    const navigate = useNavigate();
    const containerRef = useRef(null);   // 800 vh scroll container
    const bgCanvasRef = useRef(null);
    const fgCanvasRef = useRef(null);
    const heroTextRef = useRef(null);   // "HUNT YOUR STYLE" overlay
    const ctaSectionRef = useRef(null);
    const featureRef = useRef(null);
    const footerRef = useRef(null);
    const imagesRef = useRef([]);
    const curFrameRef = useRef(0);

    useEffect(() => {
        // ── Lenis smooth scroll ───────────────────────────────────────────────
        const lenis = new Lenis({ lerp: 0.08, smooth: true, smoothTouch: false });
        const rafCb = (t) => lenis.raf(t * 1000);
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(rafCb);
        gsap.ticker.lagSmoothing(0);

        // ── Canvas resize ─────────────────────────────────────────────────────
        const resize = () => {
            [fgCanvasRef.current, bgCanvasRef.current].forEach((c) => {
                if (c) { c.width = window.innerWidth; c.height = window.innerHeight; }
            });
            drawFrame(curFrameRef.current);
        };

        // ── Frame draw ────────────────────────────────────────────────────────
        const drawFrame = (idx) => {
            const img = imagesRef.current[idx];
            if (!img?.complete || !img.naturalWidth) return;
            const fg = fgCanvasRef.current, bg = bgCanvasRef.current;
            if (!fg || !bg) return;
            drawContain(fg.getContext('2d'), img, fg.width, fg.height);
            drawCover(bg.getContext('2d'), img, bg.width, bg.height);
        };

        // ── Preload frames ────────────────────────────────────────────────────
        const imgs = [];
        for (let i = 1; i <= TOTAL_FRAMES; i++) {
            const img = new Image();
            img.src = frameSrc(i);
            if (i === 1) img.onload = () => resize();
            imgs.push(img);
        }
        imagesRef.current = imgs;
        resize();
        window.addEventListener('resize', resize);

        // ── ScrollTrigger: frame scrub ────────────────────────────────────────
        const state = { frame: 0 };
        const scrubTween = gsap.to(state, {
            frame: TOTAL_FRAMES - 1,
            ease: 'none',
            scrollTrigger: {
                trigger: containerRef.current,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.5,
                onUpdate: () => {
                    const f = Math.round(state.frame);
                    curFrameRef.current = f;
                    drawFrame(f);
                },
            },
        });

        // ── ScrollTrigger: hero text fade-out ─────────────────────────────────
        const textTween = heroTextRef.current
            ? gsap.to(heroTextRef.current, {
                opacity: 0,
                y: -40,
                ease: 'power2.in',
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top top',
                    end: '12% top',
                    scrub: true,
                },
            })
            : null;

        // ── ScrollTrigger: sections fade in ──────────────────────────────────
        const fadeTargets = [ctaSectionRef, featureRef, footerRef]
            .map((r) => r.current)
            .filter(Boolean);

        const fadeTweens = fadeTargets.map((el) =>
            gsap.fromTo(el,
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1.1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 88%',
                        toggleActions: 'play none none reverse',
                    },
                }
            )
        );

        // ── Cleanup ───────────────────────────────────────────────────────────
        return () => {
            window.removeEventListener('resize', resize);
            gsap.ticker.remove(rafCb);
            lenis.destroy();
            scrubTween.kill();
            scrubTween.scrollTrigger?.kill();
            textTween?.kill();
            textTween?.scrollTrigger?.kill();
            fadeTweens.forEach((t) => { t.kill(); t.scrollTrigger?.kill(); });
            ScrollTrigger.getAll().forEach((t) => t.kill());
        };
    }, []);

    const edgeMask =
        'linear-gradient(to bottom, transparent 0%, black 7%, black 93%, transparent 100%)';

    return (
        <div className="min-h-screen bg-white">

            {/* ══════════════════════════════════════════════════════════════════
                SECTION 1 — TIGER ENGINE HERO  (800 vh)
            ══════════════════════════════════════════════════════════════════ */}
            <div ref={containerRef} className="relative" style={{ height: '800vh' }}>
                <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">

                    {/* Ambient background */}
                    <canvas ref={bgCanvasRef} aria-hidden="true" style={{
                        position: 'absolute', inset: 0, width: '100%', height: '100%',
                        filter: 'blur(40px) saturate(1.2) brightness(0.8)',
                        transform: 'scale(1.12)', transformOrigin: 'center',
                        zIndex: 0,
                    }} />

                    {/* Sharp foreground */}
                    <canvas ref={fgCanvasRef} aria-hidden="true" style={{
                        position: 'absolute', inset: 0, width: '100%', height: '100%',
                        zIndex: 1,
                        maskImage: edgeMask,
                        WebkitMaskImage: edgeMask,
                    }} />

                    {/* Hero text overlay — fades out as you scroll */}
                    <div
                        ref={heroTextRef}
                        aria-hidden="true"
                        style={{
                            position: 'absolute', inset: 0, zIndex: 2,
                            display: 'flex', flexDirection: 'column',
                            justifyContent: 'space-between',
                            padding: 'clamp(1.25rem, 4vw, 3.5rem)',
                            pointerEvents: 'none', userSelect: 'none',
                        }}
                    >
                        {/* Top brand tag */}
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            {['KIXX × NIKE', '2025 COLLECTION'].map((t) => (
                                <span key={t} style={{
                                    color: 'rgba(255,255,255,0.7)',
                                    fontSize: 'clamp(0.55rem, 1.1vw, 0.75rem)',
                                    fontWeight: 900, letterSpacing: '0.28em',
                                    textTransform: 'uppercase',
                                    textShadow: '0 1px 8px rgba(0,0,0,0.5)',
                                }}>{t}</span>
                            ))}
                        </div>

                        {/* Headline */}
                        <div style={{ textAlign: 'center' }}>
                            <p style={{
                                color: 'rgba(255,255,255,0.4)',
                                fontSize: 'clamp(0.6rem, 1.3vw, 0.8rem)',
                                fontWeight: 900, letterSpacing: '0.45em',
                                textTransform: 'uppercase', marginBottom: '0.75rem',
                            }}>
                                New Season Drop
                            </p>
                            <h1 style={{
                                color: '#fff',
                                fontSize: 'clamp(3.5rem, 14vw, 15rem)',
                                fontWeight: 900, lineHeight: 0.88,
                                letterSpacing: '-0.04em', textTransform: 'uppercase',
                                textShadow: '0 0 100px rgba(0,0,0,0.5), 0 4px 30px rgba(0,0,0,0.4)',
                                fontFamily: 'system-ui, -apple-system, sans-serif',
                            }}>
                                Hunt Your<br />Style
                            </h1>
                        </div>

                        {/* CTA + Scroll cue */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            {/* SHOP NOW — direct to catalog, no auth required */}
                            <Link
                                to="/catalog"
                                className="bg-white text-black px-8 sm:px-10 py-3.5 sm:py-4 uppercase text-[11px] sm:text-[12px] tracking-[0.2em] font-medium transition-all duration-300 hover:bg-black hover:text-white border border-white scale-90 sm:scale-100"
                                style={{ pointerEvents: 'auto', display: 'inline-block', textDecoration: 'none' }}
                            >
                                Shop Now
                            </Link>

                            <span style={{
                                color: 'rgba(255,255,255,0.45)',
                                fontSize: 'clamp(0.5rem, 0.9vw, 0.65rem)',
                                fontWeight: 900, letterSpacing: '0.32em', textTransform: 'uppercase',
                            }}>Scroll to Explore</span>
                            <div style={{
                                width: 1, height: 'clamp(2.5rem, 5vw, 3.5rem)',
                                background: 'linear-gradient(to bottom, rgba(255,255,255,0.5), transparent)',
                                animation: 'landingPulse 1.8s ease-in-out infinite',
                            }} />
                        </div>
                    </div>
                    <style>{`@keyframes landingPulse{0%,100%{opacity:1}50%{opacity:.25}}`}</style>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                SECTION 2 — CTA  "STEP INTO WHAT FEELS GOOD"
            ══════════════════════════════════════════════════════════════════ */}
            <section
                ref={ctaSectionRef}
                style={{ opacity: 0 }}
                className="bg-white py-28 md:py-44 px-6 text-center"
            >
                <div className="max-w-4xl mx-auto">
                    <p className="text-xs font-black tracking-[0.5em] uppercase text-gray-400 mb-8">
                        Exclusive Access
                    </p>
                    <h2
                        className="font-black uppercase leading-none tracking-tighter text-[#111] mb-8"
                        style={{ fontSize: 'clamp(2.6rem, 8.5vw, 8rem)' }}
                    >
                        Step Into What<br />Feels Good
                    </h2>
                    <div className="mx-auto mb-10 h-px w-20 bg-gray-200" />
                    <p className="text-gray-500 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-14 font-medium">
                        Explore exclusive drops, premium collaborations, and the kicks
                        that define your personal style.
                    </p>

                    {/* Shop Now → /login */}
                    <button
                        id="landing-shop-now"
                        onClick={() => navigate('/login')}
                        className="group inline-flex items-center gap-3 bg-[#111] text-white font-black uppercase tracking-widest rounded-full px-14 py-5 text-sm hover:bg-[#800000] transition-all duration-300 shadow-2xl hover:shadow-[#80000040] hover:scale-105 active:scale-100"
                    >
                        Shop Now
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"
                            className="group-hover:translate-x-1 transition-transform duration-300">
                            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2"
                                strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════════
                SECTION 3 — BRAND ETHOS / FEATURES
            ══════════════════════════════════════════════════════════════════ */}
            <section
                ref={featureRef}
                style={{ opacity: 0 }}
                className="bg-[#F5F5DC] py-24 px-6"
            >
                <div className="max-w-7xl mx-auto">
                    <div className="mb-16">
                        <p className="text-xs font-black tracking-[0.5em] uppercase text-gray-500 mb-4">
                            Why KIXX
                        </p>
                        <h2
                            className="font-black uppercase leading-none tracking-tighter text-[#111]"
                            style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)' }}
                        >
                            Built Different.
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                        <FeatureCard
                            number="01"
                            title="Authentic Goods"
                            body="Every kick is verified and sourced directly from brand partners. Zero fakes. Zero compromises. Only the real deal."
                        />
                        <FeatureCard
                            number="02"
                            title="Express Delivery"
                            body="From warehouse to your door in 48 hours. Our logistics network keeps your drops arriving as fast as they sell out."
                        />
                        <FeatureCard
                            number="03"
                            title="Exclusive Drops"
                            body="Members-only access to limited collabs, regional exclusives, and pre-release colourways before they hit the market."
                        />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════════
                SECTION 4 — MINIMAL FOOTER
            ══════════════════════════════════════════════════════════════════ */}
            <footer
                ref={footerRef}
                style={{ opacity: 0 }}
                className="bg-[#111] text-white py-16 px-6"
            >
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 pb-12 border-b border-white/10">

                        {/* Logo */}
                        <Link
                            to="/"
                            className="font-black uppercase leading-none tracking-tighter text-white/90 hover:text-white transition-colors"
                            style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', letterSpacing: '-0.04em' }}
                        >
                            KIXX
                        </Link>

                        {/* Nav links */}
                        <nav className="flex flex-wrap gap-x-10 gap-y-4">
                            {[
                                { label: 'Shop', to: '/login' },
                                { label: 'Catalog', to: '/login' },
                                { label: 'Register', to: '/register' },
                                { label: 'Login', to: '/login' },
                            ].map(({ label, to }) => (
                                <Link
                                    key={label}
                                    to={to}
                                    className="text-white/50 hover:text-white font-bold uppercase tracking-widest text-xs transition-colors duration-200"
                                >
                                    {label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="pt-10 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-white/30 text-xs font-medium tracking-widest">
                            © {new Date().getFullYear()} KIXX. ALL RIGHTS RESERVED.
                        </p>
                        <p className="text-white/20 text-xs">
                            Crafted with obsession.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
