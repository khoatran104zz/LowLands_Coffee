import { create } from "zustand";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  
  // Actions
  hydrateFromStorage: () => void;
  login: (user: User, token: string, refreshToken?: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  hasHydrated: false,

  hydrateFromStorage: () => {
    if (typeof window === "undefined") {
      return;
    }

    const token = localStorage.getItem("lowlands_token");
    const savedUser = localStorage.getItem("lowlands_user");
    let user: User | null = null;

    if (savedUser) {
      try {
        user = JSON.parse(savedUser) as User;
      } catch {
        localStorage.removeItem("lowlands_user");
      }
    }

    set({ user, token, isAuthenticated: Boolean(token), hasHydrated: true });
  },

  login: (user, token, refreshToken) => {
    // Save to local storage for persistence
    if (typeof window !== "undefined") {
      localStorage.setItem("lowlands_token", token);
      if (refreshToken) {
        localStorage.setItem("lowlands_refresh_token", refreshToken);
      }
      localStorage.setItem("lowlands_user", JSON.stringify(user));
    }
    set({ user, token, isAuthenticated: true, hasHydrated: true });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("lowlands_token");
      localStorage.removeItem("lowlands_refresh_token");
      localStorage.removeItem("lowlands_user");
    }
    set({ user: null, token: null, isAuthenticated: false, hasHydrated: true });
  },

  updateUser: (user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("lowlands_user", JSON.stringify(user));
    }
    set({ user });
  },
}));
