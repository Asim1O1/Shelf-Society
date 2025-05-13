// src/stores/useAuthStore.js
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import axiosInstance, { setRefreshTokenFunction } from "../utils/axiosInstance";

// Helper to check token expiration
function isTokenExpired(token) {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 < Date.now(); // true if expired
  } catch (err) {
    return true; // consider invalid token as expired
  }
}

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: localStorage.getItem("accessToken") || null,
      refreshToken: localStorage.getItem("refreshToken") || null,
      isAuthenticated: !!localStorage.getItem("accessToken"),
      isLoading: false,
      error: null,

      // Initialize the store
      init: async () => {
        setRefreshTokenFunction(get().refreshAccessToken); // required for axios interceptor

        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken || isTokenExpired(accessToken)) {
          console.log(
            "Access token missing or expired. Attempting to refresh..."
          );
          const success = await get().refreshAccessToken();
          if (!success) {
            console.log("Token refresh failed. Logging out.");
            get().logout();
          } else {
            console.log("Token refreshed successfully.");
            set({ isAuthenticated: true });
          }
        } else {
          // Access token is valid, decode and set user
          try {
            const decoded = jwtDecode(accessToken);
            set({
              user: {
                email: decoded.email,
                fullName: decoded.fullName,
                role: decoded.role,
                userId: decoded.userId,
              },
              isAuthenticated: true,
            });
          } catch (e) {
            console.log("Invalid token decoding failed. Logging out.");
            get().logout();
          }
        }
      },

      // Register
      register: async (userData) => {
        console.log("Registering user with data:", userData);
        set({ isLoading: true, error: null });
        try {
          const response = await axiosInstance.post("/auth/register", {
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            password: userData.password,
            confirmPassword: userData.confirmPassword,
          });

          set({ isLoading: false });

          if (response.data.success) {
            return { success: true, message: response.data.message };
          } else {
            set({ error: response.data.message });
            return { success: false, message: response.data.message };
          }
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || "Registration failed";
          set({ error: errorMessage, isLoading: false });
          return { success: false, message: errorMessage };
        }
      },

      // Login
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axiosInstance.post("/auth/login", {
            email: credentials.email,
            password: credentials.password,
          });

          if (response.data.success) {
            const { data } = response.data;

            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);

            set({
              user: {
                email: data.email,
                fullName: data.fullName,
                role: data.role,
                userId: data.userId,
              },
              token: data.accessToken,
              refreshToken: data.refreshToken,
              isAuthenticated: true,
              isLoading: false,
            });

            return { success: true, message: response.data.message };
          } else {
            set({ error: response.data.message, isLoading: false });
            return { success: false, message: response.data.message };
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || "Login failed";
          set({ error: errorMessage, isLoading: false });
          return { success: false, message: errorMessage };
        }
      },

      // Refresh Token
      refreshAccessToken: async () => {
        try {
          const refreshToken = localStorage.getItem("refreshToken");
          if (!refreshToken) {
            get().logout();
            return false;
          }

          const response = await axios.post(
            `${axiosInstance.defaults.baseURL}/auth/refresh`,
            { refreshToken }
          );

          if (response.data.success) {
            const { data } = response.data;

            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);

            set({
              user: {
                email: data.email,
                fullName: data.fullName,
                role: data.role,
                userId: data.userId,
              },
              token: data.accessToken,
              refreshToken: data.refreshToken,
            });

            return true;
          } else {
            get().logout();
            return false;
          }
        } catch (error) {
          console.error("Error refreshing token:", error);
          get().logout();
          return false;
        }
      },

      // Logout
      logout: () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Get token
      getToken: () => {
        return get().token;
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Initialize store on module load
const initAuth = () => {
  const authStore = useAuthStore.getState();
  authStore.init();
};

initAuth();

export default useAuthStore;
