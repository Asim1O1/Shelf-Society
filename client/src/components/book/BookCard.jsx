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
    <Link to={`/books/${book.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg h-full flex flex-col">
        <div className="relative pt-[140%]">
          {book.onSale && (
            <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 font-bold text-sm z-10">
              ON SALE
            </div>
          )}
          <img
            src={
              book.imageUrl ||
              "https://via.placeholder.com/300x450?text=No+Image"
            }
            alt={book.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold line-clamp-2 mb-1">
            {book.title}
          </h3>
          <p className="text-gray-600 text-sm mb-2">{book.author}</p>

          <div className="mt-auto">
            <div className="flex items-center justify-between mb-3">
              <div>
                {hasDiscount ? (
                  <div className="flex items-center">
                    <span className="text-gray-500 line-through text-sm mr-2">
                      ${book.price.toFixed(2)}
                    </span>
                    <span className="text-red-600 font-bold">
                      ${discountedPrice}
                    </span>
                  </div>
                ) : (
                  <span className="font-semibold">
                    ${book.price.toFixed(2)}
                  </span>
                )}

                {hasDiscount && (
                  <div className="text-xs text-green-600 font-semibold mt-1">
                    Save {book.discountPercentage}%
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handleAddToWhitelist}
                  className="text-gray-700 hover:text-red-500"
                  title="Add to Whitelist"
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
                  className="text-gray-700 hover:text-red-500"
                  title="Add to Cart"
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
