import React from "react";
import { Link } from "react-router-dom";
import { FiBookmark, FiShoppingCart } from "react-icons/fi";
import useAuthStore from "../../stores/useAuthStore";
import BookImage from "./BookImage";

const BookCard = ({ book }) => {
  const { isAuthenticated } = useAuthStore();

  const handleWhitelistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      window.location.href =
        "/login?redirect=" + encodeURIComponent(window.location.pathname);
      return;
    }
    console.log("Toggle whitelist for book:", book.id || book._id);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      window.location.href =
        "/login?redirect=" + encodeURIComponent(window.location.pathname);
      return;
    }
    console.log("Adding to cart:", book.id || book._id);
  };

  // Calculate pricing info
  const price = book.price || 0;
  const discountPercentage = book.discountPercentage || 0;
  const onSale = book.onSale || false;
  const discountedPrice = onSale
    ? price - price * (discountPercentage / 100)
    : price;
  const inStock = book.inStock !== undefined ? book.inStock : true;

  return (
    <div className="relative group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      {/* Sale badge */}
      {onSale && discountPercentage > 0 && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full z-10">
          {discountPercentage}% OFF
        </div>
      )}

      {/* Bookmark button */}
      <button
        onClick={handleWhitelistToggle}
        className="absolute top-2 left-2 p-1.5 rounded-full z-10 bg-white/80 text-gray-500 hover:text-red-600 hover:bg-white transition-colors"
        aria-label="Add to wishlist"
      >
        <FiBookmark className="w-3.5 h-3.5" />
      </button>

      <Link to={`/booksdetail/${book.id || book._id}`} className="block">

        {/* Book cover */}
        <div className="relative h-60 bg-gray-100">
          <BookImage
            book={book}
            className="h-60 w-full"
            imgClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            altText={`Cover of ${book.title}`}
          />
        </div>

        {/* Book info */}
        <div className="p-4">
          {/* Title & Author */}
          <h3
            className="font-medium text-gray-900 mb-1 line-clamp-1"
            title={book.title}
          >
            {book.title}
          </h3>
          <p
            className="text-sm text-gray-600 mb-2 line-clamp-1"
            title={book.author}
          >
            {book.author}
          </p>


          {/* Price & Availability */}
          <div className="flex items-center justify-between mb-3">
            <div>
              {onSale && discountPercentage > 0 ? (
                <div className="flex items-center">
                  <span className="text-gray-400 line-through text-xs mr-1">
                    ${price.toFixed(2)}
                  </span>
                  <span className="text-red-600 font-semibold">
                    ${discountedPrice.toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className="text-gray-900 font-semibold">
                  ${price.toFixed(2)}
                </span>
              )}
            </div>

            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                inStock
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {inStock ? "In Stock" : "Out of Stock"}
            </span>
          </div>
        </div>
      </Link>

      {/* Add to cart button */}
      {inStock ? (
        <button
          onClick={handleAddToCart}
          className="w-full py-2 bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center"
        >
          <FiShoppingCart className="w-3.5 h-3.5 mr-1.5" />
          Add to Cart
        </button>
      ) : (
        <button
          className="w-full py-2 bg-gray-200 text-gray-500 text-sm font-medium cursor-not-allowed flex items-center justify-center"
          disabled
        >
          <FiShoppingCart className="w-3.5 h-3.5 mr-1.5" />
          Out of Stock
        </button>
      )}
    </div>
  );
};

export default BookCard;
