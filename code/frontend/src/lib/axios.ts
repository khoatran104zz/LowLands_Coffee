import axios from "axios";
import { useAuthStore } from "@/store/auth.store";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach authentication token to header if available
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("lowlands_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle common error cases
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only force-logout on 401 (session expired/invalid token)
    // Do NOT redirect on 403 (permission denied) — let the page handle it gracefully
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        useAuthStore.getState().logout();
        const currentLocale = window.location.pathname.split("/")[1] || "vi";
        // If we are in a portal/admin/manager/staff route → portal login
        // Otherwise → customer login
        const isPortalRoute = window.location.pathname.includes("/admin") ||
          window.location.pathname.includes("/manager") ||
          window.location.pathname.includes("/staff") ||
          window.location.pathname.includes("/portal");
        const loginPath = isPortalRoute
          ? `/${currentLocale}/portal/login`
          : `/${currentLocale}/login`;
        window.location.href = loginPath;
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

