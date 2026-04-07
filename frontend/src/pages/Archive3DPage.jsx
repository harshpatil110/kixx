import React from 'react';

export default function Archive3DPage() {
  return (
    <div className="w-full min-h-screen bg-surface text-on-surface selection:bg-tertiary/20 font-body">
      <main className="pt-32 pb-24 px-8 max-w-[1440px] mx-auto">
        {/* Editorial Heading */}
        <header className="mb-16 md:mb-24 flex flex-col md:flex-row items-start md:items-end gap-6">
          <h1 className="text-5xl md:text-8xl font-black font-headline tracking-tighter leading-none -ml-1">
            ARCHIVE ARTIFACT: <br />KX-8802
          </h1>
          <div className="flex h-16 md:h-24 items-center">
            <div className="w-[1.5px] h-full bg-tertiary mx-6 hidden md:block"></div>
            <p className="text-xl md:text-2xl font-body italic text-on-surface-variant max-w-xs leading-tight">
              3D Visualizer and Configuration
            </p>
          </div>
        </header>

        {/* Main 3D Visualizer Canvas */}
        <section className="relative mb-24 flex justify-center">
          <div className="w-full max-w-5xl bg-surface-container-lowest rounded-sm border border-outline-variant/15 shadow-sm overflow-hidden aspect-video flex items-center justify-center relative">
            {/* Background decorative glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-surface-container-low to-white pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-tertiary-container/10 rounded-full blur-[120px]"></div>
            
            <img 
              alt="Hyper-realistic 3D render of a minimal white designer sneaker on a neutral gray studio background with soft directional lighting" 
              className="relative z-10 w-4/5 h-auto object-contain mix-blend-multiply" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqI05E4x6T_5GdCmT5_xkjpI1-2Fz4DwL1Q5JCpOymDQ4ieoaSv36aPFWMHi69mkLwvG9J3j_5EhJpO7Q2a3CrMcTc3cceR5fjc5LxM9yM31Hwj8AO7lrEQ5x8MiGbtGRJaEYgl6PMGMqwgbhRXoS_FjtIf3sJw48UCedr4CuFt8uHKyvIWLX7Kz2MNFCe7FmAzDVDZHeHwWbhfR0PvY_sq1POeJBtMco7uV_LvIBDiUvlXYND0lFM7x13W9a4xjzmLPIHk8Uz380B" 
            />

            {/* Control Overlay */}
            <div className="absolute bottom-6 right-6 flex items-center gap-3 z-20">
              <button className="w-10 h-10 flex items-center justify-center bg-surface/90 backdrop-blur-md rounded-sm border border-outline-variant/20 hover:text-tertiary transition-colors">
                <span className="material-symbols-outlined">fullscreen</span>
              </button>
              <button className="w-10 h-10 flex items-center justify-center bg-surface/90 backdrop-blur-md rounded-sm border border-outline-variant/20 hover:text-tertiary transition-colors">
                <span className="material-symbols-outlined">refresh</span>
              </button>
              <button className="w-10 h-10 flex items-center justify-center bg-surface/90 backdrop-blur-md rounded-sm border border-outline-variant/20 hover:text-tertiary transition-colors">
                <span className="material-symbols-outlined">layers</span>
              </button>
              <button className="w-10 h-10 flex items-center justify-center bg-surface/90 backdrop-blur-md rounded-sm border border-outline-variant/20 hover:text-tertiary transition-colors">
                <span className="material-symbols-outlined">photo_camera</span>
              </button>
            </div>

            {/* Canvas Label */}
            <div className="absolute top-6 left-6 z-20">
              <span className="font-label text-[0.625rem] uppercase tracking-[0.2em] text-on-surface-variant bg-surface-container-low px-2 py-1">
                Live Artifact Stream // 8802-A
              </span>
            </div>
          </div>
        </section>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24 mb-24">
          <div className="md:col-span-4 flex flex-col justify-between">
            <div>
              <span className="font-label text-[0.6875rem] uppercase tracking-widest text-tertiary mb-6 block">
                COMPONENT 02: HIGH-FIDELITY 3D VISUALIZER
              </span>
              <p className="text-lg leading-relaxed text-on-surface-variant font-body">
                The KX-8802 architecture is rendered in a real-time environment, allowing for precise volumetric inspection of leather grain and structural seams. This digital twin serves as the definitive reference for the 2024 archive collection.
              </p>
            </div>
          </div>
          <div className="md:col-span-8">
            <blockquote className="text-3xl md:text-5xl font-body italic leading-tight text-on-surface border-l-4 border-tertiary pl-8 py-2">
              "A detailed visual fidelity that defines the sneaker as a sculptural technical artifact through interactive exploration."
            </blockquote>
          </div>
        </div>

        {/* Technical Specs */}
        <section className="bg-surface-container-low py-12 px-8 md:px-16 rounded-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col gap-1">
              <span className="font-label text-[0.6875rem] uppercase tracking-widest text-on-surface-variant">Model Number</span>
              <span className="font-headline font-bold text-sm">KX-8802</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-label text-[0.6875rem] uppercase tracking-widest text-on-surface-variant">Primary Material</span>
              <span className="font-headline font-bold text-sm">Technical Leather</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-label text-[0.6875rem] uppercase tracking-widest text-on-surface-variant">Archive Year</span>
              <span className="font-headline font-bold text-sm">2024</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-label text-[0.6875rem] uppercase tracking-widest text-on-surface-variant">Configuration Status</span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-tertiary rounded-full"></div>
                <span className="font-headline font-bold text-sm">Verified</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-24 text-center">
          <button className="bg-on-surface text-surface py-5 px-12 rounded-sm font-label text-[0.75rem] font-bold uppercase tracking-[0.2em] inline-flex items-center gap-3 hover:opacity-90 transition-opacity">
            [EXPLORE IN AR]
            <span className="material-symbols-outlined !text-[14px]">lock</span>
          </button>
        </section>
      </main>
    </div>
  );
}
