# KIXX Backend API (Node.js + Express + Drizzle ORM)

This is the backend API for the KIXX e-commerce platform. It is built using a **Modular Monolith** architecture, grouping functionality strictly by domain feature boundaries rather than rigid layers. This enables faster iteration cycles and ensures that our state logic remains robust and decoupled for future scaling.

## Prerequisites
* **Node.js**: v18 or newer
* **Database**: A serverless Neon Database (PostgreSQL)
* **Authentication**: A Google Firebase Project Service Account

## Setup Instructions
1. Navigate into the backend directory and install dependencies:
   ```bash
   npm install
   ```
2. Copy the template `.env` setup:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and fill out your Neon DB metrics and Firebase Service Account key (ensure whitespace strictly formats as literal `\n` characters in your JSON parse if copied manually).

## Database Management
Our database architecture strictly maps against eager-loaded JSON schemas dictated by **Drizzle ORM**.

* **Push Schema**: Run this command to synchronize your schema definitions with your Neon DB (this applies changes safely):
  ```bash
  npx drizzle-kit push
  ```
* **Visualizer Tool**: Open Drizzle's localized web dashboard to view live data and manually edit tables:
  ```bash
  npx drizzle-kit studio
  ```
* **Seed Database**: We provide a comprehensive script that purges existing records (in reverse-relational order to prevent constraint violation) and inserts dummy User profiles, multiple Brands, Products, and dynamically quantified Variants:
  ```bash
  npm run seed
  ```

## Database Schema Overview
* **users**: Central auth mapping and profile data structure (seeded with an initial Admin).
* **brands**: Sneaker parent manufacturers. 
* **products**: Metadata concerning specific sneaker drops (`name`, `description`). Tied 1:many to `brands`.
* **product_variants**: Specific SKU endpoints mapping directly to precise colors, sizes, and explicit `stock` levels. Tied 1:many to `products`.
* **orders**: Central billing tracking containing `totalPrice`, date stamps, and status checkpoints mapping to a user.
* **order_items**: Line-item ledger binding individual `product_variants` identically to parent `orders`. 

## API Endpoints

### Authorization
* `POST /api/auth/sync`: Binds the incoming Firebase Bearer token and ensures the `users` profile exists/matches in PostgreSQL. Returns a 200 payload mapping the user table data. (PROTECTED)

### Products
* `GET /api/products`: Queries the Drizzle eager-loading schema to pull all parent `products` alongside deeply nested `brands` and `variants` objects. Allows client-side generic filtering.
* `GET /api/products/:id`: Returns a single product and associated nested relationship arrays.

### Orders
* `POST /api/orders`: Ingests an array of `{ variantId, quantity, price }`, creates a parent `order`, dynamically maps all `order_items`, and aggressively decrements the underlying `product_variants.stock`. Returns the newly generated DB `order.id` (PROTECTED) 
* `POST /api/orders/:id/payment`: Mock payment simulation processor triggering dynamic 'paid' status updates on the target Order ID. (PROTECTED)
* `GET /api/orders/user/:userId`: Deep query against all historical orders and dynamically tied variant line-items for the requested UUID. (PROTECTED)
* `GET /api/orders/:id`: Deep query fetching the specific mapped ledger matrix for a unified UUID order payload. (PROTECTED)

## Running the Server
```bash
# Starts Node server using nodemon for automatic recompilation
npm run dev
```
