// ---------------------------------------------------------------------------
// API Base URL — single source of truth for every backend request.
//
// IMPORTANT: Vite inlines `import.meta.env` at BUILD time, not at runtime.
// The value resolved here is frozen into the bundle when `npm run build` runs.
//
//   • Local dev  → VITE_API_BASE_URL in frontend/.env (http://localhost:5000)
//   • Production → VITE_API_BASE_URL MUST be set in the host's build-time
//                  environment (e.g. Vercel Project Settings → Environment
//                  Variables). If it is missing, the fallback below is what
//                  ships in the production bundle — that is exactly the
//                  ERR_CONNECTION_REFUSED bug this module prevents.
//
// Keep the variable name identical in .env and the production host so the
// build never silently falls back to localhost.
// ---------------------------------------------------------------------------
export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
