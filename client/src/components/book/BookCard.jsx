import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";

const BookCard = ({ book }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [isHovered, setIsHovered] = useState(false);

  // Check if book has an active discount
  const hasDiscount =
    book.discountPercentage !== null && book.discountPercentage > 0;

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
      className="block h-full group"
      aria-label={`View details for ${book.title} by ${book.author}`}
    >
      <div
        className="bg-white rounded-xl overflow-hidden h-full flex flex-col transition-all duration-300 relative"
        style={{
          boxShadow: isHovered
            ? "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
            : "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
          transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Book Cover Image with Overlay */}
        <div className="relative aspect-[2/3] overflow-hidden bg-gray-100">
          {/* Sale Badge */}
          {book.onSale && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm z-10">
              On Sale
            </div>
          )}

          {/* Book Cover */}
          <img
            src={
              book.imageUrl ||
              "https://via.placeholder.com/300x450?text=No+Image"
            }
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
            loading="lazy"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* Quick Action Buttons that appear on hover */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-3 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <button
              onClick={handleAddToWhitelist}
              className="bg-white/90 backdrop-blur-sm text-gray-800 p-2.5 rounded-full shadow-md hover:bg-white hover:text-red-600 transition-colors"
              title="Add to Wishlist"
              aria-label="Add to Wishlist"
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
              className="bg-white/90 backdrop-blur-sm text-gray-800 p-2.5 rounded-full shadow-md hover:bg-white hover:text-red-600 transition-colors"
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

        {/* Book Details */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-gray-900 font-medium line-clamp-2 group-hover:text-red-600 transition-colors duration-200">
            {book.title}
          </h3>

          <p className="text-gray-500 text-sm mt-1 italic line-clamp-1">
            {book.author}
          </p>

          {/* Price and Discount */}
          <div className="mt-auto pt-3">
            {hasDiscount ? (
              <div className="flex items-baseline flex-wrap">
                <span className="text-gray-400 line-through text-sm mr-2">
                  ${book.price.toFixed(2)}
                </span>
                <span className="text-red-600 font-bold">
                  ${discountedPrice}
                </span>
                <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  -{book.discountPercentage}%
                </span>
              </div>
            ) : (
              <span className="font-medium text-gray-900">
                ${book.price.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;
