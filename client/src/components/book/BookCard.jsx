// src/components/book/BookCard.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";

const BookCard = ({ book }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // Check if book has an active discount
  const hasDiscount = book.discountPercentage !== null;

  // Calculate discounted price if applicable
  const discountedPrice = hasDiscount
    ? (book.price - (book.price * book.discountPercentage) / 100).toFixed(2)
    : null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/books/${book.id}` } });
      return;
    }

    // Add to cart functionality will be implemented later
    console.log("Add to cart:", book.id);
  };

  const handleAddToWhitelist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/books/${book.id}` } });
      return;
    }

    // Add to whitelist functionality will be implemented later
    console.log("Add to whitelist:", book.id);
  };

  return (
    <Link 
      to={`/books/${book.id}`}
      className="group block h-full"
      aria-label={`View details for ${book.title} by ${book.author}`}
    >
      <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col overflow-hidden border border-gray-100">
        <div className="relative pt-[140%] overflow-hidden">
          {book.onSale && (
            <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1.5 font-bold text-sm z-10 rounded-full shadow-md">
              {book.discountPercentage}% OFF
            </div>
          )}
          <div className="absolute inset-0 bg-gray-100">
            <img
              src={book.imageUrl || "https://via.placeholder.com/300x450?text=No+Image"}
              alt={book.title}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <div className="mb-2">
            <h3 className="text-lg font-semibold line-clamp-2 text-gray-900 group-hover:text-red-600 transition-colors">
              {book.title}
            </h3>
            <p className="text-gray-600 text-sm mt-1">{book.author}</p>
          </div>

          <div className="mt-auto">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                {hasDiscount ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 line-through text-sm">
                      ${book.price.toFixed(2)}
                    </span>
                    <span className="text-red-600 font-bold text-lg">
                      ${discountedPrice}
                    </span>
                  </div>
                ) : (
                  <span className="font-bold text-lg text-gray-900">
                    ${book.price.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleAddToWhitelist}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Add to Whitelist"
                  aria-label="Add to Whitelist"
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
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    ></path>
                  </svg>
                </button>

                <button
                  onClick={handleAddToCart}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Add to Cart"
                  aria-label="Add to Cart"
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
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;
