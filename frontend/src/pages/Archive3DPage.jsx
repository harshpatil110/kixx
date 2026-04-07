import React, { useState, Suspense, lazy } from 'react';

// Lazy-load the heavy WebGL component so the grid renders instantly
const ModelViewer = lazy(() => import('../components/ModelViewer'));

// ---------------------------------------------------------------------------
// Product Data — swap `modelPath` once your .glb files are placed in public/
// ---------------------------------------------------------------------------
const SHOES = [
  {
    id: 1,
    name: 'KX-8802 ARCHIVE',
    sku: 'KXA-8802-WHT',
    year: '2024',
    material: 'Technical Leather',
    price: '₹24,999',
    modelPath: '/3d-models/model1.glb',
    tag: 'ARCHIVE SERIES',
  },
  {
    id: 2,
    name: 'KX-7701 VOID',
    sku: 'KXA-7701-BLK',
    year: '2023',
    material: 'Woven Nylon',
    price: '₹19,499',
    modelPath: '/3d-models/model2.glb',
    tag: 'LIMITED RUN',
  },
  {
    id: 3,
    name: 'KX-6610 DRIFT',
    sku: 'KXA-6610-TAN',
    year: '2023',
    material: 'Suede + Mesh',
    price: '₹17,999',
    modelPath: '/3d-models/model3.glb',
    tag: 'EDITORIAL',
  },
  {
    id: 4,
    name: 'KX-5509 CORE',
    sku: 'KXA-5509-GRY',
    year: '2022',
    material: 'Canvas',
    price: '₹12,999',
    modelPath: '/3d-models/model4.glb',
    tag: 'VAULT',
  },
];

