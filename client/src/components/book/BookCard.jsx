// src/components/book/BookCard.jsx
import { Heart, ShoppingCart, Star, TrendingDown } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";

const BookCard = ({ book, viewMode = "grid" }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Check if book has an active discount
  const hasDiscount =
    book.discountPercentage !== null && book.discountPercentage > 0;

  // Calculate discounted price if applicable
  const discountedPrice = hasDiscount
    ? (book.price - (book.price * book.discountPercentage) / 100).toFixed(2)
    : null;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/books/${book.id}` } });
      return;
    }

    setIsAddingToCart(true);
    // Simulate API call
    setTimeout(() => {
      console.log("Add to cart:", book.id);
      setIsAddingToCart(false);
    }, 1000);
  };

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

  // Grid View Card
  if (viewMode === "grid") {
    return (
      <Link to={`/books/${book.id}`}>
        <div
          className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Image Container */}
          <div className="relative aspect-[2/3] bg-gray-100 overflow-hidden">
            {/* Badges */}
            <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
              <div className="flex flex-col gap-2">
                {book.onSale && (
                  <span className="inline-flex items-center px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                    ON SALE
                  </span>
                )}
                {hasDiscount && (
                  <span className="inline-flex items-center px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
                    -{book.discountPercentage}%
                  </span>
                )}
                {book.rating >= 4.5 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full shadow-lg">
                    <Star className="w-3 h-3 fill-current" />
                    {book.rating}
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                onClick={handleAddToWhitelist}
                className={`p-2 rounded-full transition-all duration-300 ${
                  isWishlisted
                    ? "bg-red-500 text-white"
                    : "bg-white/90 text-gray-700 hover:bg-red-50 hover:text-red-500"
                } shadow-md`}
                title="Add to Wishlist"
              >
                <Heart
                  className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`}
                />
              </button>
            </div>

            {/* Book Cover */}
            <img
              src={
                book.imageUrl ||
                "https://via.placeholder.com/300x450?text=No+Image"
              }
              alt={book.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Hover Overlay */}
            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            >
              <div className="absolute bottom-4 left-4 right-4">
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className="w-full bg-white text-gray-900 py-2 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                  {isAddingToCart ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Book Details */}
          <div className="p-4 flex flex-col flex-grow">
            <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-red-600 transition-colors">
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
                      className={`w-4 h-4 ${
                        i < Math.floor(book.rating) ? "fill-current" : ""
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">
                  ({book.reviewCount || 0})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="mt-auto">
              {hasDiscount ? (
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-red-600">
                    ${discountedPrice}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    ${book.price.toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className="text-2xl font-bold text-gray-900">
                  ${book.price.toFixed(2)}
                </span>
              )}

              {hasDiscount && (
                <div className="flex items-center gap-1 text-sm text-green-600 font-medium mt-1">
                  <TrendingDown className="w-4 h-4" />
                  Save ${(book.price - discountedPrice).toFixed(2)}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // List View Card
  return (
    <Link to={`/books/${book.id}`}>
      <div className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex">
        {/* Image */}
        <div className="relative w-32 bg-gray-100">
          {book.onSale && (
            <span className="absolute top-2 left-2 z-10 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
              SALE
            </span>
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

        {/* Details */}
        <div className="flex-1 p-4 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 mb-1 group-hover:text-red-600 transition-colors">
                {book.title}
              </h3>
              <p className="text-gray-600 mb-2">{book.author}</p>

              {/* Rating */}
              {book.rating > 0 && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(book.rating) ? "fill-current" : ""
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {book.rating.toFixed(1)} ({book.reviewCount || 0} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="text-right">
              {hasDiscount ? (
                <>
                  <div className="text-2xl font-bold text-red-600">
                    ${discountedPrice}
                  </div>
                  <div className="text-sm text-gray-500 line-through">
                    ${book.price.toFixed(2)}
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    Save {book.discountPercentage}%
                  </div>
                </>
              ) : (
                <div className="text-2xl font-bold text-gray-900">
                  ${book.price.toFixed(2)}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-auto">
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              {isAddingToCart ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </>
              )}
            </button>

            <button
              onClick={handleAddToWhitelist}
              className={`p-2 rounded-lg transition-colors ${
                isWishlisted
                  ? "bg-red-100 text-red-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              title="Add to Wishlist"
            >
              <Heart
                className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;
