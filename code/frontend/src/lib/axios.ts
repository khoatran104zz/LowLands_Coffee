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

// Response Interceptor: Handle common error cases (e.g. 401 Unauthorized, 403 Forbidden)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (typeof window !== "undefined") {
        useAuthStore.getState().logout();
        const currentLocale = window.location.pathname.split("/")[1] || "vi";
        window.location.href = `/${currentLocale}/login`;
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

