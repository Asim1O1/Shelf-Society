// src/stores/useAuthStore.js
import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import axiosInstance, { setRefreshTokenFunction } from "../utils/axiosInstance";

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
      init: () => {
        setRefreshTokenFunction(get().refreshAccessToken);
      },

      // Register action
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

      // Login action
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axiosInstance.post("/auth/login", {
            email: credentials.email,
            password: credentials.password,
          });

          if (response.data.success) {
            const { data } = response.data;

            // Store tokens
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

      // Refresh token action
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

            // Update tokens
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

      // Logout action
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

      // Clear any error
      clearError: () => set({ error: null }),

      // Get token function (moved inside the state object)
      getToken: () => {
        return get().token; // Returns the access token from the store
      },
    }),
    {
      name: "auth-storage", // unique name for localStorage
      // Only persist these fields
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Initialize the refresh token function when the module loads
const initAuth = () => {
  const authStore = useAuthStore.getState();
  authStore.init();
};

// Run the initialization
initAuth();

export default useAuthStore;