// ---------------------------------------------------------------------------
// Grid Card
// ---------------------------------------------------------------------------
function ShoeCard({ shoe, onClick }) {
  return (
    <button
      onClick={() => onClick(shoe)}
      className="group w-full text-left bg-white border border-stone-200 overflow-hidden transition-colors duration-200 hover:border-stone-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-900"
    >
      {/* Preview area */}
      <div className="relative bg-[#F7F5F0] aspect-square flex items-center justify-center overflow-hidden">
        {/* Tag badge */}
        <span className="absolute top-4 left-4 font-label text-[0.55rem] uppercase tracking-[0.25em] text-stone-500 bg-white border border-stone-200 px-2 py-1">
          {shoe.tag}
        </span>

        {/* Placeholder silhouette — replaced by model preview thumbnail if available */}
        <div className="flex flex-col items-center gap-2 opacity-30 group-hover:opacity-50 transition-opacity duration-300">
          {/* SVG shoe silhouette */}
          <svg
            viewBox="0 0 200 120"
            className="w-48 h-auto"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 90 C10 90 30 50 80 45 C110 42 140 55 160 60 C175 63 190 68 192 78 C194 88 180 95 160 95 L30 95 C18 95 10 94 10 90Z"
              fill="#1c1c1a"
            />
            <path
              d="M60 45 C62 38 68 25 80 20 C90 16 98 22 98 30 C98 38 88 43 80 45Z"
              fill="#1c1c1a"
            />
          </svg>
          <span className="font-label text-[0.55rem] uppercase tracking-widest text-stone-400">
            Click to View in 3D
          </span>
        </div>

        {/* Hover CTA */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="font-label text-[0.6rem] uppercase tracking-[0.25em] text-stone-900 bg-white border border-stone-300 px-4 py-2">
            OPEN 3D VIEWER →
          </span>
        </div>
      </div>

      {/* Meta */}
      <div className="px-5 py-4 border-t border-stone-200">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h2 className="font-headline font-black text-sm tracking-tight text-stone-900 leading-tight">
            {shoe.name}
          </h2>
          <span className="font-headline font-bold text-sm text-stone-900 whitespace-nowrap">
            {shoe.price}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="font-label text-[0.6rem] uppercase tracking-widest text-stone-400">
            {shoe.sku}
          </span>
          <span className="w-px h-3 bg-stone-200" />
          <span className="font-label text-[0.6rem] uppercase tracking-widest text-stone-400">
            {shoe.year}
          </span>
          <span className="w-px h-3 bg-stone-200" />
          <span className="font-label text-[0.6rem] uppercase tracking-widest text-stone-400">
            {shoe.material}
          </span>
        </div>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Three-dot loading fallback while ModelViewer JS chunk loads
// ---------------------------------------------------------------------------
function ThreeFallback() {
  return (
    <div className="w-full h-full min-h-[500px] bg-[#F7F5F0] flex flex-col items-center justify-center gap-4">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <span className="font-label text-[0.625rem] uppercase tracking-[0.3em] text-stone-400">
        Initialising 3D Engine…
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Archive3DPage
// ---------------------------------------------------------------------------
export default function Archive3DPage() {
  const [selectedShoe, setSelectedShoe] = useState(null);

  return (
    <div className="w-full min-h-screen bg-[#F7F5F0] text-stone-900 font-body">
      <main className="pt-32 pb-24 px-8 max-w-[1440px] mx-auto">

        {!selectedShoe ? (
          /* ----------------------------------------------------------------- */
          /* GRID VIEW                                                          */
          /* ----------------------------------------------------------------- */
          <>
            {/* Editorial header */}
            <header className="mb-16 md:mb-20 flex flex-col md:flex-row items-start md:items-end gap-6">
              <h1 className="text-5xl md:text-8xl font-black font-headline tracking-tighter leading-none -ml-1 text-stone-900">
                ARCHIVE<br />VISUALIZER
              </h1>
              <div className="flex h-16 md:h-24 items-center">
                <div className="w-px h-full bg-stone-300 mx-6 hidden md:block" />
                <p className="text-lg md:text-xl font-body italic text-stone-500 max-w-xs leading-tight">
                  Select an artifact to enter the interactive 3D inspection chamber.
                </p>
              </div>
            </header>

            {/* Divider */}
            <div className="w-full h-px bg-stone-200 mb-12" />

            {/* 4-card grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-px bg-stone-200">
              {SHOES.map((shoe) => (
                <ShoeCard key={shoe.id} shoe={shoe} onClick={setSelectedShoe} />
              ))}
            </div>

            {/* Footer note */}
            <p className="mt-10 font-label text-[0.6rem] uppercase tracking-[0.25em] text-stone-400 text-center">
              All models are interactive WebGL artifacts — use the 3D viewer for volumetric inspection
            </p>
          </>
        ) : (
          /* ----------------------------------------------------------------- */
          /* 3D VIEWER VIEW                                                     */
          /* ----------------------------------------------------------------- */
          <>
            {/* Breadcrumb / back nav */}
            <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedShoe(null)}
                  className="font-label text-[0.6875rem] uppercase tracking-[0.2em] text-stone-500 border border-stone-300 px-4 py-2 rounded-sm hover:border-stone-500 hover:text-stone-900 transition-colors duration-200 flex items-center gap-2"
                >
                  ← BACK TO ARCHIVE
                </button>
                <span className="hidden sm:block w-px h-5 bg-stone-300" />
                <span className="hidden sm:block font-label text-[0.6rem] uppercase tracking-widest text-stone-400">
                  Interactive 3D Mode
                </span>
              </div>

              {/* Current artifact info */}
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                  <span className="font-headline font-black text-sm tracking-tight text-stone-900">
                    {selectedShoe.name}
                  </span>
                  <span className="font-label text-[0.6rem] uppercase tracking-widest text-stone-400">
                    {selectedShoe.sku} · {selectedShoe.year}
                  </span>
                </div>
                <span className="font-headline font-bold text-base text-stone-900">
                  {selectedShoe.price}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-stone-200 mb-6" />

            {/* Canvas container */}
            <div
              className="w-full border border-stone-200 bg-[#F7F5F0] overflow-hidden"
              style={{ height: '70vh', minHeight: '480px' }}
            >
              <Suspense fallback={<ThreeFallback />}>
                <ModelViewer modelPath={selectedShoe.modelPath} />
              </Suspense>
            </div>

            {/* Controls hint */}
            <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6">
                {[
                  { icon: '⟳', label: 'Drag to rotate' },
                  { icon: '⤢', label: 'Scroll to zoom' },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-stone-400 text-sm">{icon}</span>
                    <span className="font-label text-[0.6rem] uppercase tracking-widest text-stone-400">
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Spec strip */}
              <div className="flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="font-label text-[0.55rem] uppercase tracking-widest text-stone-400">Material</span>
                  <span className="font-headline font-bold text-xs text-stone-700">{selectedShoe.material}</span>
                </div>
                <span className="w-px h-6 bg-stone-200" />
                <div className="flex flex-col">
                  <span className="font-label text-[0.55rem] uppercase tracking-widest text-stone-400">Status</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                    <span className="font-headline font-bold text-xs text-stone-700">VERIFIED</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
