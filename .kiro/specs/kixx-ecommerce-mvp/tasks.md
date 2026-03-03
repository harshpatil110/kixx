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

- [ ] 13. Implement shopping cart UI components
  - [ ] 13.1 Create CartItem component
    - Create `/src/components/CartItem.jsx`
    - Display product name, size, color, price, and quantity
    - Implement quantity input with increment/decrement buttons
    - Call cart store updateQuantity action on quantity change
    - Implement remove button that calls cart store removeItem action
    - Display item subtotal (price * quantity)
    - _Requirements: 4.2, 4.3_
  - [ ] 13.2 Create CartPage
    - Create `/src/pages/CartPage.jsx`
    - Get cart items from cart store
    - Render CartItem component for each cart item
    - Display total price from cart store getTotalPrice selector
    - Display empty cart message when cart is empty
    - Add "Continue Shopping" button to navigate back to home
    - Add "Proceed to Checkout" button to navigate to checkout page
    - Disable checkout button when cart is empty
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 10.4_

- [ ] 14. Implement checkout and order UI components
  - [ ] 14.1 Create CheckoutPage
    - Create `/src/pages/CheckoutPage.jsx` (protected route)
    - Display order summary with cart items and total price
    - Create payment form with fields for payment method selection
    - Add mock payment details inputs (card number, expiry, CVV)
    - Implement form validation for payment fields
    - Use React Query mutation to call createOrder API with cart items
    - On successful order creation, call processPayment API with order ID
    - Clear cart using cart store clearCart action after successful payment
    - Display loading state during order processing
    - Redirect to order confirmation page with order ID on success
    - Display error message if order creation or payment fails
    - _Requirements: 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 10.5_
  - [ ] 14.2 Create OrderConfirmationPage
    - Create `/src/pages/OrderConfirmationPage.jsx` (protected route)
    - Get order ID from URL parameter
    - Use React Query to fetch order details
    - Display order ID, status, total price, and creation date
    - Display list of ordered items with product names, quantities, and prices
    - Add button to view full order history
    - Add button to continue shopping
    - _Requirements: 6.2, 7.2, 7.3_
  - [ ] 14.3 Create OrderHistoryPage
    - Create `/src/pages/OrderHistoryPage.jsx` (protected route)
    - Get user ID from auth store
    - Use React Query to fetch user's orders
    - Display orders in a list sorted by date (newest first)
    - Show order ID, date, status, and total price for each order
    - Add click handler to navigate to order detail page
    - Display empty state message when user has no orders
    - _Requirements: 7.1, 7.2, 7.5_
  - [ ] 14.4 Create OrderDetailPage
    - Create `/src/pages/OrderDetailPage.jsx` (protected route)
    - Get order ID from URL parameter
    - Use React Query to fetch order details
    - Display complete order information including status, total, and date
    - Display all order items with product details, quantities, and prices
    - Add button to return to order history
    - _Requirements: 7.3, 7.4_

- [ ] 15. Implement navigation and layout components
  - [ ] 15.1 Create Navbar component
    - Create `/src/components/Navbar.jsx`
    - Display KIXX logo/brand name with link to home page
    - Add navigation links for Home and Orders (show Orders only when authenticated)
    - Display cart icon with item count badge from cart store
    - Add user menu dropdown showing user name when authenticated
    - Include Logout button in user menu that calls auth store logout action
    - Display Login/Register buttons when not authenticated
    - Style with Tailwind CSS for responsive design
    - _Requirements: 10.1, 10.4_
  - [ ] 15.2 Create App routing structure
    - Update `/src/App.jsx` to set up React Router
    - Define routes: / (HomePage), /login (LoginPage), /register (RegisterPage), /products/:id (ProductDetailPage), /cart (CartPage), /checkout (CheckoutPage, protected), /orders (OrderHistoryPage, protected), /orders/:id (OrderDetailPage, protected), /order-confirmation/:id (OrderConfirmationPage, protected)
    - Wrap protected routes with ProtectedRoute component
    - Include Navbar component in layout
    - Initialize auth store on app mount to restore authentication state
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 16. Create database seed script for development
  - [ ] 16.1 Create seed data script
    - Create `/src/scripts/seedData.js`
    - Create sample brands (Nike, Adidas, Puma, New Balance)
    - Create sample products for each brand with descriptions and prices
    - Create multiple variants for each product with different sizes and colors
    - Set realistic stock quantities for variants
    - Create admin user account for testing
    - Add script command to package.json: `npm run seed`
    - _Requirements: 2.1, 2.2, 2.3_

- [ ] 17. Configure environment variables and documentation
  - [ ] 17.1 Create environment configuration files
    - Create backend `.env.example` with all required variables (DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, DB_PORT, JWT_SECRET, PORT, NODE_ENV)
    - Create frontend `.env.example` with API base URL (VITE_API_URL)
    - Add `.env` to `.gitignore` for both projects
    - _Requirements: 9.4_
  - [ ] 17.2 Create README documentation
    - Create backend `README.md` with setup instructions, environment variables, and API endpoint documentation
    - Create frontend `README.md` with setup instructions and available scripts
    - Document database schema and relationships
    - Include instructions for running seed script
    - _Requirements: 9.1, 9.2, 9.3_

- [ ] 18. Implement error handling and validation
  - [ ] 18.1 Create validation middleware
    - Create `/src/middleware/validation.js` with reusable validation chains
    - Define validation for email format, password strength, UUID format
    - Create validation error handler middleware
    - _Requirements: 9.4_
  - [ ] 18.2 Add comprehensive error handling
    - Update all route handlers to use try-catch blocks
    - Return appropriate HTTP status codes (400, 401, 403, 404, 500)
    - Format error responses consistently with error code and message
    - Log errors to console in development mode
    - _Requirements: 9.4, 9.5_
  - [ ] 18.3 Implement frontend error boundaries
    - Create error boundary component for React Query errors
    - Add toast notification system for displaying errors and success messages
    - Implement retry logic in React Query configuration
    - _Requirements: 10.1_
