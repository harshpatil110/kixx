# KIXX Frontend (React + Vite + Tailwind + Zustand)

Welcome to the **KIXX** frontend UI—a premium, responsive Sneaker E-commerce application that prioritizes high-fidelity styling over generic web implementations. The system seamlessly leverages Drizzle's eager-loaded nested DB queries, allowing a fluid data-binding UX architecture spanning from Product Catalogs directly down to the variant cart arrays.

## Prerequisites
* **Node.js**: v18+
* **Vite**: Modern lightning-fast build tooling
* **Firebase Config**: A client Web App configuration snippet 

## Setup Instructions
1. Navigate to the `/frontend` directory and trigger standard `npm` package retrieval:
   ```bash
   npm install
   ```
2. Copy the explicit `.env` layout mapping the backend target domain alongside the individual string variables for the Firebase initialization arrays:
   ```bash
   cp .env.example .env
   ```
3. Fill out `.env` carefully (omitting the standard quotes surrounding the variable pairs unless explicitly instructed by the Firebase console format). 
4. Launch the application stack mapped to a hot-reloading development server:
   ```bash
   npm run dev
   ```

## Architecture Overview

### Routing
The application pivots entirely on **React Router (v6)** mapping across unified Layout wrappers (`<Navbar />`) globally binding `<Routes>` alongside gated `<ProtectedRoute />` components blocking anonymous cart/order manipulations based sequentially on the global state condition array of `isAuthenticated`.

### State Management
* **Auth**: `Zustand` natively maps variables parsed via `firebase/auth` and intercepts initial DOM loading using `onAuthStateChanged()`.
* **Cart**: `Zustand` deeply nested mappings wrapped inside `zustand/middleware` `persist()`. Dynamically saves line items, limits variants against DB `stock` numbers natively, and recalculates totals directly to HTML `localStorage`.

### Data Fetching
**TanStack React Query (v5)** provides seamless cache hydration polling across deeply nested catalog variants mapping. `Axios` instance interceptors aggressively hunt down `firebase/auth` valid tokens automatically inserting Bearer hashes on every external DB interaction dynamically.

### Interactivity & Styling
Vibrant custom mappings using pure **Tailwind CSS**. A unified palette (KIXX Beige `#F5F5DC`, Maroon `#800000`, and Charcoal), modern Google Fonts UI rendering, and `lucide-react` iconography provides the core premium dynamic user aesthetics.
