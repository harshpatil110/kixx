# Admin Dashboard Expansion Epic

## Task 1: Real-Time Inventory Management (`/admin/inventory`)
**Objective:** Build a data table to monitor and update shoe stock levels directly from the database.
* **Backend:** * Create `GET /api/admin/inventory` to fetch all products with their current stock levels.
  * Create `PUT /api/admin/inventory/:id` to allow the admin to manually update the stock number (e.g., after a physical restock).
* **Frontend:** * Build the `InventoryPage.jsx` component.
  * Render a data grid displaying: Image, Product Name, Category, Price, and Stock Count.
  * Implement dynamic status badges (Green "In Stock" for > 10, Yellow "Low Stock" for < 10, Red "Out of Stock" for 0).
  * Add an "Edit" button to update stock quantities.

## Task 2: Live Sales & Order Ledger (`/admin/sales`)
**Objective:** Create a comprehensive ledger of all transactions processed through the checkout engine.
* **Backend:** * Create `GET /api/admin/orders` to fetch the complete history from the `past_orders` table, joining user data and product details.
* **Frontend:** * Build the `SalesPage.jsx` component.
  * Render a data table displaying: Order ID (truncated), Date, Customer Email, Total Amount, and Payment Status (Mocked as "Paid").
  * Add sorting capabilities (e.g., sort by newest first, or highest amount).

## Task 3: Customer Directory (`/admin/customers`)
**Objective:** Provide a CRM-style view of registered users and their purchasing value.
* **Backend:** * Create `GET /api/admin/customers` to fetch all users where `role === 'customer'`.
  * *Advanced:* Aggregate data to calculate "Lifetime Value" (total spent) and "Total Orders" for each user.
* **Frontend:** * Build the `CustomersPage.jsx` component.
  * Render a table displaying: Email, Join Date, Total Orders, and Lifetime Value.

## Task 4: Admin Settings (`/admin/settings`)
**Objective:** Provide a control center for store-wide preferences and admin account management.
* **Backend:** * (Optional) Create endpoint to update admin profile details or store metadata.
* **Frontend:** * Build the `SettingsPage.jsx` component.
  * Build a UI containing sections for "Account Settings" (Update email/password) and "Store Preferences" (e.g., a toggle for "Maintenance Mode" or updating contact email).
  * *Constraint Reminder:* Ensure UI adheres to the strict "No Dark Mode" / warm editorial aesthetic of the primary app.