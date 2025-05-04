"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";
import showToast from "../utils/ToastUtility";

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

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200">
                  <svg
                    className="w-5 h-5 mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z"
                      fill="#FFC107"
                    />
                    <path
                      d="M3.15302 7.3455L6.43852 9.755C7.32752 7.554 9.48052 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C8.15902 2 4.82802 4.1685 3.15302 7.3455Z"
                      fill="#FF3D00"
                    />
                    <path
                      d="M12 22C14.583 22 16.93 21.0115 18.7045 19.404L15.6095 16.785C14.5718 17.5742 13.3038 18.001 12 18C9.39897 18 7.19047 16.3415 6.35847 14.027L3.09747 16.5395C4.75247 19.778 8.11347 22 12 22Z"
                      fill="#4CAF50"
                    />
                    <path
                      d="M21.8055 10.0415H21V10H12V14H17.6515C17.2571 15.1082 16.5467 16.0766 15.608 16.7855L15.6095 16.785L18.7045 19.404C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z"
                      fill="#1976D2"
                    />
                  </svg>
                  Google
                </button>
                <button className="flex items-center justify-center py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200">
                  <svg
                    className="w-5 h-5 mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.9999 2.00001C6.47774 2.00001 1.99994 6.47781 1.99994 12C1.99994 16.4183 4.86866 20.1665 8.83991 21.489C9.33991 21.5807 9.49991 21.272 9.49991 21.007C9.49991 20.7695 9.49157 20.1143 9.48723 19.2632C6.67158 19.8752 6.07158 17.8695 6.07158 17.8695C5.60408 16.7957 4.93158 16.4882 4.93158 16.4882C4.02408 15.8932 5.00158 15.9057 5.00158 15.9057C5.99991 15.9807 6.53991 16.9195 6.53991 16.9195C7.44991 18.4332 8.87841 17.9182 9.51991 17.6632C9.61156 17.0507 9.86991 16.6357 10.1541 16.4182C7.89991 16.2007 5.53156 15.3432 5.53156 11.4745C5.53156 10.387 5.91991 9.49201 6.55991 8.79201C6.44991 8.53826 6.12156 7.50826 6.65991 6.13701C6.65991 6.13701 7.51991 5.87451 9.47158 7.16626C10.2874 6.94876 11.1466 6.83626 12.0016 6.83201C12.8566 6.83626 13.7141 6.94876 14.5316 7.16626C16.4816 5.87451 17.3391 6.13701 17.3391 6.13701C17.8791 7.50826 17.5516 8.53826 17.4416 8.79201C18.0816 9.49201 18.4691 10.387 18.4691 11.4745C18.4691 15.3557 16.0966 16.1982 13.8341 16.4107C14.1891 16.6757 14.5066 17.2057 14.5066 18.0132C14.5066 19.1645 14.4924 20.6807 14.4924 21.007C14.4924 21.272 14.6474 21.582 15.1574 21.4882C19.1391 20.1645 21.9999 16.4182 21.9999 12C21.9999 6.47781 17.5221 2.00001 11.9999 2.00001Z"
                      fill="currentColor"
                    />
                  </svg>
                  GitHub
                </button>
              </div>
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
