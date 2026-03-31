# KIXX — Premium Sneaker E-Commerce Platform

> A full-stack sneaker marketplace built with a modern React frontend, Node.js/Express modular monolith backend, Neon PostgreSQL (Drizzle ORM), Firebase Auth, Razorpay payments, and an AI-powered outfit analysis feature.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [API Reference](#api-reference)
- [Architecture](#architecture)
- [Scripts](#scripts)
- [Contributing](#contributing)

---

## Overview

KIXX is a production-grade sneaker e-commerce platform with a premium UI, real-time inventory management, a personalized AI recommendation engine, AR try-on support, and an admin analytics dashboard. It is designed as a **Modular Monolith** on the backend — grouped by domain feature boundaries — with a performance-first React frontend leveraging code splitting, progressive image loading, and TanStack Query caching.

---

## Tech Stack

### Frontend

<p align="left">
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite_7-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/React_Router_v7-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white" alt="React Router" />
  <img src="https://img.shields.io/badge/TanStack_Query_v5-FF4154?style=for-the-badge&logo=reactquery&logoColor=white" alt="TanStack Query" />
  <img src="https://img.shields.io/badge/Zustand_v5-433E38?style=for-the-badge&logo=react&logoColor=white" alt="Zustand" />
  <img src="https://img.shields.io/badge/Firebase_v12-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white" alt="Axios" />
  <img src="https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=black" alt="GSAP" />
  <img src="https://img.shields.io/badge/Recharts-22B5BF?style=for-the-badge&logo=react&logoColor=white" alt="Recharts" />
  <img src="https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white" alt="Three.js" />
  <img src="https://img.shields.io/badge/jsPDF-EC1C24?style=for-the-badge&logo=adobeacrobatreader&logoColor=white" alt="jsPDF" />
  <img src="https://img.shields.io/badge/Lucide_React-F56565?style=for-the-badge&logo=lucide&logoColor=white" alt="Lucide React" />
</p>

| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **Vite 7** | Build tool & dev server |
| **Tailwind CSS 3** | Utility-first styling |
| **React Router v7** | Client-side routing |
| **TanStack React Query v5** | Server state, caching & prefetching |
| **Zustand v5** | Global client state (auth + cart) |
| **Firebase (JS SDK v12)** | Authentication (Google, Email/Password) |
| **Axios** | HTTP client with token interceptors |
| **GSAP + Lenis** | Scroll animations & smooth scrolling |
| **Recharts** | Admin analytics charts |
| **react-hot-toast** | Toast notifications |
| **lucide-react** | Icon system |
| **jsPDF + jspdf-autotable** | Client-side invoice generation |
| **@google/model-viewer** | WebXR / AR try-on |
| **three.js** | 3D rendering support |
| **browser-image-compression** | Client-side image compression |

### Backend

<p align="left">
  <img src="https://img.shields.io/badge/Node.js_v18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express_v5-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black" alt="Drizzle ORM" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Neon_DB-00E5A0?style=for-the-badge&logo=neon&logoColor=black" alt="Neon DB" />
  <img src="https://img.shields.io/badge/Firebase_Admin_v13-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase Admin" />
  <img src="https://img.shields.io/badge/Razorpay-02042B?style=for-the-badge&logo=razorpay&logoColor=3395FF" alt="Razorpay" />
  <img src="https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white" alt="Axios" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/bcrypt-003A70?style=for-the-badge&logo=letsencrypt&logoColor=white" alt="bcrypt" />
  <img src="https://img.shields.io/badge/dotenv-ECD53F?style=for-the-badge&logo=dotenv&logoColor=black" alt="dotenv" />
  <img src="https://img.shields.io/badge/nodemon-76D04B?style=for-the-badge&logo=nodemon&logoColor=white" alt="nodemon" />
</p>

| Technology | Purpose |
|---|---|
| **Node.js v18+** | Runtime |
| **Express v5** | HTTP framework |
| **Drizzle ORM v0.45** | Type-safe ORM + schema management |
| **postgres.js** | PostgreSQL driver |
| **Neon DB** | Serverless PostgreSQL (cold-start resilient) |
| **Firebase Admin SDK v13** | Server-side token verification |
| **Razorpay** | Payment gateway integration |
| **Axios** | Server-side HTTP (AI/Gemini API calls) |
| **express-validator** | Input validation |
| **bcrypt** | Password hashing |
| **jsonwebtoken** | JWT utilities |
| **multer** | File upload handling |
| **dotenv** | Environment configuration |
| **nodemon** | Dev server auto-reload |
| **drizzle-kit** | Schema push & Drizzle Studio |

---

## Project Structure

```
kixx/
├── backend/
│   ├── server.js                   # Express app entry point
│   ├── drizzle.config.js           # Drizzle ORM config
│   ├── src/
│   │   ├── config/
│   │   │   ├── firebase.js         # Firebase Admin init
│   │   │   └── database.js         # DB re-export (compat)
│   │   ├── db/
│   │   │   ├── index.js            # DB connection + cold-start retry logic
│   │   │   ├── schema.js           # Full Drizzle schema (all models + relations)
│   │   │   └── dnsHack.js          # Google DNS override for Neon on Windows
│   │   ├── controllers/
│   │   │   ├── adminController.js  # Dashboard stats, sales, inventory alerts
│   │   │   └── aiController.js     # AI outfit analysis endpoint
│   │   ├── middleware/
│   │   │   ├── auth.js             # Firebase token verification middleware
│   │   │   ├── errorHandler.js     # Global error handler
│   │   │   └── validation.js       # UUID + order payload validation
│   │   ├── routes/
│   │   │   ├── auth.js             # POST /api/auth/sync
│   │   │   ├── products.js         # GET /api/products, GET /api/products/:id
│   │   │   ├── orders.js           # Order CRUD + payment
│   │   │   ├── payment.js          # Razorpay order creation
│   │   │   ├── admin.js            # Admin-only analytics routes
│   │   │   ├── recommendations.js  # Personalized product feed
│   │   │   ├── outfit.js           # Outfit analysis (deprecated, moved to aiRoutes)
│   │   │   └── aiRoutes.js         # POST /api/ai/analyze-outfit
│   │   ├── services/
│   │   │   ├── AuthService.js      # Firebase ↔ DB user sync
│   │   │   ├── OrderService.js     # Order creation, payment, history
│   │   │   ├── ProductService.js   # Product + variant queries
│   │   │   └── RecommendationService.js  # Hybrid recommendation engine
│   │   ├── models/
│   │   │   └── index.js            # Drizzle schema re-exports
│   │   ├── utils/
│   │   │   └── asyncHandler.js     # Async route wrapper
│   │   └── scripts/
│   │       ├── seed.js             # Full DB seed (brands, products, variants)
│   │       ├── seedSneakers.js     # Additional sneaker data
│   │       ├── seed_recommendation_metadata.js  # Tags / style metadata
│   │       ├── update_ar.js        # Populate AR model URLs
│   │       ├── setupAdmin.js       # Promote user to admin role
│   │       └── check_state.js      # Quick DB state debugger
│
└── frontend/
    ├── index.html
    ├── vite.config.js              # Chunking strategy, proxy, build config
    ├── tailwind.config.js
    ├── src/
    │   ├── App.jsx                 # Routes, lazy loading, Firebase listener
    │   ├── main.jsx                # React root + QueryClientProvider
    │   ├── config/
    │   │   ├── firebase.js         # Firebase client init
    │   │   └── queryClient.js      # TanStack Query client + prefetch helper
    │   ├── store/
    │   │   ├── authStore.js        # Zustand auth state
    │   │   └── cartStore.js        # Zustand cart (persisted to localStorage)
    │   ├── services/
    │   │   ├── api.js              # Axios instance with auth interceptors
    │   │   ├── authService.js      # Backend sync service
    │   │   ├── productService.js   # Product API calls
    │   │   └── orderService.js     # Order API calls
    │   ├── components/
    │   │   ├── Navbar.jsx          # Liquid glass navbar + cart drawer trigger
    │   │   ├── CartDrawer.jsx      # Slide-in dark glass cart panel
    │   │   ├── CartItem.jsx        # Cart line item with qty controls
    │   │   ├── ProductCard.jsx     # Catalog card with progressive image load
    │   │   ├── VariantSelector.jsx # Size + color selector with stock check
    │   │   ├── ARTryOn.jsx         # model-viewer WebXR component
    │   │   ├── RecommendedFeed.jsx # Horizontal scroll AI-powered product feed
    │   │   ├── TigerHeroSection.jsx # GSAP canvas frame-scrub hero
    │   │   ├── PageSkeleton.jsx    # Suspense shimmer skeletons
    │   │   ├── ProtectedRoute.jsx  # Auth guard (with loading state)
    │   │   └── AdminRoute.jsx      # Admin role guard
    │   ├── pages/
    │   │   ├── LandingPage.jsx
    │   │   ├── CatalogPage.jsx
    │   │   ├── ProductDetailPage.jsx
    │   │   ├── CartPage.jsx
    │   │   ├── CheckoutPage.jsx
    │   │   ├── PaymentPage.jsx
    │   │   ├── OrderHistoryPage.jsx
    │   │   ├── OrderDetailPage.jsx
    │   │   ├── OrderConfirmationPage.jsx
    │   │   ├── AccountPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── OutfitCheckerPage.jsx
    │   │   └── admin/
    │   │       └── DashboardPage.jsx
    │   ├── layouts/
    │   │   └── AdminLayout.jsx     # Sidebar + main content admin shell
    │   └── utils/
    │       ├── currency.js         # INR price formatter
    │       └── generateInvoice.js  # jsPDF invoice builder
```

---

## Features

### Storefront
- Full product catalog with brand and category filtering
- Product detail page with variant selector (size + color), stock indicator, and AR try-on
- Progressive image loading with blur-up placeholders
- Hover prefetching of product detail data via TanStack Query

### Cart & Checkout
- Persistent cart (Zustand + localStorage) with quantity controls and stock enforcement
- Razorpay payment gateway integration (INR)
- Post-payment order snapshot saved to `past_orders` table with atomic stock decrement
- Client-side invoice PDF generation (jsPDF)

### Authentication
- Firebase Authentication (Email/Password + Google)
- Server-side token verification via Firebase Admin SDK on all protected routes
- Zustand auth store synced to Firebase `onAuthStateChanged`
- Backend user sync (`POST /api/auth/sync`) maps Firebase UID to PostgreSQL user record

### AI & Personalization
- Hybrid recommendation engine (content-based + behavioral signals)
  - Factors: color palette match, style type similarity, occasion fit, AR interaction history, purchase/browse history
  - Style Match Score (0–100) displayed per product
  - Cold-start fallback: surfaces `isNew` products for users with no history
- AI outfit analysis via `/api/ai/analyze-outfit`
- User behavioral signals stored as JSONB in the `users` table and updated on every interaction

### AR Try-On
- `@google/model-viewer` integration with WebXR, Android Scene Viewer, and iOS QuickLook
- All products seeded with a sample `.glb` model URL
- Falls back to interactive 3D view on desktop

### Admin Dashboard
- Protected by Firebase token + PostgreSQL role check (`admin` role)
- KPI stats: total revenue, order count, customer count
- Sales by brand chart (Recharts)
- Low stock alerts (10 lowest-stock products)

### Animations
- GSAP ScrollTrigger + Lenis smooth scroll canvas frame-scrub hero (242 frames)
- Tailwind transition utilities for hover states and drawer animations

---

## Getting Started

### Prerequisites

- **Node.js** v18 or newer
- A [Neon](https://neon.tech) serverless PostgreSQL database
- A [Firebase](https://firebase.google.com) project with:
  - Email/Password and/or Google auth enabled (client)
  - A service account key (server)
- A [Razorpay](https://razorpay.com) account (Key ID + Secret)

---

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in .env (see Environment Variables below)
npm run dev
```

The server starts on port `5000` by default. The Neon DB connection uses an exponential backoff retry loop (up to 4 attempts) to handle cold starts gracefully.

---

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Fill in .env (see Environment Variables below)
npm run dev
```

The dev server starts on `http://localhost:5173` and proxies `/api/*` requests to `http://localhost:5000`.

---

## Environment Variables

### Backend — `backend/.env`

```env
# Server
PORT=5000

# Neon DB / PostgreSQL
DATABASE_URL="postgresql://user:password@endpoint.neon.tech/neondb?sslmode=require"

# Firebase Admin Service Account
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nKey\n-----END PRIVATE KEY-----\n"

# Razorpay
RAZORPAY_KEY_ID="rzp_test_xxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="your_razorpay_secret"

# CORS
CORS_ORIGIN="http://localhost:5173"

# Optional: Gemini API (AI features)
GEMINI_API_KEY="your_gemini_api_key"
```

> **Note on `FIREBASE_PRIVATE_KEY`:** Newlines must be literal `\n` characters (not actual line breaks) when pasting from the Firebase console JSON.

### Frontend — `frontend/.env`

```env
VITE_API_URL="http://localhost:5000"

VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="1234567890"
VITE_FIREBASE_APP_ID="1:1234567890:web:abcdef123456"
```

---

## Database

KIXX uses [Drizzle ORM](https://orm.drizzle.team) with a Neon serverless PostgreSQL database.

### Schema Overview

| Table | Description |
|---|---|
| `users` | Auth mapping, profile, and JSONB behavioral signals |
| `brands` | Sneaker manufacturers |
| `products` | Product catalog with AR metadata, tags, style type |
| `product_variants` | SKU-level size/color/stock entries |
| `orders` | Order records with status lifecycle |
| `order_items` | Line items linking variants to orders |
| `past_orders` | Denormalized snapshot of completed transactions |
| `inventory_logs` | Audit log for stock changes |
| `recommendations_logs` | Per-user interaction log for the recommendation engine |
| `resale_listings` | *(Future)* Peer-to-peer resale |
| `pricing_rules` | *(Future)* Dynamic demand-based pricing |

### Common Commands

```bash
# Push schema changes to Neon DB
npx drizzle-kit push

# Open Drizzle Studio (visual DB browser)
npx drizzle-kit studio

# Seed the database (clears existing data, inserts brands, products, variants)
npm run seed

# Populate recommendation metadata (tags, colors, styleType) on existing products
node src/scripts/seed_recommendation_metadata.js

# Update all products with a sample AR model URL
node src/scripts/update_ar.js

# Promote a user to admin
node src/scripts/setupAdmin.js user@example.com
```

---

## API Reference

All protected routes require a Firebase ID Token in the `Authorization: Bearer <token>` header.

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/sync` | ✅ | Sync Firebase user to PostgreSQL |

### Products
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | ❌ | Get all products (supports `?brandId=` and `?category=`) |
| GET | `/api/products/:id` | ❌ | Get single product with brand and variants |

### Orders
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/orders` | ✅ | Create order, validate stock via transaction |
| POST | `/api/orders/save` | ✅ | Save completed order snapshot post-payment |
| POST | `/api/orders/:id/payment` | ✅ | Process mock payment, update status |
| GET | `/api/orders/user/:userId` | ✅ | Get all orders for authenticated user |
| GET | `/api/orders/:id` | ✅ | Get single order (ownership enforced) |

### Payment
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/payment/create-order` | ✅ | Create Razorpay order (`amount` in INR) |

### Recommendations
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/recommendations/:userId` | ❌ | Get personalized product feed (top 12) |
| GET | `/api/recommendations/style-match/:userId/:productId` | ❌ | Get Style Match Score + reasons |
| POST | `/api/recommendations/interaction` | ❌ | Log user interaction (view, ar_try_on, cart_add, purchase) |

### AI
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/ai/analyze-outfit` | ❌ | Analyze outfit image, return style feedback |

### Admin *(requires `admin` role)*
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/stats` | ✅ Admin | Revenue, order count, customer count |
| GET | `/api/admin/sales-by-brand` | ✅ Admin | Aggregated revenue per brand |
| GET | `/api/admin/inventory-alerts` | ✅ Admin | 10 lowest-stock products |

---

## Architecture

### Backend — Modular Monolith

```
HTTP Request
    │
    ▼
Express Middleware (CORS, body-parser, Firebase Auth)
    │
    ▼
Route Layer (/src/routes/)
    │
    ▼
Service Layer (/src/services/)   ←  Business logic lives here
    │
    ▼
Drizzle ORM + postgres.js
    │
    ▼
Neon DB (PostgreSQL)
```

**Neon Cold-Start Resilience:** `src/db/index.js` implements an exponential backoff retry loop (1 initial + 3 retries, 4s/8s/16s delays) before handing off a healthy `postgres.js` client to Drizzle. A Proxy wraps the `db` export so routes that import `{ db }` at module load time don't crash before the connection is ready.

### Frontend — Performance Architecture

- **Route-based code splitting** via `React.lazy()` + `Suspense` with shimmer skeleton fallbacks
- **Manual Rollup chunking** in `vite.config.js` splits `react`, `router`, `query`, `firebase`, `icons`, and `vendor` into separate cacheable chunks
- **Hover prefetching** fires `queryClient.prefetchQuery` on `ProductCard` `onMouseEnter` so the product detail page loads instantly
- **TanStack Query** with 5-minute staleTime and 3 retries (exponential backoff) mirrors the backend cold-start retry schedule

---

## Scripts

### Backend
| Command | Description |
|---|---|
| `npm run dev` | Start dev server with nodemon |
| `npm start` | Start production server |
| `npm run seed` | Full DB seed (clears + repopulates) |
| `npx drizzle-kit push` | Sync Drizzle schema to Neon DB |
| `npx drizzle-kit studio` | Open Drizzle visual studio |

### Frontend
| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please follow the existing code style. Backend services should remain in the Service layer — controllers should only handle HTTP concerns. Frontend state mutations should go through Zustand stores or TanStack Query mutations, not local component state.

---

## License

This project is private and proprietary. All rights reserved.
