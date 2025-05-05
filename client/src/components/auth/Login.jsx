import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";
import showToast from "../../utils/ToastUtility";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Get auth store actions and state
  const { login, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async () => {
    // Form validation
    if (!email || !password) {
      showToast.error("Please enter both email and password");
      return;
    }

    try {
      // Attempt to login using the auth store
      const result = await login({ email, password });

      if (result.success) {
        showToast.success("Successfully logged in!");

        // Navigate after a short delay to let the user see the success message
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        showToast.error(result.message);
      }
    } catch (error) {
      // Handle connection errors
      if (
        error.message.includes("Connection refused") ||
        error.message.includes("Network Error")
      ) {
        showToast.error(
          "Cannot connect to the server. Please check if the backend is running."
        );
      } else {
        showToast.error(error.message || "Login failed. Please try again.");
      }
    }
  };

  // Clear any previous errors when component mounts or unmounts
  React.useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-md p-8 mx-4 bg-white rounded-lg shadow-md">
        <h1 className="mb-8 text-2xl font-bold text-center text-gray-800">
          Welcome Back
        </h1>

        <div>
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full py-3 mt-6 font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:bg-red-300 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>

          <div className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <span
              className="font-medium text-red-500 cursor-pointer hover:underline"
              onClick={() => navigate("/register")}
            >
              Sign Up
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
