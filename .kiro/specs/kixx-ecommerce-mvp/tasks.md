# Implementation Plan

- [ ] 1. Initialize project structure and dependencies
  - [ ] 1.1 Create backend project with Node.js and Express
    - Run `npm init -y` in backend directory
    - Install core dependencies: express, sequelize, pg, pg-hstore, bcrypt, jsonwebtoken, dotenv, cors, express-validator
    - Install dev dependencies: nodemon, jest, supertest
    - Create folder structure: `/src/models`, `/src/services`, `/src/routes`, `/src/middleware`, `/src/config`
    - Create `server.js` entry point with basic Express setup
    - _Requirements: 9.1, 9.4_
  - [ ] 1.2 Create frontend project with React and Tailwind
    - Run `npm create vite@latest frontend -- --template react`
    - Install dependencies: zustand, @tanstack/react-query, axios, react-router-dom
    - Install Tailwind CSS: `npm install -D tailwindcss postcss autoprefixer`
    - Initialize Tailwind config: `npx tailwindcss init -p`
    - Configure Tailwind in `tailwind.config.js` and add directives to `index.css`
    - Create folder structure: `/src/components`, `/src/pages`, `/src/services`, `/src/store`, `/src/hooks`
    - _Requirements: 10.1, 10.2_

- [ ] 2. Set up database connection and configuration
  - [ ] 2.1 Configure Sequelize connection to Neon DB
    - Create `/src/config/database.js` with Sequelize instance
    - Configure connection using environment variables (DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, DB_PORT)
    - Set up SSL configuration for Neon DB connection
    - Add connection test function and error handling
    - Create `.env.example` file with required environment variables
    - _Requirements: 8.5, 9.4_
  - [ ] 2.2 Create database initialization script
    - Create `/src/config/initDb.js` to sync models and create tables
    - Add function to test database connection on server startup
    - Configure Sequelize logging for development environment
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 3. Implement database models for core e-commerce tables
  - [ ] 3.1 Create User model
    - Define `/src/models/User.js` with Sequelize model
    - Fields: id (UUID, PK), name (VARCHAR), email (VARCHAR, unique), passwordHash (VARCHAR), role (ENUM: user/admin), createdAt, updatedAt
    - Add email validation and unique constraint
    - Add instance method for password comparison
    - _Requirements: 1.4, 8.5_
  - [ ] 3.2 Create Brand model
    - Define `/src/models/Brand.js` with Sequelize model
    - Fields: id (UUID, PK), name (VARCHAR), logoUrl (VARCHAR), createdAt, updatedAt
    - _Requirements: 2.1, 8.5_
  - [ ] 3.3 Create Product model
    - Define `/src/models/Product.js` with Sequelize model
    - Fields: id (UUID, PK), brandId (UUID, FK), name (VARCHAR), description (TEXT), basePrice (DECIMAL), category (VARCHAR), imageUrl (VARCHAR), createdAt, updatedAt
    - Define belongsTo relationship with Brand model
    - _Requirements: 2.2, 8.5_
  - [ ] 3.4 Create ProductVariant model
    - Define `/src/models/ProductVariant.js` with Sequelize model
    - Fields: id (UUID, PK), productId (UUID, FK), size (VARCHAR), color (VARCHAR), stock (INTEGER), sku (VARCHAR, unique), createdAt, updatedAt
    - Define belongsTo relationship with Product model
    - Add unique constraint on sku field
    - _Requirements: 2.3, 2.4, 8.5_
  - [ ] 3.5 Create Order model
    - Define `/src/models/Order.js` with Sequelize model
    - Fields: id (UUID, PK), userId (UUID, FK), totalPrice (DECIMAL), status (ENUM: pending/paid/shipped/delivered/cancelled), paymentId (VARCHAR), createdAt, updatedAt
    - Define belongsTo relationship with User model
    - _Requirements: 5.1, 5.4, 8.5_
  - [ ] 3.6 Create OrderItem model
    - Define `/src/models/OrderItem.js` with Sequelize model
    - Fields: id (UUID, PK), orderId (UUID, FK), variantId (UUID, FK), quantity (INTEGER), price (DECIMAL), createdAt, updatedAt
    - Define belongsTo relationships with Order and ProductVariant models
    - _Requirements: 5.2, 8.5_

