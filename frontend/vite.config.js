import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    // ---------------------------------------------------------------------------
    // Output directory — explicitly set so Vercel can always locate the build
    // ---------------------------------------------------------------------------
    outDir: 'dist',
    emptyOutDir: true,

    // ---------------------------------------------------------------------------
    // Minification
    // esbuild is Vite's default minifier and is significantly faster than Terser
    // while producing comparable output sizes for most production builds.
    // Switch to 'terser' only if you need advanced dead-code elimination passes.
    // ---------------------------------------------------------------------------
    minify: 'esbuild',

    // Target modern browsers for smaller, more efficient output (skips polyfills)
    target: 'es2020',

    // Emit a warning when any individual chunk exceeds this size (in kB)
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // -----------------------------------------------------------------------
        // Manual Chunking Strategy
        //
        // Why: Without explicit chunking, Rollup may bundle all node_modules into
        // a single "vendor" file. Splitting them by package means the browser can
        // cache each vendor file independently. When you only update your app code
        // or upgrade Lucide, only that specific chunk is re-downloaded.
        //
        // Chunk groups:
        //  • react-core   — React runtime + DOM (rarely changes, always cached)
        //  • router       — React Router DOM
        //  • query        — TanStack React Query + Devtools
        //  • firebase     — Largest dependency; isolated so app updates don't bust it
        //  • icons        — Lucide (large icon tree; users cache it across pages)
        //  • ui-libs      — Zustand, react-hot-toast & other small UI utilities
        // -----------------------------------------------------------------------
        manualChunks(id) {
          // -----------------------------------------------------------------------
          // NOTE: React DOM's internal scheduler creates cross-chunk circular deps
          // when react/* and other node_modules are in separate named chunks.
          // Solution: merge react + all small UI libs into one 'vendor' chunk.
          // Firebase, Router, Query, and Icons are still isolated for cache wins.
          // -----------------------------------------------------------------------

          // React Router (+ Remix Run runtime it ships with)
          if (id.includes('node_modules/react-router') || id.includes('node_modules/@remix-run')) {
            return 'router';
          }

          // TanStack React Query
          if (id.includes('node_modules/@tanstack/')) {
            return 'query';
          }

          // Firebase SDK — largest dep; isolated so app updates don't bust its cache
          if (id.includes('node_modules/firebase/') || id.includes('node_modules/@firebase/')) {
            return 'firebase';
          }

          // Lucide icons — tree-shaken but still sizable; isolate for caching
          if (id.includes('node_modules/lucide-react/')) {
            return 'icons';
          }

          // Everything else in node_modules:
          // react, react-dom, scheduler, zustand, axios, react-hot-toast, etc.
          // Bundled together to avoid react-dom scheduler circular dep warnings.
          if (id.includes('node_modules/')) {
            return 'vendor';
          }
        },

        // Deterministic file names with content hashes for long-lived caching
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },

  // ---------------------------------------------------------------------------
  // Dev server proxy (keeps API calls working in local dev without CORS issues)
  // ---------------------------------------------------------------------------
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
