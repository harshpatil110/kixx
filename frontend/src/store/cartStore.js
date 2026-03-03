import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],

            addItem: (newItem) => set((state) => {
                const existingItemIndex = state.items.findIndex((item) => item.variantId === newItem.variantId);

                if (existingItemIndex >= 0) {
                    const updatedItems = [...state.items];
                    const item = updatedItems[existingItemIndex];
                    const addAmount = newItem.quantity || 1;
                    const newQuantity = item.quantity + addAmount;

                    updatedItems[existingItemIndex] = {
                        ...item,
                        quantity: newQuantity > item.stock ? item.stock : newQuantity,
                    };

                    return { items: updatedItems };
                } else {
                    const quantity = newItem.quantity || 1;
                    // Ensure we don't exceed stock right away if they add a large initial quantity
                    const validQuantity = quantity > newItem.stock ? newItem.stock : quantity;
                    return { items: [...state.items, { ...newItem, quantity: validQuantity }] };
                }
            }),

            updateQuantity: (variantId, quantity) => set((state) => {
                return {
                    items: state.items.map((item) => {
                        if (item.variantId === variantId) {
                            const validQuantity = Math.max(1, Math.min(quantity, item.stock));
                            return { ...item, quantity: validQuantity };
                        }
                        return item;
                    }),
                };
            }),

            removeItem: (variantId) => set((state) => ({
                items: state.items.filter((item) => item.variantId !== variantId),
            })),

            clearCart: () => set({ items: [] }),

            getTotalPrice: () => {
                return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
            },

            getItemCount: () => {
                return get().items.reduce((count, item) => count + item.quantity, 0);
            },
        }),
        {
            name: 'kixx-cart-storage',
        }
    )
);

export default useCartStore;