- [ ] 4. Implement future-proofing database models
  - [ ] 4.1 Create ResaleListing model
    - Define `/src/models/ResaleListing.js` with Sequelize model
    - Fields: id (UUID, PK), sellerId (UUID, FK), productId (UUID, FK), condition (ENUM), price (DECIMAL), status (ENUM), verified (BOOLEAN), createdAt, updatedAt
    - Define relationships with User and Product models
    - Add comment indicating this is for future phase implementation
    - _Requirements: 8.1, 8.4_
  - [ ] 4.2 Create RecommendationsLog model
    - Define `/src/models/RecommendationsLog.js` with Sequelize model
    - Fields: id (UUID, PK), userId (UUID, FK), productId (UUID, FK), score (DECIMAL), createdAt
    - Define relationships with User and Product models
    - Add comment indicating this is for future phase implementation
    - _Requirements: 8.2, 8.4_
  - [ ] 4.3 Create PricingRule model
    - Define `/src/models/PricingRule.js` with Sequelize model
    - Fields: id (UUID, PK), productId (UUID, FK), demandScore (DECIMAL), dynamicPrice (DECIMAL), updatedAt
    - Define relationship with Product model
    - Add comment indicating this is for future phase implementation
    - _Requirements: 8.3, 8.4_
  - [ ] 4.4 Create model index file
    - Create `/src/models/index.js` to export all models
    - Import and initialize all model relationships
    - Export models object for use in services
    - _Requirements: 8.5_



- [ ] 6. Implement product service and routes
  - [ ] 6.1 Create ProductService class
    - Create `/src/services/ProductService.js`
    - Implement `getAllProducts(filters)` method with optional brandId and category filters
    - Implement `getProductById(productId)` method with eager loading of Brand and ProductVariants
    - Implement `getProductVariants(productId)` method to retrieve all variants for a product
    - Use Sequelize include to prevent N+1 queries
    - _Requirements: 3.1, 3.2, 3.3_
  - [ ] 6.2 Create product routes
    - Create `/src/routes/products.js` with Express router
    - Implement GET `/api/products` endpoint with query parameter support for brandId and category
    - Implement GET `/api/products/:id` endpoint to return product with brand and variants
    - Add request validation for UUID format on product ID parameter
    - Return 404 error when product not found
    - _Requirements: 3.1, 3.2, 3.4, 9.2, 9.4_

[ ] 7.1 Create OrderService class

Create /src/services/OrderService.js

Import the initialized Drizzle database instance and necessary operators (eq, desc, inArray, sql) from drizzle-orm.

Implement createOrder(userId, cartItems) method using Drizzle's db.transaction(async (tx) => { ... }). Inside the transaction: fetch variants to validate stock and calculate totalPrice, insert the orders record, and insert the order_items records.

Implement processPayment(orderId, paymentDetails) method using a transaction. It should simulate a mock payment gateway (like Razorpay/Stripe). On success, use tx.update() to change order status to "paid" and decrement the stock in product_variants using sql\stock - ${quantity}``.

Implement getUserOrders(userId) method using db.query.orders.findMany. Use with: { items: { with: { variant: true } } } for eager loading and orderBy: [desc(orders.createdAt)] for sorting.

Implement getOrderById(orderId, userId) method with an authorization check to ensure the order belongs to the requesting user.

[ ] 7.2 Create order routes

Create /src/routes/orders.js with Express router.

Import the Firebase Auth middleware created in Task 5 to protect all these routes.

Implement POST /api/orders endpoint. Validate that the request body contains an items array with variantId and quantity. Extract userId from the decoded Firebase req.user.

Implement POST /api/orders/:id/payment endpoint to process the mock payment.

Implement GET /api/orders/user/:userId endpoint. Add middleware logic to ensure req.user.uid (or your internal DB ID) matches the requested :userId param to prevent users from fetching others' histories.

- [ ] 8.1 Set up Express application

Update /server.js (or create /src/app.js) to configure Express middleware.

Add express.json() middleware for JSON requests.

Configure cors with allowed origins from the environment variable.

