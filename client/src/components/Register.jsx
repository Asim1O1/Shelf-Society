import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";
import ToastUtility from "../utils/ToastUtility";

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Get auth store actions and state
  const { register, isLoading, error, clearError } = useAuthStore();

  // Clear any previous errors when component mounts or unmounts
  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  const handleSubmit = async () => {
    try {
      // Form validation
      if (!email || !firstName || !lastName || !password || !confirmPassword) {
        ToastUtility.error("Please fill in all fields");
        return;
      }

      if (password !== confirmPassword) {
        ToastUtility.error("Passwords do not match");
        return;
      }

      // Password strength validation
      if (password.length < 8) {
        ToastUtility.error("Password must be at least 8 characters long");
        return;
      }

      // Attempt to register using the auth store
      const result = await register({
        email,
        firstName,
        lastName,
        password,
        confirmPassword,
      });

      if (result.success) {
        ToastUtility.success("Account created successfully! Please log in.");

        // Navigate to login page after successful registration
        setTimeout(() => {
          navigate("/login");
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
        ToastUtility.error(
          error.message || "Registration failed. Please try again."
        );
      }
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (password.length === 0) return { width: "0%", color: "bg-gray-200" };
    if (password.length < 6) return { width: "33%", color: "bg-red-500" };
    if (password.length < 10) return { width: "66%", color: "bg-yellow-500" };
    return { width: "100%", color: "bg-green-500" };
  };

  const strength = getPasswordStrength();

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">
        {/* Left Column - Registration Form */}
        <div className="w-full md:w-1/2 p-6 md:p-8">
          <div className="max-w-md mx-auto">
            {/* Logo */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-red-600">Shelf Society</h2>
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Create Account
            </h1>
            <p className="text-gray-600 mb-6">
              Join our community of book lovers today
            </p>

            <div className="space-y-5">
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
                  placeholder="yourname@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocus(true)}
                    onBlur={() => setPasswordFocus(false)}
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

                {/* Password strength meter */}
                {(passwordFocus || password.length > 0) && (
                  <div className="mt-2">
                    <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strength.color} transition-all duration-300`}
                        style={{ width: strength.width }}
                      ></div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {password.length === 0 && "Enter a password"}
                      {password.length > 0 &&
                        password.length < 6 &&
                        "Weak password"}
                      {password.length >= 6 &&
                        password.length < 10 &&
                        "Moderate password"}
                      {password.length >= 10 && "Strong password"}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
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
                {password && confirmPassword && (
                  <p
                    className={`mt-1 text-xs ${
                      password === confirmPassword
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {password === confirmPassword
                      ? "Passwords match"
                      : "Passwords do not match"}
                  </p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  type="checkbox"
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-red-600 hover:text-red-800 transition-colors duration-200"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-red-600 hover:text-red-800 transition-colors duration-200"
                  >
                    Privacy Policy
                  </a>
                </label>
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
                    Creating Account...
                  </div>
                ) : (
                  "Create Account"
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
                Already have an account?{" "}
                <span
                  className="font-medium text-red-600 cursor-pointer transition-colors duration-200 hover:text-red-800 hover:underline"
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Promotional Content */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-red-500 to-red-700 p-12 items-center justify-center">
          <div className="max-w-lg text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Join Shelf Society Today!
            </h2>
            <h3 className="text-3xl font-bold text-white mb-8">
              Create your personal
              <br />
              <span className="font-extrabold">library experience</span>
            </h3>
            <p className="text-white/80 mb-12 text-lg">
              Track your reading journey, discover new books, and connect with
              fellow book lovers. Your virtual bookshelf awaits!
            </p>

            {/* Book Collection Graphic */}
            <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
              <div className="text-white text-lg font-medium mb-4">
                Your Book Collection
              </div>
              <div className="grid grid-cols-5 gap-3 mb-4">
                {[...Array(10)].map((_, index) => (
                  <div
                    key={index}
                    className="aspect-[2/3] rounded-md"
                    style={{
                      backgroundColor: [
                        "#f87171",
                        "#fb923c",
                        "#fbbf24",
                        "#a3e635",
                        "#34d399",
                        "#22d3ee",
                        "#60a5fa",
                        "#a78bfa",
                        "#e879f9",
                        "#fb7185",
                      ][index % 10],
                      height: "80px",
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-between items-center mt-4">
                <div className="text-white text-sm">10 books in collection</div>
                <div className="bg-white/20 text-white text-sm px-3 py-1 rounded-full">
                  + Add Book
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
