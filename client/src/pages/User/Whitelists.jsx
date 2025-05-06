// src/pages/WhitelistPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import AnnouncementBanner from "../../components/common/AnnouncementBanner";
import Navbar from "../../components/common/NavBar";
import Pagination from "../../components/common/Pagination";
import useWhitelist from "../../stores/useWhitelist";

const WhitelistPage = () => {
  const {
    whitelist,
    isLoading,
    error,
    pagination,
    removeFromWhitelist,
    setPagination,
  } = useWhitelist();

  const handleAddToCart = async (bookId) => {
    try {
      // This will be implemented when we create the cart functionality
      // For now, just show a toast message
      toast.success("Added to cart");
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error("Failed to add book to cart");
    }
  };

  const handlePageChange = (newPageNumber) => {
    setPagination({
      ...pagination,
      pageNumber: newPageNumber,
    });
    // Scroll to top when changing pages
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AnnouncementBanner />
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Whitelist</h1>
          <Link
            to="/books"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Browse More Books
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        ) : whitelist.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h3 className="text-xl font-semibold mb-2">
              Your whitelist is empty
            </h3>
            <p className="text-gray-600 mb-4">
              Browse our catalog and add books to your whitelist for future
              reference.
            </p>
            <Link
              to="/books"
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Browse Books
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {whitelist.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col"
                >
                  <Link to={`/books/${item.bookId}`} className="block">
                    <div className="relative h-56">
                      <img
                        src={
                          item.imageUrl ||
                          "https://via.placeholder.com/300x450?text=No+Image"
                        }
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>

                  <div className="p-4 flex flex-col flex-grow">
                    <Link to={`/books/${item.bookId}`} className="block">
                      <h3 className="text-lg font-semibold mb-1 hover:text-red-600">
                        {item.title}
                      </h3>
                    </Link>
                    <p className="text-gray-600 text-sm mb-2">{item.author}</p>
                    <p className="text-gray-800 font-medium mb-4">
                      ${item.price.toFixed(2)}
                    </p>

                    <div className="mt-auto flex gap-2">
                      <button
                        onClick={() => handleAddToCart(item.bookId)}
                        disabled={!item.isAvailable}
                        className={`flex-1 py-2 rounded-md ${
                          item.isAvailable
                            ? "bg-red-500 text-white hover:bg-red-600"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {item.isAvailable ? "Add to Cart" : "Out of Stock"}
                      </button>

                      <button
                        onClick={() => removeFromWhitelist(item.id)}
                        className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                      >
                        <svg
                          className="w-5 h-5 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalCount > pagination.pageSize && (
              <div className="mt-8">
                <Pagination
                  currentPage={pagination.pageNumber}
                  totalPages={Math.ceil(
                    pagination.totalCount / pagination.pageSize
                  )}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WhitelistPage;
