// src/components/common/NavBar.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  Book,
  ChevronDown,
  Heart,
  Home,
  LogIn,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  User,
  UserPlus,
} from "lucide-react";
import useAuthStore from "../../stores/useAuthStore";
import useCartStore from "../../stores/useCartStore";
import NotificationsPanel from "./NotificationPanel";

// Confirmation Modal Component
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  confirmClass = "bg-red-600 hover:bg-red-700",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl animate-modal-enter">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex space-x-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-700 hover:text-gray-900 font-medium rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${confirmClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
<<<<<<< HEAD
  const [showLogoutModal, setShowLogoutModal] = useState(false);
=======

>>>>>>> c2e8d12 (multiple UI updates, duplicate notification display bug fixed)
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { cart } = useCartStore();

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setIsProfileOpen(false);
  };

  const confirmLogout = () => {
    logout();
    toast.success("Successfully logged out");
    navigate("/login");
    setShowLogoutModal(false);
  };

  // Helper function to determine user access level
  const userHasAccess = (requiredRoles) => {
    if (!isAuthenticated || !user?.role) return false;
    return requiredRoles.includes(user.role);
  };

  // Navigation items configuration
  const navigationItems = [
    { path: "/", label: "Home", public: true },
    { path: "/books", label: "Books", public: true },
    { path: "/whitelist", label: "Wishlist", public: true },
    { path: "/admin", label: "Admin", roles: ["Admin"] },
    { path: "/staff", label: "Staff", roles: ["Staff", "Admin"] },
  ];

  // Profile dropdown items
  const profileMenuItems = [
    { path: "/profile", label: "Your Profile", icon: "👤" },
    { path: "/my-orders", label: "My Orders", icon: "📦" },
    ...(user?.role === "Admin"
      ? [{ path: "/admin", label: "Admin Dashboard", icon: "⚙️" }]
      : []),
    ...(userHasAccess(["Staff", "Admin"])
      ? [{ path: "/staff", label: "Staff Dashboard", icon: "📊" }]
      : []),
  ];

  const renderNavItem = (item) => {
    // Skip role-based items if user doesn't have access
    if (item.roles && !userHasAccess(item.roles)) return null;

    return (
      <Link
        key={item.path}
        to={item.path}
        className="text-sm font-normal text-gray-700 hover:text-red-600 transition-all duration-200 relative group"
      >
        {item.label}
        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 transition-all duration-200 group-hover:w-full"></span>
      </Link>
    );
  };

  return (
<<<<<<< HEAD
    <>
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Main Navigation */}
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center group">
                <svg
                  className="w-8 h-8 text-red-600 transition-transform duration-200 group-hover:scale-110"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M21 5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V22c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5V5z" />
                  <path d="M3 5c1.1-.35 2.3-.5 3.5-.5 1.7 0 4.15.65 5.5 1.5V22c-1.35-.85-3.8-1.5-5.5-1.5-1.2 0-2.4.15-3.5.5V5z" />
                </svg>
                <span className="ml-2 text-xl font-light text-gray-900 group-hover:text-red-600 transition-colors duration-200">
                  Books
