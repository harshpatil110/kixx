# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KIXX is a premium sneaker e-commerce platform. It is a **modular monolith**: a React 19 + Vite frontend and a Node.js/Express v5 backend sharing one Postgres database (Neon, via Drizzle ORM). Auth is handled by Firebase (client SDK + Admin SDK for token verification), payments by Razorpay, and product images by Cloudinary. The README at the repo root is broadly accurate but **out of date** for the project structure and API surface — treat `backend/src/db/schema.js` and `backend/server.js` as the source of truth.

## Commands

### Backend (`cd backend`)

| Command | Purpose |
|---|---|
| `npm run dev` | Start API with nodemon on port **5000** |
| `npm start` | Start production server |
| `npm run seed` | Full reseed — clears and repopulates users/brands/products/variants/orders |
| `npm run seed:launch` | Seed `launch_metrics` + `goodie_allocations` |
| `node src/scripts/seedPromos.js` | Seed the 15 affiliate promo codes (`promo_codes` table) |
| `node src/scripts/setupAdmin.js <email>` | Promote a user to the `admin` role |
| `node src/scripts/seed_recommendation_metadata.js` | Backfill `tags`/`colorPalette`/`styleType` on products |
| `node src/scripts/update_ar.js` | Populate AR model URLs |
| `node src/scripts/check_state.js` | Quick DB state debugger |
| `npx drizzle-kit push` | Sync Drizzle schema to Neon DB (no migrations — schema is pushed directly) |
| `npx drizzle-kit studio` | Open the visual DB browser |

### Frontend (`cd frontend`)

| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server on port **5173** |
| `npm run build` | Production build to `dist/` |
| `npm run lint` | ESLint (flat config in `eslint.config.js`) |
| `npm run preview` | Preview the production build |
| `npm run clean-catalog-images` | Batch background-removal script (`scripts/remove-bgs.js`) |

There is **no test suite** despite `jest` and `supertest` being installed as backend devDependencies — `npm test` is a stub. Do not assume tests exist.

## Architecture

### Backend — layered modular monolith

Request flow: Express middleware → routes (`backend/src/routes/*`) → controllers (`backend/src/controllers/*`) → services (`backend/src/services/*`, where business logic lives) → Drizzle ORM → Neon Postgres. Controllers should stay thin; the README's contributing notes require service-layer business logic.

- **Schema**: every table lives in one file, `backend/src/db/schema.js`, and is re-exported through `backend/src/models/index.js`. New tables are added there, then pushed with `drizzle-kit push`. Key tables: `users`, `brands`, `products`, `product_variants`, `orders` + `order_items` (transactional), `past_orders` (denormalized snapshot of completed checkouts), `inventory_logs`, `user_feedback`, `product_reviews`, `promo_codes`, `launch_metrics`, `goodie_allocations`, `user_collection`. `resale_listings` and `pricing_rules` are future-phase, mostly unused.

- **Neon cold-start resilience** (`backend/src/db/index.js`): the `postgres.js` client is lazy, so the module runs an exponential-backoff connection probe (4 attempts, 4s→8s→16s delays) at load time and exposes a `dbReadyPromise`. The exported `db` is a **Proxy** that throws "Database is still connecting" if a query is attempted before the connection resolves — this is why `const { db } = require('../db/index')` works at module-load time. Scripts and any code that needs a guaranteed-available client should `await dbReadyPromise` first (see the seed scripts). `server.js` starts listening for HTTP immediately and lets the DB wake up in the background.

- **Auth flow**: clients get a Firebase ID token; the backend never issues its own sessions. `verifyToken` middleware (`backend/src/middleware/auth.js`) validates the `Authorization: Bearer <id-token>` header via the Firebase Admin SDK and attaches the decoded token to `req.user`. `POST /api/auth/sync` (via `AuthService.syncUserWithDb`) upserts the Firebase user into the `users` table (email-keyed) and handles early-adopter goodie assignment. **Admin routes** in `backend/src/routes/admin.js` chain `verifyToken` → `isAdmin` (a DB role lookup by email) on the whole router.

