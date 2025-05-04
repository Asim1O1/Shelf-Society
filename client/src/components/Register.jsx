import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";
import showToast from "../utils/ToastUtility";

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordFocus, setPasswordFocus] = useState(false);

  // Get auth store actions and state
  const { register, isLoading, error, clearError } = useAuthStore();

  // Clear any previous errors when component mounts or unmounts
  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  const handleSubmit = async () => {
    console.log("Registering user with email:", email);
    try {
      // Form validation
      if (!email || !firstName || !lastName || !password || !confirmPassword) {
        showToast.error("Please fill in all fields");
        return;
      }

      if (password !== confirmPassword) {
        showToast.error("Passwords do not match");
        return;
      }

      // Password strength validation
      if (password.length < 8) {
        showToast.error("Password must be at least 8 characters long");
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
      console.log("Registration result:", result);

      if (result.success) {
        showToast.success("Account created successfully! Please log in.");

        // Navigate to login page after successful registration
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        showToast.error(result.message);
      }
    } catch (error) {
      console.log("The error is", error);
      // Handle connection errors
      if (
        error.message.includes("Connection refused") ||
        error.message.includes("Network Error")
      ) {
        showToast.error(
          "Cannot connect to the server. Please check if the backend is running."
        );
      } else {
        showToast.error(
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md p-10 mx-4 bg-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
          <p className="mt-2 text-gray-600">Join our community today</p>
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
              placeholder="yourname@example.com"
              className="w-full px-4 py-3 transition-colors duration-200 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                className="w-full px-4 py-3 transition-colors duration-200 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                className="w-full px-4 py-3 transition-colors duration-200 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordFocus(true)}
              onBlur={() => setPasswordFocus(false)}
              placeholder="••••••••"
              className="w-full px-4 py-3 transition-colors duration-200 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />

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
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 transition-colors duration-200 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="mt-2 text-xs text-red-500">
                Passwords do not match
              </p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full py-4 mt-8 font-medium text-white bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-300 disabled:cursor-not-allowed"
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
                Creating Account...
              </div>
            ) : (
              "Create Account"
            )}
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <span
              className="font-medium text-indigo-600 cursor-pointer transition-colors duration-200 hover:text-indigo-800 hover:underline"
              onClick={() => navigate("/login")}
            >
              Sign In
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
