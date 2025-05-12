// src/pages/WhitelistPage.jsx
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import {
  ArrowRight,
  BookOpen,
  Heart,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import AnnouncementBanner from "../../components/common/AnnouncementBanner";
import Navbar from "../../components/common/NavBar";
import Pagination from "../../components/common/Pagination";
import useCartStore from "../../stores/useCartStore";
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

  const { addToCart } = useCartStore();
  const [removingItemId, setRemovingItemId] = useState(null);
  const [addingToCartId, setAddingToCartId] = useState(null);

  const handleAddToCart = async (bookId, title) => {
    try {
      setAddingToCartId(bookId);
      await addToCart(bookId, 1);
      toast.success(`Added "${title}" to cart`);
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error("Failed to add book to cart");
    } finally {
      setAddingToCartId(null);
    }
  };

  const handleRemoveFromWhitelist = async (itemId, title) => {
    try {
      setRemovingItemId(itemId);
      await removeFromWhitelist(itemId);
      toast.success(`Removed "${title}" from wishlist`);
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      toast.error("Failed to remove from wishlist");
    } finally {
      setRemovingItemId(null);
    }
  };

  const handlePageChange = (newPageNumber) => {
    setPagination({
      ...pagination,
      pageNumber: newPageNumber,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 rounded-2xl h-96"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <AnnouncementBanner />
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-red-50 to-pink-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-6">
              <Heart className="w-10 h-10 text-red-500 fill-current" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              My Wishlist
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Keep track of books you love and want to read. Add them to cart
              when you're ready to purchase.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 bg-white rounded-xl shadow-sm p-6">
          <div className="mb-4 sm:mb-0">
            <p className="text-gray-600">
              {pagination.totalCount}{" "}
              {pagination.totalCount === 1 ? "book" : "books"} in your wishlist
            </p>
          </div>
          <Link
            to="/books"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
          >
            <BookOpen className="w-5 h-5" />
            Browse More Books
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => window.location.reload()}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Try again
            </button>
          </div>
        ) : whitelist.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Your wishlist is empty
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start adding books you love to your wishlist. You can review them
              later and add to cart when ready.
            </p>
            <Link
              to="/books"
              className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl font-medium"
            >
              <BookOpen className="w-5 h-5" />
              Browse Books
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {whitelist.map((item) => {
                const hasDiscount =
                  item.discountPercentage && item.discountPercentage > 0;
                const discountedPrice = hasDiscount
                  ? (
                      item.price -
                      (item.price * item.discountPercentage) / 100
                    ).toFixed(2)
                  : null;

                return (
                  <div
                    key={item.id}
                    className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col"
                  >
                    <Link
                      to={`/books/${item.bookId}`}
                      className="block relative"
                    >
                      <div className="relative aspect-[2/3] bg-gray-100 overflow-hidden">
                        {/* Badges */}
                        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                          {item.onSale && (
                            <span className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full shadow-lg">
                              ON SALE
                            </span>
                          )}
                          {hasDiscount && (
                            <span className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full shadow-lg">
                              -{item.discountPercentage}%
                            </span>
                          )}
                        </div>

                        <img
                          src={
                            item.imageUrl ||
                            "https://via.placeholder.com/300x450?text=No+Image"
                          }
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    </Link>

                    <div className="p-5 flex flex-col flex-grow">
                      <Link to={`/books/${item.bookId}`} className="block mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-red-600 transition-colors">
                          {item.title}
                        </h3>
                      </Link>
                      <p className="text-gray-600 text-sm mb-2">
                        {item.author}
                      </p>

                      {/* Rating if available */}
                      {item.rating && (
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(item.rating)
                                    ? "fill-current"
                                    : ""
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            ({item.reviewCount || 0})
                          </span>
                        </div>
                      )}

                      {/* Price */}
                      <div className="mb-4">
                        {hasDiscount ? (
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-red-600">
                              ${discountedPrice}
                            </span>
                            <span className="text-gray-500 line-through">
                              ${item.price.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-2xl font-bold text-gray-900">
                            ${item.price.toFixed(2)}
                          </span>
                        )}
                        {hasDiscount && (
                          <div className="flex items-center gap-1 text-sm text-green-600 font-medium mt-1">
                            <TrendingDown className="w-4 h-4" />
                            Save ${(item.price - discountedPrice).toFixed(2)}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-auto flex gap-2">
                        <button
                          onClick={() =>
                            handleAddToCart(item.bookId, item.title)
                          }
                          disabled={
                            !item.isAvailable || addingToCartId === item.bookId
                          }
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${
                            item.isAvailable
                              ? "bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg"
                              : "bg-gray-200 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          {addingToCartId === item.bookId ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Adding...
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-4 h-4" />
                              {item.isAvailable
                                ? "Add to Cart"
                                : "Out of Stock"}
                            </>
                          )}
                        </button>

                        <button
                          onClick={() =>
                            handleRemoveFromWhitelist(item.id, item.title)
                          }
                          disabled={removingItemId === item.id}
                          className="p-2.5 border-2 border-gray-300 rounded-lg hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-all group"
                        >
                          {removingItemId === item.id ? (
                            <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 className="w-5 h-5 text-gray-600 group-hover:text-red-600" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.totalCount > pagination.pageSize && (
              <div className="mt-12 flex justify-center">
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