Set up a global error handling middleware (err, req, res, next) to catch and format API errors consistently.

[ ] 8.2 Register API routes

Import and mount auth routes at /api/auth.

Import and mount product routes at /api/products.

Import and mount order routes at /api/orders.

Add a 404 handler middleware for undefined routes.

[ ] 8.3 Create server startup script

CRITICAL CHANGE: Remove all Sequelize db.sync() logic.

Instead, perform a lightweight Drizzle ping (e.g., SELECT 1) to verify the Neon DB connection on startup.

Start the Express server on process.env.PORT (default 5000).

Task 9: Implement Frontend API Client and React Query Setup (Firebase Auth Adapted)
[ ] 9.1 Create Axios API client

Create /src/services/api.js with an Axios instance.

Configure the base URL from import.meta.env.VITE_API_URL (Vite's environment variable syntax).

CRITICAL CHANGE: Add an async request interceptor to fetch the current ID token directly from Firebase (auth.currentUser?.getIdToken()) instead of localStorage.

Add a response interceptor to handle 401 errors (e.g., trigger a Firebase logout or redirect).

[ ] 9.2 Create React Query configuration

Create /src/config/queryClient.js with a QueryClient instance.

Configure default options for queries (staleTime, gcTime, retry).

Provide instructions to wrap the App component with QueryClientProvider in main.jsx.

[ ] 9.3 Create API service functions

CRITICAL CHANGE: Create /src/services/authService.js with a syncUserWithBackend() function instead of standard register/login.

Create /src/services/productService.js with getProducts and getProductById functions.

Create /src/services/orderService.js with createOrder, processPayment, and getUserOrders functions.

Ensure all functions use the configured Axios client and return promises.

Task 10: Implement Zustand Store for Cart and Auth Management (Firebase Adapted)
[ ] 10.1 Create cart store

Create /src/store/cartStore.js using Zustand.

Define state: items array with structure { variantId, productId, productName, size, color, price, quantity, stock, imageUrl }.

Implement addItem action (if item exists, increase quantity; otherwise, add to array).

Implement updateQuantity action with basic stock limit validation.

Implement removeItem and clearCart actions.

Implement derived state/selectors for totalPrice and itemCount.

Wrap the store in Zustand's persist middleware to save the cart to localStorage.

[ ] 10.2 Create auth store (Firebase Integrated)

Create /src/store/authStore.js using Zustand.

CRITICAL CHANGE: Remove manual JWT/localStorage management for auth.

Define state: user (the profile from Neon DB), firebaseUser (the raw Firebase auth object), isAuthenticated (boolean), and isLoading (boolean).

Implement setAuth action to synchronize the store with Firebase's onAuthStateChanged listener.

Implement clearAuth action to wipe the user state upon Firebase logout.

-Redefined Task 11: Implement Authentication UI Components (Firebase Adapted)
[ ] 11.1 Create Login page

Create /src/pages/LoginPage.jsx.

Add form fields for email and password with Tailwind styling (Maroon, White, Beige theme).

CRITICAL CHANGE: Use Firebase's signInWithEmailAndPassword for email login, and add a signInWithPopup button for Google Sign-In.

Use a React Query mutation to call authService.syncUserWithBackend() immediately after Firebase authenticates the user.

Redirect to the home page on success.

[ ] 11.2 Create Register page

Create /src/pages/RegisterPage.jsx.

Add form fields for name, email, and password.

CRITICAL CHANGE: Use Firebase's createUserWithEmailAndPassword.

Update the Firebase user's profile with their display name using updateProfile.

Call authService.syncUserWithBackend() to create their record in Neon DB.

Redirect to the home page on success.

[ ] 11.3 Create ProtectedRoute component

Create /src/components/ProtectedRoute.jsx.

Pull isAuthenticated and isAuthLoading from the Zustand authStore.

CRITICAL CHANGE: Return a loading spinner while isAuthLoading is true (since Firebase takes a millisecond to verify the session on reload).

Redirect to the login page if isAuthenticated is false. Render children if true.

Redefined Task 12: Implement Product Catalog UI Components (Drizzle Data Adapted)
[ ] 12.1 Create ProductCard component

Create /src/components/ProductCard.jsx.

Expect a product prop matching the Drizzle output (nested brand object).

Display product.imageUrl, product.name, product.brand.name, and product.basePrice.

Style with Tailwind using the KIXX theme (White, Beige, Maroon accents). Add hover effects and an onClick navigation to /product/:id.

[ ] 12.2 Create HomePage with product grid

Create /src/pages/HomePage.jsx.

Use TanStack React Query (useQuery) calling productService.getProducts().

Create basic state for brandFilter and categoryFilter.

Map the data to ProductCard components in a responsive Tailwind grid (grid-cols-1 md:grid-cols-3 lg:grid-cols-4).

Handle loading and empty states cleanly.

[ ] 12.3 Create VariantSelector component

Create /src/components/VariantSelector.jsx.

Accept variants array (from the Drizzle backend) and onVariantSelect callback.

Implement dropdowns or toggle buttons for size and color.

Dynamically display the stock of the currently selected combination.

[ ] 12.4 Create ProductDetailPage

Create /src/pages/ProductDetailPage.jsx.

Use useQuery calling productService.getProductById(id) based on the URL param.

Render the VariantSelector.

Import the Zustand useCartStore.

Implement the "Add to Cart" button: Validate stock, trigger addItem({ ...product, variantId: selected.id, quantity: 1 }), and show a success/error toast or message.

Redefined Task 13: Implement Shopping Cart UI Components (Zustand Integrated)
[ ] 13.1 Create CartItem component

Create /src/components/CartItem.jsx.

Accept an item object as a prop (containing variantId, productName, size, color, price, quantity, stock, imageUrl).

Display the product image, name, size, color, and individual price.

Implement quantity input with + and - buttons. Disable the + button if quantity >= stock.

Call the Zustand store's updateQuantity(variantId, newQuantity) action on change.

Implement a remove button (trash icon) that calls removeItem(variantId).

Display the item subtotal (price * quantity).

[ ] 13.2 Create CartPage

Create /src/pages/CartPage.jsx.

Connect to the Zustand store to pull items, getTotalPrice, and getItemCount.

Handle the empty state: Display a friendly message and a "Continue Shopping" button navigating to / or /products.

Handle the populated state: Render a list/grid of CartItem components on the left, and an "Order Summary" card on the right.

Display the total price dynamically.

Add a "Proceed to Checkout" button (Maroon) that navigates to /checkout. Disable it if the cart is empty.


- Redefined Task 14: Implement Checkout and Order UI Components (Firebase & Drizzle Adapted)
[ ] 14.1 Create CheckoutPage

Create /src/pages/CheckoutPage.jsx.

Assume this page is rendered inside the ProtectedRoute component.

Display an order summary pulling from the Zustand cartStore.

Create a mock payment form (Card Number, Expiry, CVV).

Use React Query useMutation to sequentially call orderService.createOrder(cartItems) and then orderService.processPayment(orderId, paymentDetails).

On success: Call clearCart() from Zustand and use Maps to redirect to /order-confirmation/:id.

Display loading spinners during the transaction.

[ ] 14.2 Create OrderConfirmationPage

Create /src/pages/OrderConfirmationPage.jsx.

Extract the order ID from the URL (useParams).

Use useQuery to fetch orderService.getOrderById(id).

Display a success graphic, the orderId, status, and totalPrice.

Provide "View Order History" and "Continue Shopping" buttons.

[ ] 14.3 Create OrderHistoryPage

Create /src/pages/OrderHistoryPage.jsx.

Pull the user.id from the Zustand authStore.

Use useQuery to fetch orderService.getUserOrders(userId).

Map through the returned orders (expecting Drizzle's nested JSON structure) and display a summary card for each.

Link each card to the OrderDetailPage.

[ ] 14.4 Create OrderDetailPage

Create /src/pages/OrderDetailPage.jsx.

Use useQuery to fetch orderService.getOrderById(id).

Display the complete order metadata (date, status, total).

Map through order.items to display individual line items, safely accessing nested variant/product data.


- [ ] Redefined Task 15: Implement Navigation and Layout Components (Firebase Adapted)
[ ] 15.1 Create Navbar component

Create /src/components/Navbar.jsx.

Display KIXX brand with a link to /.

Connect to Zustand cartStore to get the getItemCount and display a dynamic badge over a Shopping Cart icon.

Connect to Zustand authStore to get isAuthenticated and user.

CRITICAL CHANGE: The Logout button must call Firebase's signOut(auth) first, and upon success, call the Zustand clearAuth() action.

Display "Orders" link and a User Menu if authenticated; otherwise, display Login/Register buttons.

Style with the Maroon, White, and Beige Tailwind theme.

[ ] 15.2 Create App routing structure

Update /src/App.jsx.

Wrap the application in React Router v6 (BrowserRouter).

CRITICAL CHANGE: Implement a useEffect block containing Firebase's onAuthStateChanged listener. When the app loads, this listener will detect the active Firebase session and update the Zustand authStore accordingly.

Define the route map, protecting the Checkout and Order pages with the ProtectedRoute component from Task 11.

Ensure the Navbar sits outside the <Routes> so it renders on every page.


- [ ] [ ] 16.1 Create seed data script

Create /src/scripts/seed.js.

Load environment variables using dotenv so it can access DATABASE_URL.

Import the initialized Drizzle database instance and your schema definitions.

Implement a clean-up step: Delete existing data in reverse relational order (Variants -> Products -> Brands -> Users) to prevent foreign key constraint errors during repeatable seeds.

Insert sample Brands (Nike, Adidas, Puma, New Balance) using db.insert().values().returning() to capture their generated IDs.

Use those generated Brand IDs to insert sample Products (with descriptions and base prices).

Use the generated Product IDs to insert multiple Variants (size, color, realistic stock quantities).

Insert an Admin user account directly into the database (e.g., admin@kixx.com with role admin) so the profile exists when you log in via Firebase.

Add a script command to package.json: "seed": "node src/scripts/seed.js".

- [ ] task 17: Configure Environment Variables and Documentation (Drizzle & Firebase Adapted)
[ ] 17.1 Create environment configuration files

Create backend .env.example replacing old DB fields with a single DATABASE_URL for Neon DB. Replace JWT_SECRET with Firebase Admin credentials (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).

Create frontend .env.example with VITE_API_URL and the standard Firebase Client configuration variables (API Key, Auth Domain, etc.).

Ensure .gitignore ignores the real .env files in both directories.

[ ] 17.2 Create README documentation

Create backend README.md. It must document the Modular Monolith architecture, how to generate the Firebase Service Account JSON, how to push the Drizzle schema (npx drizzle-kit push), and how to run the seed script (npm run seed). Include an API endpoint summary.

Create frontend README.md. Document the React + Vite setup, Tailwind CSS theme, Zustand global state, and how to configure the Firebase client.

Document the core database schema (Users, Brands, Products, Product Variants, Orders, Order Items) .

- [ ]   task 18: Implement Error Handling and Validation (Firebase & Drizzle Adapted)
[ ] 18.1 Create validation middleware (Backend)

Create /src/middleware/validation.js.

CRITICAL CHANGE: Remove password/email validation.

Implement a validateUUID middleware to check req.params.id before it hits Drizzle (preventing database crash errors).

Implement a validateOrderPayload middleware to ensure req.body.items is a valid array with variantId and quantity before attempting a transaction.

[ ] 18.2 Add comprehensive error handling (Backend)

Create a utility /src/utils/asyncHandler.js to wrap route controllers. This eliminates the need to write try-catch blocks in every single route.

Create a global error handler in /src/middleware/errorHandler.js.

Map specific errors to HTTP codes (e.g., Firebase Token Expired -> 401, Drizzle Record Not Found -> 404, Generic -> 500).

Format all responses consistently as { error: true, message: "..." }.

[ ] 18.3 Implement frontend error boundaries & notifications

Install a lightweight toast library like react-hot-toast or sonner.

Update the React frontend (App.jsx or main.jsx) to include the <Toaster /> component.

Create a global Axios response interceptor that automatically triggers a red error toast if an API request returns a 400 or 500-level error.

Display green success toasts for actions like "Added to Cart" or "Payment Successful".
