import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: localStorage.getItem("accessToken") || null,
  isLoading: true,

  setAuth: (user, accessToken) => {
    localStorage.setItem("accessToken", accessToken);
    set({ user, accessToken, isLoading: false });
  },

  clearAuth: () => {
    localStorage.removeItem("accessToken");
    set({ user: null, accessToken: null, isLoading: false });
  },

  setLoading: (isLoading) => set({ isLoading }),
  setUser: (user) => set({ user }),
}));