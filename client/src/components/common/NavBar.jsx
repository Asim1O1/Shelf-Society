import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";
import useCartStore from "../../stores/useCartStore";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = useCartStore();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsProfileOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white shadow-md py-3"
          : "bg-white/80 backdrop-blur-sm py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo and Main Navigation */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <svg
                className="w-8 h-8 text-red-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M21 5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V22c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5V5z" />
                <path d="M3 5c1.1-.35 2.3-.5 3.5-.5 1.7 0 4.15.65 5.5 1.5V22c-1.35-.85-3.8-1.5-5.5-1.5-1.2 0-2.4.15-3.5.5V5z" />
              </svg>
              <span className="text-xl font-bold text-gray-900">Shelf Society</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8">
              <Link
                to="/"
                className={`font-medium text-sm transition-colors ${
                  isActive("/")
                    ? "text-red-500"
                    : "text-gray-600 hover:text-red-500"
                }`}
              >
                Home
              </Link>
              <Link
                to="/books"
                className={`font-medium text-sm transition-colors ${
                  isActive("/books")
                    ? "text-red-500"
                    : "text-gray-600 hover:text-red-500"
                }`}
              >
                Books
              </Link>
              <Link
                to="/whitelist"
                className={`font-medium text-sm transition-colors ${
                  isActive("/whitelist")
                    ? "text-red-500"
                    : "text-gray-600 hover:text-red-500"
                }`}
              >
                Whitelist
              </Link>
              {isAuthenticated && user?.role === "Admin" && (
                <Link
                  to="/admin"
                  className={`font-medium text-sm transition-colors ${
                    isActive("/admin")
                      ? "text-red-500"
                      : "text-gray-600 hover:text-red-500"
                  }`}
                >
                  Admin
                </Link>
              )}
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center space-x-6">
            <button
              aria-label="Search"
              className="text-gray-600 hover:text-red-500 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            <Link
              to="/cart"
              className="relative text-gray-600 hover:text-red-500 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {cart && cart.totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {cart.totalItems}
                </span>
              )}
            </Link>

            {/* User Profile/Account Button */}
            <div className="relative">
              {isAuthenticated ? (
                <button
                  aria-label="Account"
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-medium shadow-sm">
                    {user?.fullName?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </div>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </Link>
              )}

              {/* Profile Dropdown */}
              {isAuthenticated && isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-2 z-10 border border-gray-100">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.fullName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <svg
                        className="w-4 h-4 mr-3 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Your Profile
                    </Link>
                    {user?.role === "Admin" && (
                      <Link
                        to="/admin"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <svg
                          className="w-4 h-4 mr-3 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/my-orders"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <svg
                        className="w-4 h-4 mr-3 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                      My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-3 text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-gray-600 hover:text-red-500 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  isActive("/")
                    ? "text-red-500 bg-red-50"
                    : "text-gray-600 hover:text-red-500 hover:bg-gray-50"
                }`}
              >
                Home
              </Link>
              <Link
                to="/books"
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  isActive("/books")
                    ? "text-red-500 bg-red-50"
                    : "text-gray-600 hover:text-red-500 hover:bg-gray-50"
                }`}
              >
                Books
              </Link>
              <Link
                to="/whitelist"
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  isActive("/whitelist")
                    ? "text-red-500 bg-red-50"
                    : "text-gray-600 hover:text-red-500 hover:bg-gray-50"
                }`}
              >
                Whitelist
              </Link>
              {isAuthenticated && user?.role === "Admin" && (
                <Link
                  to="/admin"
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    isActive("/admin")
                      ? "text-red-500 bg-red-50"
                      : "text-gray-600 hover:text-red-500 hover:bg-gray-50"
                  }`}
                >
                  Admin
                </Link>
              )}
              {!isAuthenticated && (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-500 hover:bg-gray-50 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-500 hover:bg-gray-50 transition-colors"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
