import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

gsap.registerPlugin(ScrollTrigger);

// ─── Constants ───────────────────────────────────────────────────────────────
const TOTAL_FRAMES = 242;

/** Returns the public URL for a given 1-indexed frame number. */
function frame(n) {
    const pad = String(n).padStart(3, '0');
    return `/Nike tiger image/ezgif-frame-${pad}.jpg`;
}

// ─── Canvas drawing helpers ───────────────────────────────────────────────────

/** object-fit: contain — centres the image with letterboxing */
function drawContain(ctx, img, W, H) {
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    if (!iw || !ih) return;
    const scale = Math.min(W / iw, H / ih);
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(img, (W - iw * scale) / 2, (H - ih * scale) / 2, iw * scale, ih * scale);
}

/** object-fit: cover + zoom — fills canvas, scaled up by `zoom` to bleed past edges */
function drawCover(ctx, img, W, H, zoom = 1.15) {
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    if (!iw || !ih) return;
    const scale = Math.max(W / iw, H / ih) * zoom;
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(img, (W - iw * scale) / 2, (H - ih * scale) / 2, iw * scale, ih * scale);
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function TigerHeroSection() {
    const containerRef = useRef(null);  // 800 vh scroll container
    const bgCanvasRef = useRef(null);  // ambient blurred layer
    const fgCanvasRef = useRef(null);  // sharp foreground layer
    const postHeroRef = useRef(null);  // editorial section below hero
    const imagesRef = useRef([]);    // preloaded Image objects
    const curFrameRef = useRef(0);     // current drawn frame index

    useEffect(() => {
        // ── 1. Lenis smooth scroll ─────────────────────────────────────────
        const lenis = new Lenis({
            lerp: 0.08,          // inertia coefficient (lower = silkier)
            smooth: true,
            smoothTouch: false,
        });

        // Wire Lenis into GSAP's ticker so ScrollTrigger stays in sync
        const rafCallback = (time) => lenis.raf(time * 1000);
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(rafCallback);
        gsap.ticker.lagSmoothing(0);

        // ── 2. Canvas resize / re-draw ─────────────────────────────────────
        const setCanvasSize = (canvas) => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const resizeAll = () => {
            if (fgCanvasRef.current) setCanvasSize(fgCanvasRef.current);
            if (bgCanvasRef.current) setCanvasSize(bgCanvasRef.current);
            drawFrame(curFrameRef.current);
        };

        // ── 3. Frame drawing ───────────────────────────────────────────────
        const drawFrame = (idx) => {
            const img = imagesRef.current[idx];
            if (!img || !img.complete || !img.naturalWidth) return;

            const fg = fgCanvasRef.current;
            const bg = bgCanvasRef.current;
            if (!fg || !bg) return;

            drawContain(fg.getContext('2d'), img, fg.width, fg.height);
            drawCover(bg.getContext('2d'), img, bg.width, bg.height);
        };

        // ── 4. Preload all frames ──────────────────────────────────────────
        // Start rendering as soon as frame 1 is ready; load the rest lazily.
        const imgs = [];
        for (let i = 1; i <= TOTAL_FRAMES; i++) {
            const img = new Image();
            img.src = frame(i);
            if (i === 1) img.onload = () => { resizeAll(); };
            imgs.push(img);
        }
        imagesRef.current = imgs;

        // Initial size pass (img[0] may already be cached)
        resizeAll();
        window.addEventListener('resize', resizeAll);

        // ── 5. GSAP frame scrubber ─────────────────────────────────────────
        const state = { frame: 0 };
        const tween = gsap.to(state, {
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

        // ── 6. Post-hero fade-in ───────────────────────────────────────────
        if (postHeroRef.current) {
            gsap.fromTo(
                postHeroRef.current,
                { opacity: 0, y: 60 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1.2,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: postHeroRef.current,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse',
                    },
                }
            );
        }

        // ── Cleanup ────────────────────────────────────────────────────────
        return () => {
            window.removeEventListener('resize', resizeAll);
            gsap.ticker.remove(rafCallback);
            lenis.destroy();
            tween.kill();
            tween.scrollTrigger?.kill();
            // Kill any remaining ScrollTriggers created in this effect
            ScrollTrigger.getAll().forEach((t) => t.kill());
        };
    }, []);

    // ─── Mask string shared between fg canvas ────────────────────────────────
    const edgeFade =
        'linear-gradient(to bottom, transparent 0%, black 7%, black 93%, transparent 100%)';

    return (
        <>
            {/* ════════════════════════════════════════════════════════════════
                TIGER HERO — 800 vh scroll container
            ════════════════════════════════════════════════════════════════ */}
            <div ref={containerRef} className="relative" style={{ height: '800vh' }}>

                {/* Sticky viewport — pinned for the full 800 vh */}
                <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">

                    {/* ── Ambient background canvas ── */}
                    <canvas
                        ref={bgCanvasRef}
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            filter: 'blur(40px) saturate(1.3) brightness(0.85)',
                            transform: 'scale(1.12)',
                            transformOrigin: 'center',
                            zIndex: 0,
                            willChange: 'transform',
                        }}
                    />

                    {/* ── Foreground sharp canvas ── */}
                    <canvas
                        ref={fgCanvasRef}
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            zIndex: 1,
                            maskImage: edgeFade,
                            WebkitMaskImage: edgeFade,
                            willChange: 'contents',
                        }}
                    />

                    {/* ── Text overlay ── */}
                    <div
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            zIndex: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            padding: 'clamp(1.25rem, 4vw, 3.5rem)',
                            pointerEvents: 'none',
                            userSelect: 'none',
                        }}
                    >
                        {/* Top row — brand tag */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{
                                color: 'rgba(255,255,255,0.75)',
                                fontSize: 'clamp(0.55rem, 1.1vw, 0.75rem)',
                                fontWeight: 900,
                                letterSpacing: '0.28em',
                                textTransform: 'uppercase',
                                textShadow: '0 1px 8px rgba(0,0,0,0.5)',
                            }}>
                                KIXX × NIKE
                            </span>
                            <span style={{
                                color: 'rgba(255,255,255,0.75)',
                                fontSize: 'clamp(0.55rem, 1.1vw, 0.75rem)',
                                fontWeight: 900,
                                letterSpacing: '0.28em',
                                textTransform: 'uppercase',
                                textShadow: '0 1px 8px rgba(0,0,0,0.5)',
                            }}>
                                2025 Collection
                            </span>
                        </div>

                        {/* Centre — giant wordmark */}
                        <div style={{ textAlign: 'center' }}>
                            <p style={{
                                color: 'rgba(255,255,255,0.45)',
                                fontSize: 'clamp(0.6rem, 1.4vw, 0.85rem)',
                                fontWeight: 900,
                                letterSpacing: '0.45em',
                                textTransform: 'uppercase',
                                marginBottom: '0.5rem',
                            }}>
                                Step Up Your Game
                            </p>
                            <h1 style={{
                                color: '#ffffff',
                                fontSize: 'clamp(4.5rem, 17vw, 17rem)',
                                fontWeight: 900,
                                lineHeight: 0.88,
                                letterSpacing: '-0.04em',
                                textTransform: 'uppercase',
                                textShadow: '0 0 120px rgba(0,0,0,0.55), 0 4px 30px rgba(0,0,0,0.4)',
                                fontFamily: 'system-ui, -apple-system, sans-serif',
                            }}>
                                KIXX
                            </h1>
                        </div>

                        {/* Bottom — scroll cue */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
                            <span style={{
                                color: 'rgba(255,255,255,0.5)',
                                fontSize: 'clamp(0.5rem, 0.9vw, 0.65rem)',
                                fontWeight: 900,
                                letterSpacing: '0.32em',
                                textTransform: 'uppercase',
                            }}>
                                Scroll to Explore
                            </span>
                            <div style={{
                                width: '1px',
                                height: 'clamp(2.5rem, 5vw, 3.5rem)',
                                background: 'linear-gradient(to bottom, rgba(255,255,255,0.55), transparent)',
                                animation: 'pulseOpacity 1.8s ease-in-out infinite',
                            }} />
                        </div>
                    </div>

                    {/* Pulse keyframe injected once */}
                    <style>{`
                        @keyframes pulseOpacity {
                            0%, 100% { opacity: 1; }
                            50%      { opacity: 0.3; }
                        }
                    `}</style>
                </div>
            </div>

            {/* ════════════════════════════════════════════════════════════════
                POST-HERO — Editorial "First Look" reveal
            ════════════════════════════════════════════════════════════════ */}
            <section
                ref={postHeroRef}
                style={{ opacity: 0 }} /* GSAP will animate this in */
                className="bg-white py-28 md:py-40 px-6 overflow-hidden"
            >
                <div className="max-w-4xl mx-auto text-center">

                    {/* Eyebrow */}
                    <p className="text-xs font-black tracking-[0.5em] uppercase text-gray-400 mb-6">
                        First Look
                    </p>

                    {/* Headline */}
                    <h2
                        className="font-black uppercase leading-none tracking-tighter text-[#111] mb-8"
                        style={{ fontSize: 'clamp(2.8rem, 9vw, 8rem)' }}
                    >
                        Nike Air Max<br />Pulse
                    </h2>

                    {/* Separator */}
                    <div className="mx-auto mb-10 h-px w-20 bg-gray-200" />

                    {/* Body copy */}
                    <p className="text-gray-500 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-14 font-medium">
                        Built for movement. Engineered for the streets. The Air Max Pulse
                        channels raw energy into every step — bold silhouette, reactive
                        cushioning, and a presence that commands the room before you even lace up.
                    </p>

                    {/* CTA pill */}
                    <Link
                        to="/"
                        id="tiger-hero-shop-now"
                        className="inline-flex items-center gap-3 bg-[#111] text-white font-black uppercase tracking-widest rounded-full px-12 py-4 text-sm hover:bg-[#800000] transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-100"
                    >
                        Shop Now
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2"
                                strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Link>
                </div>
            </section>

            {/* Thin divider stripe into product catalog */}
            <div className="bg-white h-px w-full" />
        </>
    );
}
