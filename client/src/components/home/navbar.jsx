import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiShoppingCart, FiUser, FiMenu, FiX } from "react-icons/fi";
import useAuthStore from "../../stores/useAuthStore";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isAuthenticated, logout } = useAuthStore();
  // Mock cart until cart store is implemented
  const cart = [];
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    setSearchQuery("");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const categoryTabs = [
    { name: "All Books", path: "/browse" },
    { name: "Bestsellers", path: "/bestsellers" },
    { name: "Award Winners", path: "/award-winners" },
    { name: "New Releases", path: "/new-releases" },
    { name: "New Arrivals", path: "/new-arrivals" },
    { name: "Coming Soon", path: "/coming-soon" },
    { name: "Deals", path: "/deals" },
  ];

  return (
    <header className="bg-white shadow-sm">
      {/* Top Bar */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <svg
              className="w-8 h-8 text-red-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"></path>
            </svg>
            <span className="text-xl font-bold text-gray-900">Shelf Society</span>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:block flex-grow max-w-xl mx-8">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search for your next favorite book"
                className="w-full py-2 pl-4 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-red-600"
              >
                <FiSearch className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* Desktop Nav Icons */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/search" className="text-gray-700 hover:text-red-600">
              <FiSearch className="w-5 h-5" />
            </Link>
            <Link
              to="/cart"
              className="text-gray-700 hover:text-red-600 relative"
            >
              <FiShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center text-gray-700 hover:text-red-600">
                  <FiUser className="w-5 h-5" />
                </button>
                <div className="absolute right-0 w-48 mt-2 bg-white rounded-md shadow-lg z-10 hidden group-hover:block">
                  <div className="py-1">
                    <span className="block px-4 py-2 text-sm text-gray-500">
                      Hello, {user?.fullName}
                    </span>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      My Orders
                    </Link>
                    <Link
                      to="/whitelist"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      My Whitelists
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-red-600"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-4">
            <Link
              to="/cart"
              className="text-gray-700 hover:text-red-600 relative"
            >
              <FiShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Link>
            <button onClick={toggleMenu} className="text-gray-700">
              {isOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search (visible only on mobile) */}
      <div className="md:hidden px-4 py-2">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Search for books"
            className="w-full py-2 pl-4 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-red-600"
          >
            <FiSearch className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden ${isOpen ? "block" : "hidden"}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50">
          {categoryTabs.map((tab) => (
            <Link
              key={tab.name}
              to={tab.path}
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-100 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              {tab.name}
            </Link>
          ))}

          {isAuthenticated ? (
            <>
              <div className="px-3 py-2 font-medium text-gray-500">Account</div>
              <Link
                to="/profile"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-100 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                My Profile
              </Link>
              <Link
                to="/orders"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-100 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                My Orders
              </Link>
              <Link
                to="/whitelist"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-100 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                My Whitelists
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-100 rounded-md"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col space-y-2 px-3 py-2">
              <Link
                to="/login"
                className="text-center text-base font-medium text-red-600 hover:text-red-700 border border-red-600 px-4 py-2 rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-center text-base font-medium text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Category Nav (Desktop only) */}
      <nav className="hidden md:block bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto">
            {categoryTabs.map((tab) => (
              <Link
                key={tab.name}
                to={tab.path}
                className="py-4 px-1 text-sm font-medium text-gray-700 hover:text-red-600 border-b-2 border-transparent hover:border-red-600 whitespace-nowrap"
              >
                {tab.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