=======
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Main Navigation */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center group">
              <svg
                className="w-8 h-8 text-red-600 group-hover:text-red-700 transition-colors"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M21 5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V22c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5V5z" />
                <path d="M3 5c1.1-.35 2.3-.5 3.5-.5 1.7 0 4.15.65 5.5 1.5V22c-1.35-.85-3.8-1.5-5.5-1.5-1.2 0-2.4.15-3.5.5V5z" />
              </svg>
              <span className="ml-2 text-xl font-light text-gray-900 group-hover:text-red-600 transition-colors">
                Shelf Society
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className="flex items-center text-sm font-light text-gray-700 hover:text-red-600 transition-colors"
              >
                <Home size={16} className="mr-1" />
                <span>Home</span>
              </Link>
              <Link
                to="/books"
                className="flex items-center text-sm font-light text-gray-700 hover:text-red-600 transition-colors"
              >
                <Book size={16} className="mr-1" />
                <span>Books</span>
              </Link>
              <Link
                to="/whitelist"
                className="flex items-center text-sm font-light text-gray-700 hover:text-red-600 transition-colors"
              >
                <Heart size={16} className="mr-1" />
                <span>Wishlist</span>
              </Link>

              {/* Admin link - only show if user is admin */}
              {isAuthenticated && user?.role === "Admin" && (
                <Link
                  to="/admin"
                  className="flex items-center text-sm font-light text-gray-700 hover:text-red-600 transition-colors"
                >
                  <ShieldCheck size={16} className="mr-1" />
                  <span>Admin</span>
                </Link>
              )}

              {/* Staff link - only show if user is staff */}
              {isAuthenticated &&
                (user?.role === "Staff" || user?.role === "Admin") && (
                  <Link
                    to="/staff"
                    className="flex items-center text-sm font-light text-gray-700 hover:text-red-600 transition-colors"
                  >
                    <User size={16} className="mr-1" />
                    <span>Staff</span>
                  </Link>
                )}

              {/* Show login/register only if not authenticated */}
              {!isAuthenticated && (
                <>
                  <Link
                    to="/login"
                    className="flex items-center text-sm font-light text-gray-700 hover:text-red-600 transition-colors"
                  >
                    <LogIn size={16} className="mr-1" />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-500 px-4 py-2 rounded-full hover:from-red-700 hover:to-red-600 transition-all shadow-md hover:shadow-lg"
                  >
                    <UserPlus size={16} className="mr-1" />
                    <span>Register</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X size={20} className="text-gray-700" />
            ) : (
              <Menu size={20} className="text-gray-700" />
            )}
          </button>

          {/* Action Icons */}
          <div className="flex items-center space-x-4">
            {/* Notifications Panel - Only show for authenticated users */}
            {isAuthenticated && (
              <div className="relative">
                <NotificationsPanel />
              </div>
            )}

            <Link
              to="/cart"
              className="relative flex items-center justify-center w-8 h-8 rounded-full text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <ShoppingCart size={18} />
              {cart && cart.totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {cart.totalItems}
>>>>>>> c2e8d12 (multiple UI updates, duplicate notification display bug fixed)
                </span>
              </Link>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-6">
                {navigationItems
                  .filter((item) => item.public || userHasAccess(item.roles))
                  .map(renderNavItem)}

                {/* Authentication Links */}
                {!isAuthenticated && (
                  <>
                    <Link
                      to="/login"
                      className="text-sm font-normal text-gray-700 hover:text-red-600 transition-all duration-200 relative group"
                    >
                      Login
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 transition-all duration-200 group-hover:w-full"></span>
                    </Link>
                    <Link
                      to="/register"
                      className="text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-500 px-5 py-2 rounded-full hover:from-red-700 hover:to-red-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Action Icons */}
            <div className="flex items-center space-x-4">
              {/* Search Button */}
              <button
<<<<<<< HEAD
                aria-label="Search"
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-50 rounded-full transition-all duration-200"
=======
                aria-label="Account"
                className="flex items-center justify-center"
                onClick={() =>
                  isAuthenticated && setIsProfileOpen(!isProfileOpen)
                }
>>>>>>> c2e8d12 (multiple UI updates, duplicate notification display bug fixed)
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </button>

              {/* Notifications Panel */}
              {isAuthenticated && <NotificationsPanel />}

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2 text-gray-600 hover:text-red-600 hover:bg-gray-50 rounded-full transition-all duration-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  ></path>
                </svg>
                {cart && cart.totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {cart.totalItems > 9 ? "9+" : cart.totalItems}
                  </span>
                )}
              </Link>

              {/* User Profile/Account Button */}
              <div className="relative">
                {isAuthenticated ? (
<<<<<<< HEAD
                  <button
                    aria-label="Account"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="h-8 w-8 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white flex items-center justify-center hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <span className="text-sm font-medium">
                      {user?.fullName?.charAt(0) ||
                        user?.email?.charAt(0) ||
                        "U"}
                    </span>
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-50 rounded-full transition-all duration-200"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      ></path>
                    </svg>
=======
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600 hover:bg-red-100 transition-colors">
                      <span className="text-sm font-medium">
                        {user?.fullName?.charAt(0) ||
                          user?.email?.charAt(0) ||
                          "U"}
                      </span>
                    </div>
                    <ChevronDown size={14} className="ml-1 text-gray-500" />
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center justify-center w-8 h-8 rounded-full text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <User size={18} />
>>>>>>> c2e8d12 (multiple UI updates, duplicate notification display bug fixed)
                  </Link>
                )}

<<<<<<< HEAD
                {/* Profile Dropdown */}
                {isAuthenticated && isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-dropdown">
                    <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user?.fullName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <div className="py-1">
                      {profileMenuItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <span className="mr-2">{item.icon}</span>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-gray-100">
                      <button
                        onClick={handleLogoutClick}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                      >
                        <span className="mr-2">🚪</span>
                        Sign out
                      </button>
                    </div>
                  </div>
=======
              {/* Profile Dropdown */}
              {isAuthenticated && isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.fullName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User size={16} className="mr-2 text-gray-400" />
                    Your Profile
                  </Link>
                  {user?.role === "Admin" && (
                    <Link
                      to="/admin"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <ShieldCheck size={16} className="mr-2 text-gray-400" />
                      Admin Dashboard
                    </Link>
                  )}
                  {(user?.role === "Staff" || user?.role === "Admin") && (
                    <Link
                      to="/staff"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Users size={16} className="mr-2 text-gray-400" />
                      Staff Dashboard
                    </Link>
                  )}
                  <Link
                    to="/my-orders"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Package size={16} className="mr-2 text-gray-400" />
                    My Orders
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings size={16} className="mr-2 text-gray-400" />
                    Settings
                  </Link>
                  <div className="border-t border-gray-100 mt-1"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} className="mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <div className="px-2 py-3 space-y-1">
              <Link
                to="/"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home size={18} className="mr-3 text-gray-500" />
                Home
              </Link>
              <Link
                to="/books"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Book size={18} className="mr-3 text-gray-500" />
                Books
              </Link>
              <Link
                to="/whitelist"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Heart size={18} className="mr-3 text-gray-500" />
                Wishlist
              </Link>

              {/* Admin link - only show if user is admin */}
              {isAuthenticated && user?.role === "Admin" && (
                <Link
                  to="/admin"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShieldCheck size={18} className="mr-3 text-gray-500" />
                  Admin
                </Link>
              )}

              {/* Staff link - only show if user is staff */}
              {isAuthenticated &&
                (user?.role === "Staff" || user?.role === "Admin") && (
                  <Link
                    to="/staff"
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Users size={18} className="mr-3 text-gray-500" />
                    Staff
                  </Link>
                )}

              <div className="border-t border-gray-100 pt-2 mt-2">
                {/* Show login/register only if not authenticated */}
                {!isAuthenticated ? (
                  <>
                    <Link
                      to="/login"
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LogIn size={18} className="mr-3 text-gray-500" />
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="flex items-center px-3 py-2 mt-1 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-500 rounded-lg hover:from-red-700 hover:to-red-600 transition-all"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <UserPlus size={18} className="mr-3" />
                      Register
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/profile"
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User size={18} className="mr-3 text-gray-500" />
                      Profile
                    </Link>
                    <Link
                      to="/my-orders"
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Package size={18} className="mr-3 text-gray-500" />
                      My Orders
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings size={18} className="mr-3 text-gray-500" />
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full text-left px-3 py-2 mt-1 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut size={18} className="mr-3" />
                      Logout
                    </button>
                  </>
>>>>>>> c2e8d12 (multiple UI updates, duplicate notification display bug fixed)
                )}
              </div>

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 text-gray-600 hover:text-red-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
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
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-100 bg-white animate-mobile-menu">
              <div className="px-4 py-4 space-y-2">
                {navigationItems
                  .filter((item) => item.public || userHasAccess(item.roles))
                  .map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}

                <div className="border-t border-gray-100 pt-2 mt-2">
                  {!isAuthenticated ? (
                    <>
                      <Link
                        to="/login"
                        className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="block px-4 py-3 mt-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-500 rounded-lg hover:from-red-700 hover:to-red-600 transition-all duration-200 text-center"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Register
                      </Link>
                    </>
                  ) : (
                    <>
                      {profileMenuItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleLogoutClick();
                        }}
                        className="block w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      >
                        Logout
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout? You'll need to sign in again to access your account."
        confirmText="Logout"
        confirmClass="bg-red-600 hover:bg-red-700"
      />

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes modal-enter {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes dropdown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes mobile-menu {
          from {
            opacity: 0;
            height: 0;
          }
          to {
            opacity: 1;
            height: auto;
          }
        }

        .animate-modal-enter {
          animation: modal-enter 0.2s ease-out;
        }

        .animate-dropdown {
          animation: dropdown 0.2s ease-out;
        }

        .animate-mobile-menu {
          animation: mobile-menu 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default Navbar;