- **Checkout / promos**: `POST /api/checkout/apply-promo` validates a code against `promo_codes` (lookup is uppercased) and returns the computed discount. Order creation (`OrderService.createOrder`) validates variant stock and inserts `orders` + `order_items` inside a `db.transaction`. Completed checkouts are written to `past_orders` (which records `promoCodeUsed`) and decrement stock. **Admin analytics read `past_orders`, not `orders`.**

- **Recommendation engine** (`RecommendationService.js`): hybrid content-based (color palette / style / occasion tags) + behavioral (JSONB columns on `users`: `browsingHistory`, `purchaseHistory`, `arInteractions`, `outfitInsights`) + cold-start fallback (`isNew`). Products carry `tags`, `colorPalette`, `styleType` for matching.

### Frontend

- **Routing** (`frontend/src/App.jsx`): all pages are `React.lazy()` + `Suspense` (route-based code splitting). Public marketing routes (`/`, `/catalog`, `/product/:id`) render without the global Navbar/Footer. Protected routes wrap with `ProtectedRoute`; the whole `/admin/*` subtree wraps with `AdminRoute` and nests under `AdminLayout` (sidebar shell). The `onAuthStateChanged` listener in `App.jsx` sets auth optimistically, then syncs with the backend to restore the DB role.
- **State**: Zustand — `authStore` (user + role) and `cartStore` (persisted to localStorage under key `kixx-cart-storage`). Server state goes through TanStack Query; the axios instance `frontend/src/services/api.js` attaches the Firebase token via a request interceptor (`getIdToken(true)` for a fresh token) and toasts errors globally.
- **Build**: `vite.config.js` manual-chunks vendors (router, query, three, r3f, firebase, icons) for long-lived caching. Note: the dev-server proxy targets `http://localhost:3000`, but the backend actually runs on **5000** — this is dormant because `api.js` uses `VITE_API_URL` directly, but don't rely on the proxy.
- **Design language**: warm editorial, light theme for storefront/admin (`#FAFAF8` surfaces) with a **maroon `#800000`** accent; the admin sidebar is dark (`#0F0F0F`). The admin task notes explicitly forbid a dark-mode admin aesthetic — keep new admin UI light/warm.

## Environment

Two separate `.env` files (both git-ignored; templates in `.env.example`):

- **`backend/.env`**: `PORT`, `DATABASE_URL`, `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY`, `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`, `CORS_ORIGIN`, `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`, `EMAIL_USER` / `EMAIL_PASS` (nodemailer, used by the AI outfit feature), optional `GEMINI_API_KEY`.
  - **Gotcha**: `FIREBASE_PRIVATE_KEY` must contain literal `\n` escape sequences (single string), not real newlines, when pasted from the Firebase console.
- **`frontend/.env`**: `VITE_FIREBASE_*` client config (plus optional `VITE_RAZORPAY_KEY_ID`). The API base URL is consumed via the single shared module `frontend/src/config/apiConfig.js` (exports `API_BASE_URL`), which auto-switches via `import.meta.env.PROD`: `''` in production (requests go to same-origin `/api/...` → `vercel.json` rewrite to the backend) and `http://localhost:5000` in local dev. **No build-time API env var is required** — do not add `VITE_API_BASE_URL` back to the Vercel environment.

## Practical notes

- **Admin dashboard endpoints** under `/api/admin/*` (stats, launch/audience/retention/marketing analytics, inventory CRUD, sales ledger, customers, feedback, reviews, settings) are aggregated with PostgreSQL-level queries — complex aggregations use raw `db.execute(sql\`...\`)` (e.g., `jsonb_array_elements` to unnest `past_orders.items`, `generate_series` for zero-padded daily trends). Follow that pattern for new analytics.
- **Admin product intake** (`POST /api/admin/products/add`): multer saves to `backend/uploads/`, uploads to Cloudinary (`kixx_inventory` folder), resolves-or-creates the brand, then inserts the product.
- **Seed scripts are destructive** — `seed.js` deletes most tables in dependency order before inserting. Run them against a dev/staging DB, not production.
- **Backend stack**: CommonJS (`type: "commonjs"`), Node 18+. Frontend is ESM. Don't mix import styles across the boundary.
