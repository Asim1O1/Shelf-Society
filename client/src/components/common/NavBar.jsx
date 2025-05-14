// src/components/common/NavBar.jsx
import {
  BarChart3,
  BookOpen,
  Heart,
  Home,
  LogIn,
  LogOut,
  Menu,
  Package,
  Settings,
  ShieldCheck,
  ShoppingCart,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

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
  const [showLogoutModal, setShowLogoutModal] = useState(false);
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

  // Navigation items configuration with icons
  const navigationItems = [
    { path: "/", label: "Home", icon: Home, public: true },
    { path: "/books", label: "Books", icon: BookOpen, public: true },
    { path: "/whitelist", label: "Wishlist", icon: Heart, public: true },
    { path: "/admin", label: "Admin", icon: ShieldCheck, roles: ["Admin"] },
    { path: "/staff", label: "Staff", icon: Users, roles: ["Staff", "Admin"] },
  ];

  // Profile dropdown items with lucide icons
  const profileMenuItems = [
    { path: "/my-orders", label: "My Orders", icon: Package },
    ...(user?.role === "Admin"
      ? [{ path: "/admin", label: "Admin Dashboard", icon: Settings }]
      : []),
    ...(userHasAccess(["Staff", "Admin"])
      ? [{ path: "/staff", label: "Staff Dashboard", icon: BarChart3 }]
      : []),
  ];

  const renderNavItem = (item) => {
    // Skip role-based items if user doesn't have access
    if (item.roles && !userHasAccess(item.roles)) return null;

    const IconComponent = item.icon;

    return (
      <Link
        key={item.path}
        to={item.path}
        className="flex items-center space-x-1 text-sm font-normal text-gray-700 hover:text-red-600 transition-all duration-200 relative group"
      >
        <IconComponent className="w-4 h-4" />
        <span>{item.label}</span>
        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 transition-all duration-200 group-hover:w-full"></span>
      </Link>
    );
  };

  return (
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
                  Shelf Society
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
                      className="flex items-center space-x-1 text-sm font-normal text-gray-700 hover:text-red-600 transition-all duration-200 relative group"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Login</span>
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 transition-all duration-200 group-hover:w-full"></span>
                    </Link>
                    <Link
                      to="/register"
                      className="flex items-center space-x-1 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-500 px-5 py-2 rounded-full hover:from-red-700 hover:to-red-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Register</span>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Action Icons - Only show when authenticated */}
            <div className="flex items-center space-x-4">
              {/* Notifications Panel - Only for authenticated users */}
              {isAuthenticated && <NotificationsPanel />}

              {/* Cart - Show only for authenticated users */}
              {isAuthenticated && (
                <Link
                  to="/cart"
                  className="relative p-2 text-gray-600 hover:text-red-600 hover:bg-gray-50 rounded-full transition-all duration-200"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cart && cart.totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                      {cart.totalItems > 9 ? "9+" : cart.totalItems}
                    </span>
                  )}
                </Link>
              )}

              {/* User Profile/Account Button */}
              {isAuthenticated ? (
                <div className="relative">
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

                  {/* Profile Dropdown */}
                  {isProfileOpen && (
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
                        {profileMenuItems.map((item) => {
                          const IconComponent = item.icon;
                          return (
                            <Link
                              key={item.path}
                              to={item.path}
                              className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <IconComponent className="w-4 h-4 mr-2" />
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>
                      <div className="border-t border-gray-100">
                        <button
                          onClick={handleLogoutClick}
                          className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-50 rounded-full transition-all duration-200"
                >
                  <User className="w-5 h-5" />
                </Link>
              )}

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 text-gray-600 hover:text-red-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-100 bg-white animate-mobile-menu">
              <div className="px-4 py-4 space-y-2">
                {navigationItems
                  .filter((item) => item.public || userHasAccess(item.roles))
                  .map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex items-center space-x-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}

                <div className="border-t border-gray-100 pt-2 mt-2">
                  {!isAuthenticated ? (
                    <>
                      <Link
                        to="/login"
                        className="flex items-center space-x-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Login</span>
                      </Link>
                      <Link
                        to="/register"
                        className="flex items-center space-x-2 px-4 py-3 mt-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-500 rounded-lg hover:from-red-700 hover:to-red-600 transition-all duration-200 text-center"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Register</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      {profileMenuItems.map((item) => {
                        const IconComponent = item.icon;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            className="flex items-center space-x-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <IconComponent className="w-4 h-4" />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleLogoutClick();
                        }}
                        className="flex items-center space-x-2 w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
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
