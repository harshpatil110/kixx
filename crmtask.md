# 🗺️ The "First Drop Credit" Implementation Plan

## Phase 1: The Database & Backend Lockdown (The Security Layer)
*Before we show the user a discount, your server needs to know how to validate it and prevent abuse.*

- [ ] **Update the Schema:** Add a `first_purchase_discount_used` (boolean, default: `false`) column to your `users` table in Drizzle.
- [ ] **Update the Checkout Controller:** Modify your order-processing API route so that if it receives a promo code (e.g., `FIRSTDROP`), it checks the database to ensure the user is eligible.
- [ ] **The "Flip":** Add logic so that the moment the database successfully saves the order, it flips that user's boolean to `true`, permanently locking them out of using the code again.

---

## Phase 2: The Lead Magnet UI (The Hook)
*We need to capture the user's attention and their email address.*

- [ ] **Create the Pop-up/Banner:** Build a premium, minimalist React component that offers "The First Drop Credit" (10% off).
- [ ] **Capture State:** Add logic to only show this to logged-out users or users who haven't dismissed it, storing their email in your database (or local storage for now) and revealing the promo code to them on the screen.

---

## Phase 3: The Cart & Checkout Logic (The Frontend Math)
*This is where the user actually applies the code and sees the numbers change.*

- [ ] **The Input Field:** Add a sleek "Add Promo Code" input box to your Cart or Checkout summary page.
- [ ] **Real-time Calculation:** Write a React state function that listens for the code `FIRSTDROP`. When applied, it calculates 10% of the cart total, subtracts it, and displays a new "Discount Applied" line item in the price breakdown.
- [ ] **The Handshake:** Update the frontend API call so it passes the applied promo code to the backend checkout controller (from Phase 1) when the user clicks "Verify & Pay."