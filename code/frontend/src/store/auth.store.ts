import { create } from "zustand";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  
  // Actions
  login: (user: User, token: string, refreshToken?: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: typeof window !== "undefined" && localStorage.getItem("lowlands_user")
    ? JSON.parse(localStorage.getItem("lowlands_user") as string)
    : null,
  token: typeof window !== "undefined" ? localStorage.getItem("lowlands_token") : null,
  isAuthenticated: typeof window !== "undefined" ? Boolean(localStorage.getItem("lowlands_token")) : false,

  login: (user, token, refreshToken) => {
    // Save to local storage for persistence
    if (typeof window !== "undefined") {
      localStorage.setItem("lowlands_token", token);
      if (refreshToken) {
        localStorage.setItem("lowlands_refresh_token", refreshToken);
      }
      localStorage.setItem("lowlands_user", JSON.stringify(user));
    }
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("lowlands_token");
      localStorage.removeItem("lowlands_refresh_token");
      localStorage.removeItem("lowlands_user");
    }
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("lowlands_user", JSON.stringify(user));
    }
    set({ user });
  },
}));
