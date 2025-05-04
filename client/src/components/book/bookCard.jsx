import React from "react";
import { Link } from "react-router-dom";
import { FiBookmark, FiShoppingCart, FiStar } from "react-icons/fi";

const BookCard = ({ book }) => {
  // Placeholder functions since actual store implementation is commented out
  const handleWhitelistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Toggle whitelist for book:", book.id);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Add to cart:", book.id);
  };

  // Calculate discounted price
  const discountedPrice = book.onSale
    ? book.price - book.price * (book.discountPercentage / 100)
    : book.price;

  return (
    <div className="relative bg-white rounded-lg shadow-sm hover:shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-1">
      {/* Sale badge */}
      {book.onSale && (
        <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
          {book.discountPercentage}% OFF
        </div>
      )}

      {/* Bookmark button */}
      <button
        onClick={handleWhitelistToggle}
        className="absolute top-2 left-2 p-2 rounded-full z-10 bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600"
        aria-label="Add to whitelist"
      >
        <FiBookmark className="w-4 h-4" />
      </button>

      <Link to={`/book/${book.id}`} className="block">
        {/* Book image */}
        <div className="relative pt-[140%]">
          <img
            src={book.coverImage || "/images/book-placeholder.jpg"}
            alt={`Cover of ${book.title}`}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Book info */}
        <div className="p-4">
          <h3
            className="text-gray-900 font-semibold mb-1 line-clamp-2"
            title={book.title}
          >
            {book.title}
          </h3>
          <p
            className="text-gray-600 text-sm mb-2 line-clamp-1"
            title={book.author}
          >
            {book.author}
          </p>

          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex items-center mr-2">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(book.averageRating || 0)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              ({book.totalReviews || 0})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              {book.onSale ? (
                <div className="flex items-center">
                  <span className="text-gray-500 line-through text-sm mr-2">
                    ${book.price?.toFixed(2)}
                  </span>
                  <span className="text-red-600 font-bold">
                    ${discountedPrice?.toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className="text-gray-900 font-bold">
                  ${book.price?.toFixed(2)}
                </span>
              )}
            </div>

            {/* Availability */}
            <span
              className={`text-xs font-medium px-2 py-1 rounded ${
                book.inStock
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {book.inStock ? "In Stock" : "Out of Stock"}
            </span>
          </div>
        </div>
      </Link>

      {/* Add to cart button */}
      <div className="px-4 pb-4">
        <button
          onClick={handleAddToCart}
          disabled={!book.inStock}
          className={`w-full py-2 rounded-lg flex items-center justify-center transition ${
            book.inStock
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <FiShoppingCart className="w-4 h-4 mr-2" />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
};

export default BookCard;
