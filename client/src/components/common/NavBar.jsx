import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import useAuthStore from "../../stores/useAuthStore";
import useCartStore from "../../stores/useCartStore";
import NotificationsPanel from "./NotificationPanel";
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { cart } = useCartStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsProfileOpen(false);
  };

  return (
    <nav className="border-b border-gray-200 py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo and Main Navigation */}
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center">
            <svg
              className="w-10 h-10 text-black"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M21 5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V22c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5V5z" />
              <path d="M3 5c1.1-.35 2.3-.5 3.5-.5 1.7 0 4.15.65 5.5 1.5V22c-1.35-.85-3.8-1.5-5.5-1.5-1.2 0-2.4.15-3.5.5V5z" />
            </svg>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            <Link
              to="/"
              className="font-medium uppercase text-sm text-gray-900 hover:text-gray-600"
            >
              Home
            </Link>
            <Link
              to="/books"
              className="font-medium uppercase text-sm text-gray-900 hover:text-gray-600"
            >
              Books
            </Link>
            <Link
              to="/whitelist"
              className="font-medium uppercase text-sm text-gray-900 hover:text-gray-600"
            >
              WhiteList
            </Link>

            {/* Admin link - only show if user is admin */}
            {isAuthenticated && user?.role === "Admin" && (
              <Link
                to="/admin"
                className="font-medium uppercase text-sm text-gray-900 hover:text-gray-600"
              >
                Admin
              </Link>
            )}

            {/* Staff link - only show if user is staff */}
            {isAuthenticated &&
              (user?.role === "Staff" || user?.role === "Admin") && (
                <Link
                  to="/staff"
                  className="font-medium uppercase text-sm text-gray-900 hover:text-gray-600"
                >
                  Staff
                </Link>
              )}

            {/* Show login/register only if not authenticated */}
            {!isAuthenticated && (
              <>
                <Link
                  to="/login"
                  className="font-medium uppercase text-sm text-gray-900 hover:text-gray-600"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="font-medium uppercase text-sm text-gray-900 hover:text-gray-600"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
        </div>

        {/* Action Icons */}
        <div className="flex items-center space-x-4">
          <button
            aria-label="Search"
            className="text-gray-900 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </button>

          {/* Notifications Panel - Only show for authenticated users */}
          {isAuthenticated && (
            <div className="relative">
              <NotificationsPanel />
            </div>
          )}

          <Link to="/cart" className="relative">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              ></path>
            </svg>
            {cart && cart.totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cart.totalItems}
              </span>
            )}
          </Link>

          {/* User Profile/Account Button */}
          <div className="relative">
            <button
              aria-label="Account"
              className="text-gray-900 hover:text-gray-600"
              onClick={() =>
                isAuthenticated && setIsProfileOpen(!isProfileOpen)
              }
            >
              {isAuthenticated ? (
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  {user?.fullName?.charAt(0) || user?.email?.charAt(0) || "U"}
                </div>
              ) : (
                <Link to="/login">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    ></path>
                  </svg>
                </Link>
              )}
            </button>

            {/* Profile Dropdown */}
            {isAuthenticated && isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                </div>
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsProfileOpen(false)}
                >
                  Your Profile
                </Link>
                {user?.role === "Admin" && (
                  <Link
                    to="/admin"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                {(user?.role === "Staff" || user?.role === "Admin") && (
                  <Link
                    to="/staff"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Staff Dashboard
                  </Link>
                )}
                <Link
                  to="/my-orders"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsProfileOpen(false)}
                >
                  My Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 px-4 pb-4">
          <div className="flex flex-col space-y-3">
            <Link
              to="/"
              className="font-medium uppercase text-sm text-gray-900 hover:text-gray-600 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/books"
              className="font-medium uppercase text-sm text-gray-900 hover:text-gray-600 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Books
            </Link>
            <Link
              to="/whitelist"
              className="font-medium uppercase text-sm text-gray-900 hover:text-gray-600 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              WhiteList
            </Link>

            {/* Admin link - only show if user is admin */}
            {isAuthenticated && user?.role === "Admin" && (
              <Link
                to="/admin"
                className="font-medium uppercase text-sm text-gray-900 hover:text-gray-600 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin
              </Link>
            )}

            {/* Staff link - only show if user is staff */}
            {isAuthenticated &&
              (user?.role === "Staff" || user?.role === "Admin") && (
                <Link
                  to="/staff"
                  className="font-medium uppercase text-sm text-gray-900 hover:text-gray-600 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Staff
                </Link>
              )}

            {/* Show login/register only if not authenticated */}
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="font-medium uppercase text-sm text-gray-900 hover:text-gray-600 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="font-medium uppercase text-sm text-gray-900 hover:text-gray-600 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/profile"
                  className="font-medium uppercase text-sm text-gray-900 hover:text-gray-600 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/my-orders"
                  className="font-medium uppercase text-sm text-gray-900 hover:text-gray-600 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="font-medium uppercase text-sm text-red-600 hover:text-red-800 py-2 text-left"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
