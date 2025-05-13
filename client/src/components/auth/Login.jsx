"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";
import ToastUtility from "../../utils/ToastUtility";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      ToastUtility.error("Please enter both email and password");
      return;
    }

    try {
      // Attempt to login using the auth store
      const result = await login({ email, password });

      if (result.success) {
        ToastUtility.success("Successfully logged in!");

        // Navigate after a short delay to let the user see the success message
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        ToastUtility.error(result.message);
      }
    } catch (error) {
      // Handle connection errors
      if (
        error.message.includes("Connection refused") ||
        error.message.includes("Network Error")
      ) {
        ToastUtility.error(
          "Cannot connect to the server. Please check if the backend is running."
        );
      } else {
        ToastUtility.error(error.message || "Login failed. Please try again.");
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
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">
        {/* Left Column - Login Form */}
        <div className="w-full md:w-1/2 p-6 md:p-8">
          <div className="max-w-md mx-auto">
            {/* Logo */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-red-600">Shelf Society</h2>
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-2">Sign in</h1>
            <p className="text-gray-600 mb-8">
              Welcome back! Please enter your details.
            </p>

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
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
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
                    className="text-sm text-red-600 hover:text-red-800 transition-colors duration-200"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label
                    htmlFor="remember-me"
                    className="block ml-2 text-sm text-gray-700"
                  >
                    Remember for 30 days
                  </label>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full py-3 font-medium text-white bg-red-600 rounded-lg transition-all duration-300 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-red-300 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="w-5 h-5 mr-3 animate-spin"
                      viewBox="0 0 24 24"
                    >
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
                  className="font-medium text-red-600 cursor-pointer transition-colors duration-200 hover:text-red-800 hover:underline"
                  onClick={() => navigate("/register")}
                >
                  Create Account
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Promotional Content */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-red-500 to-red-700 p-12 items-center justify-center">
          <div className="max-w-lg text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Welcome back!
            </h2>
            <h3 className="text-3xl font-bold text-white mb-8">
              Please sign in to your
              <br />
              <span className="font-extrabold">Shelf Society</span> account
            </h3>
            <p className="text-white/80 mb-12 text-lg">
              Discover and organize your collection of books with ease. Track
              your reading progress and join the community of book lovers.
            </p>

            {/* Mock Book Stats Graphic */}
            <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
              <div className="text-white text-lg font-medium mb-4">
                Reading Stats
              </div>
              <div className="flex justify-between items-end h-40 mb-2">
                {[60, 40, 80, 30, 50, 70, 45, 55, 65, 75].map(
                  (height, index) => (
                    <div key={index} className="w-6 flex flex-col items-center">
                      <div
                        className="rounded-t w-full bg-white/20"
                        style={{ height: `${height}%` }}
                      ></div>
                      <div
                        className="rounded-t w-full bg-red-400"
                        style={{ height: `${height / 2}%` }}
                      ></div>
                    </div>
                  )
                )}
              </div>
              <div className="flex justify-between text-white/70 text-xs">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
                <span>Oct</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
