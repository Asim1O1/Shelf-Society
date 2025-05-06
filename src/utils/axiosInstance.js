// src/services/axiosInstance.js
import axios from "axios";

const BASE_URL = "http://localhost:5009/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add a request interceptor to attach the token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Will be set up by the auth store
let refreshTokenFunction = null;

// Add a response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't already tried to refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      refreshTokenFunction
    ) {
      originalRequest._retry = true;

      try {
        // Use the refreshToken function from the auth store
        const success = await refreshTokenFunction();

        if (success) {
          // Get the new token
          const token = localStorage.getItem("token");
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error("Error refreshing token:", refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Function to set the refresh token handler
export const setRefreshTokenFunction = (refreshFn) => {
  refreshTokenFunction = refreshFn;
};

export default axiosInstance;
