// ---------------------------------------------------------------------------
// API Base URL — single source of truth for every backend request.
//
// IMPORTANT: Vite inlines `import.meta.env` at BUILD time, not at runtime.
// The value resolved here is frozen into the bundle when `npm run build` runs.
//
//   • Local dev   → BASE_URL is 'http://localhost:5000', so requests resolve
//                   to http://localhost:5000/api/... (your Express server).
//   • Production  → BASE_URL is '' (empty string), so requests resolve to
//                   same-origin '/api/...' and hit Vercel's rewrite to the
//                   backend service (see vercel.json). No build-time env var
//                   is required.
//
// This dynamic switch is what fixes the ERR_CONNECTION_REFUSED bug caused by a
// hardcoded 'http://localhost:5000' base URL shipping in the production bundle.
// ---------------------------------------------------------------------------
const BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';

// Exported under the name API_BASE_URL so every caller (services/pages) that
// builds `${API_BASE_URL}/api/...` keeps working without changes.
export const API_BASE_URL = BASE_URL;
