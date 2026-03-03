import { create } from 'zustand';

const useAuthStore = create((set) => ({
    user: null,
    firebaseUser: null,
    isAuthenticated: false,
    isAuthLoading: true,

    setAuth: (firebaseUser, dbUser) => set({
        user: dbUser,
        firebaseUser: firebaseUser,
        isAuthenticated: !!firebaseUser,
        isAuthLoading: false,
    }),

    clearAuth: () => set({
        user: null,
        firebaseUser: null,
        isAuthenticated: false,
        isAuthLoading: false,
    }),

    setAuthLoading: (isLoading) => set({
        isAuthLoading: isLoading,
    }),
}));

export default useAuthStore;
