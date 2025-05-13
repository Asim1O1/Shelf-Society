// src/components/book/BookCard.jsx
import { Heart, Star } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";

const BookCard = ({ book, viewMode = "grid" }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const hasDiscount =
    book.discountPercentage !== null && book.discountPercentage > 0;

  const discountedPrice = hasDiscount
    ? (book.price - (book.price * book.discountPercentage) / 100).toFixed(2)
    : null;

  const handleAddToWhitelist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/books/${book.id}` } });
      return;
    }

    setIsWishlisted(!isWishlisted);
    console.log("Toggle whitelist:", book.id);
  };

  // List View Card - Minimal horizontal layout
  if (viewMode === "list") {
    return (
      <Link to={`/books/${book.id}`}>
        <div className="group bg-white rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden flex">
          {/* Image */}
          <div className="relative w-24 h-36 bg-gray-100 flex-shrink-0">
            {book.onSale && (
              <span className="absolute top-1 left-1 z-10 px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded">
                SALE
              </span>
            )}
            <img
              src={
                book.imageUrl ||
                "https://via.placeholder.com/150x225?text=No+Image"
              }
              alt={book.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex-1 p-4 flex">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1 group-hover:text-red-600 transition-colors line-clamp-1">
                {book.title}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{book.author}</p>

              {/* Rating */}
              {book.rating > 0 && (
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(book.rating) ? "fill-current" : ""
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    {book.rating.toFixed(1)} ({book.reviewCount || 0})
                  </span>
                </div>
              )}
            </div>

            {/* Price and Actions */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                {hasDiscount ? (
                  <>
                    <div className="text-lg font-medium text-red-600">
                      ${discountedPrice}
                    </div>
                    <div className="text-sm text-gray-500 line-through">
                      ${book.price.toFixed(2)}
                    </div>
                  </>
                ) : (
                  <div className="text-lg font-medium text-gray-900">
                    ${book.price.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid View Card - Minimal design
  return (
    <Link to={`/books/${book.id}`}>
      <div className="group bg-white rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden h-full flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-[2/3] bg-gray-100 overflow-hidden">
          {/* Badges */}
          {(book.onSale || hasDiscount) && (
            <div className="absolute top-2 left-2 z-10 flex gap-2">
              {book.onSale && (
                <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded">
                  SALE
                </span>
              )}
              {hasDiscount && (
                <span className="px-2 py-1 bg-green-600 text-white text-xs font-medium rounded">
                  -{book.discountPercentage}%
                </span>
              )}
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleAddToWhitelist}
            className={`absolute top-2 right-2 p-1.5 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 ${
              isWishlisted
                ? "bg-red-500 text-white"
                : "bg-white/90 text-gray-700 hover:bg-red-50 hover:text-red-500"
            } shadow-sm`}
          >
            <Heart
              className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`}
            />
          </button>

          {/* Book Cover */}
          <img
            src={
              book.imageUrl ||
              "https://via.placeholder.com/300x450?text=No+Image"
            }
            alt={book.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Book Details */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-red-600 transition-colors">
            {book.title}
          </h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-1">
            {book.author}
          </p>

          {/* Rating */}
          {book.rating > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(book.rating) ? "fill-current" : ""
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                {book.rating.toFixed(1)}
              </span>
            </div>
          )}

          {/* Price and Action */}
          <div className="mt-auto">
            <div className="flex items-end justify-between mb-3">
              {hasDiscount ? (
                <div>
                  <span className="text-xl font-medium text-red-600">
                    ${discountedPrice}
                  </span>
                  <span className="text-sm text-gray-500 line-through ml-2">
                    ${book.price.toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className="text-xl font-medium text-gray-900">
                  ${book.price.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;
