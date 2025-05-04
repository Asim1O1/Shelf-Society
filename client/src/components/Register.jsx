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

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-md p-8 mx-4 bg-white rounded-lg shadow-md">
        <h1 className="mb-8 text-2xl font-bold text-center text-gray-800">
          Create Account
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

          <div className="grid grid-cols-2 gap-4 mb-6">
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
                placeholder="First name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
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
                placeholder="Last name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
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

          <div className="mb-6">
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
              placeholder="Confirm your password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full py-3 mt-6 font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:bg-red-300 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>

          <div className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <span
              className="font-medium text-red-500 cursor-pointer hover:underline"
              onClick={() => navigate("/login")}
            >
              Sign In
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
