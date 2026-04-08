import { create } from 'zustand';

const useAuthStore = create((set) => ({
    user: null,
    userRole: null,
    firebaseUser: null,
    isAuthenticated: false,
    isAuthLoading: true,

    setAuth: (firebaseUser, dbUser) => set({
        user: dbUser,
        userRole: dbUser?.role || null,
        firebaseUser: firebaseUser,
        firebaseUser: firebaseUser,
        isAuthenticated: !!firebaseUser,
    }),

    clearAuth: () => set({
        user: null,
        userRole: null,
        firebaseUser: null,
        firebaseUser: null,
        isAuthenticated: false,
    }),

    setAuthLoading: (isLoading) => set({
        isAuthLoading: isLoading,
    }),
}));

export default useAuthStore;
