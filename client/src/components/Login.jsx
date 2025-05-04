import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";
import showToast from "../utils/ToastUtility";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Get auth store actions and state
  const { login, isLoading, error, clearError } = useAuthStore();

  // Clear any previous errors when component mounts or unmounts
  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

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

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md p-10 mx-4 bg-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        <div className="space-y-6">
          <div>
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
              onKeyPress={handleKeyPress}
              placeholder="yourname@example.com"
              className="w-full px-4 py-3 transition-colors duration-200 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <a
                href="#"
                className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
              >
                Forgot password?
              </a>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="••••••••"
              className="w-full px-4 py-3 transition-colors duration-200 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label
              htmlFor="remember-me"
              className="block ml-2 text-sm text-gray-700"
            >
              Remember me
            </label>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full py-4 font-medium text-white bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-3 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing In...
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <span
              className="font-medium text-indigo-600 cursor-pointer transition-colors duration-200 hover:text-indigo-800 hover:underline"
              onClick={() => navigate("/register")}
            >
              Create Account
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
