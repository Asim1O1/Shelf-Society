import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast, Toaster } from "sonner"; // Import Sonner toast
import useAuthStore from "../../stores/useAuthStore";
import useCartStore from "../../stores/useCartStore"; // Added cart store import

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { isAuthenticated, user, logout } = useAuthStore();
  const { cart } = useCartStore(); // Access cart data
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef(null);
  const profileDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target) &&
        !event.target.closest(".search-button")
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    // Close the profile dropdown
    setIsProfileOpen(false);

    // Show confirmation toast with action buttons
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex`}
        >
          <div className="flex-1 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <svg
                  className="h-10 w-10 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  ></path>
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Sign out confirmation
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Are you sure you want to sign out?
                </p>
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={() => {
                      toast.dismiss(t.id);
                      // Execute logout
                      logout();
                      navigate("/login");
                    }}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500"
                  >
                    Sign out
                  </button>
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        duration: 5000, // 5 seconds
        position: "top-center",
      }
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const categoryTabs = [
    { name: "All Books", path: "/books" },
    { name: "Bestsellers", path: "/bestsellers" },
    { name: "Award Winners", path: "/award-winners" },
    { name: "New Releases", path: "/new-releases" },
    { name: "Coming Soon", path: "/coming-soon" },
    { name: "Deals", path: "/deals" },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="sticky top-0 z-30 bg-white shadow-sm">
      {/* Sonner Toast Container */}
      <Toaster richColors />

      {/* Top Bar */}
      <nav className="border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M21 5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V22c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5V5z" />
                  <path d="M3 5c1.1-.35 2.3-.5 3.5-.5 1.7 0 4.15.65 5.5 1.5V22c-1.35-.85-3.8-1.5-5.5-1.5-1.2 0-2.4.15-3.5.5V5z" />
                </svg>
                <span className="text-xl font-bold text-gray-900">
                  Shelf Society
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors ${
                  isActive("/")
                    ? "text-red-600"
                    : "text-gray-700 hover:text-red-600"
                }`}
              >
                Home
              </Link>
              <Link
                to="/books"
                className={`text-sm font-medium transition-colors ${
                  isActive("/books")
                    ? "text-red-600"
                    : "text-gray-700 hover:text-red-600"
                }`}
              >
                Books
              </Link>

              {isAuthenticated && user?.role === "Admin" && (
                <Link
                  to="/admin"
                  className={`text-sm font-medium transition-colors ${
                    isActive("/admin")
                      ? "text-red-600"
                      : "text-gray-700 hover:text-red-600"
                  }`}
                >
                  Admin
                </Link>
              )}
            </div>

            {/* Action Icons */}
            <div className="flex items-center space-x-4">
              {/* Search Button and Dropdown */}
              <div className="relative" ref={searchInputRef}>
                <button
                  aria-label={isSearchOpen ? "Close search" : "Open search"}
                  className="search-button p-2 text-gray-700 hover:text-red-600 rounded-full hover:bg-gray-100 transition-colors"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
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
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    ></path>
                  </svg>
                </button>

                {isSearchOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg p-2 border border-gray-200">
                    <form onSubmit={handleSearch} className="flex">
                      <input
                        type="text"
                        placeholder="Search for books..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-red-600 text-white rounded-r-lg hover:bg-red-700 transition-colors"
                      >
                        Search
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* Cart Button */}
              <Link
                to="/cart"
                aria-label={`Shopping cart with ${cart?.totalItems || 0} items`}
                className="p-2 text-gray-700 hover:text-red-600 rounded-full hover:bg-gray-100 transition-colors relative"
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
                    strokeWidth="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  ></path>
                </svg>
                {/* Updated to use cart store data */}
                {cart && cart.totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-xs text-white font-medium rounded-full h-5 w-5 flex items-center justify-center">
                    {cart.totalItems > 99 ? "99+" : cart.totalItems}
                  </span>
                )}
              </Link>

              {/* User Profile */}
              <div className="relative" ref={profileDropdownRef}>
                {isAuthenticated ? (
                  <button
                    aria-label="User menu"
                    aria-expanded={isProfileOpen}
                    className="flex items-center justify-center h-8 w-8 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                  >
                    {user?.fullName?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <Link
                      to="/login"
                      className="text-sm font-medium text-gray-700 hover:text-red-600 py-2 px-3 rounded-lg transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="text-sm font-medium text-white bg-red-600 hover:bg-red-700 py-2 px-3 rounded-lg transition-colors"
                    >
                      Register
                    </Link>
                  </div>
                )}

                {/* Profile Dropdown */}
                {isAuthenticated && isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg overflow-hidden z-10 border border-gray-200">
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
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
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Your Profile
                      </Link>
                      <Link
                        to="/whitelist"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Saved Books
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Your Orders
                      </Link>
                      {user?.role === "Admin" && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMenuOpen}
                className="md:hidden p-2 text-gray-700 hover:text-red-600 rounded-full hover:bg-gray-100 transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
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
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                ) : (
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
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    ></path>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Categories Navigation (Desktop) */}
      <div className="hidden md:block border-b border-gray-200 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto py-2">
            {categoryTabs.map((category) => (
              <Link
                key={category.name}
                to={category.path}
                className={`whitespace-nowrap text-sm font-medium py-2 px-1 border-b-2 transition-colors ${
                  isActive(category.path)
                    ? "border-red-600 text-red-600"
                    : "border-transparent text-gray-700 hover:text-red-600 hover:border-red-300"
                }`}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                className={`text-sm font-medium py-2 transition-colors ${
                  isActive("/") ? "text-red-600" : "text-gray-700"
                }`}
              >
                Home
              </Link>
              <Link
                to="/books"
                className={`text-sm font-medium py-2 transition-colors ${
                  isActive("/books") ? "text-red-600" : "text-gray-700"
                }`}
              >
                Books
              </Link>

              {/* Category Links */}
              <div className="pt-2 pb-1 border-t border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                  Categories
                </p>
                {categoryTabs.map((category) => (
                  <Link
                    key={category.name}
                    to={category.path}
                    className={`block text-sm py-2 transition-colors ${
                      isActive(category.path) ? "text-red-600" : "text-gray-700"
                    }`}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>

              {/* User Account Links */}
              {isAuthenticated ? (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                    Your Account
                  </p>
                  <Link
                    to="/profile"
                    className="block text-sm py-2 text-gray-700"
                  >
                    Your Profile
                  </Link>
                  <Link
                    to="/whitelist"
                    className="block text-sm py-2 text-gray-700"
                  >
                    Saved Books
                  </Link>
                  <Link
                    to="/orders"
                    className="block text-sm py-2 text-gray-700"
                  >
                    Your Orders
                  </Link>
                  {user?.role === "Admin" && (
                    <Link
                      to="/admin"
                      className="block text-sm py-2 text-gray-700"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left text-sm py-2 text-red-600"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200 flex flex-col space-y-3">
                  <Link
                    to="/login"
                    className="w-full text-center py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="w-full text-center py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavBar;
