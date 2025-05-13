// src/pages/WhitelistPage.jsx
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import {
  AlertCircle,
  ArrowRight,
  BookmarkPlus,
  BookOpen,
  Heart,
  ShoppingCart,
  Star,
  Trash2,
  TrendingDown,
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
          <div className="bg-gray-200 rounded-2xl h-64 mb-4"></div>
          <div className="bg-gray-200 h-5 rounded-full w-3/4 mb-3"></div>
          <div className="bg-gray-200 h-4 rounded-full w-1/2 mb-3"></div>
          <div className="bg-gray-200 h-8 rounded-full w-1/3 mb-3"></div>
          <div className="bg-gray-200 h-10 rounded-lg w-full"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <AnnouncementBanner />
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-red-50 via-pink-50 to-red-50 py-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute transform -rotate-12 -left-10 top-10">
            <Heart className="w-64 h-64 text-red-500" strokeWidth={0.4} />
          </div>
          <div className="absolute transform rotate-12 -right-10 bottom-10">
            <Heart className="w-64 h-64 text-red-500" strokeWidth={0.4} />
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-xl mb-8 transform transition-transform hover:scale-105 hover:rotate-6">
              <Heart className="w-12 h-12 text-red-500 fill-current" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              My Wishlist
            </h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
              Keep track of books you love and want to read. Add them to cart
              when you're ready to purchase.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="mb-4 sm:mb-0 flex items-center">
            <Heart className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-gray-700 font-medium">
              {pagination.totalCount}{" "}
              {pagination.totalCount === 1 ? "book" : "books"} in your wishlist
            </p>
          </div>
          <Link
            to="/books"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-700 hover:to-red-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <BookOpen className="w-5 h-5" />
            Browse More Books
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-8 py-6 rounded-xl flex items-center justify-between shadow-md">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 mr-3 text-red-500" />
              <span className="font-medium">{error}</span>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="text-red-600 hover:text-red-700 font-medium bg-white px-4 py-2 rounded-lg hover:shadow-md transition-all border border-red-200"
            >
              Try again
            </button>
          </div>
        ) : whitelist.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-2xl mx-auto border border-gray-100">
            <div className="inline-flex items-center justify-center w-28 h-28 bg-red-50 rounded-full mb-8 transform transition-all duration-500 hover:scale-110 hover:rotate-6">
              <Heart className="w-14 h-14 text-red-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Your wishlist is empty
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
              Start adding books you love to your wishlist. You can review them
              later and add to cart when ready.
            </p>
            <Link
              to="/books"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:from-red-700 hover:to-red-600 transition-all shadow-lg hover:shadow-xl font-medium transform hover:-translate-y-0.5"
            >
              <BookmarkPlus className="w-5 h-5" />
              Browse Books
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
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
                    className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col border border-gray-100 transform hover:-translate-y-1"
                  >
                    <Link
                      to={`/books/${item.bookId}`}
                      className="block relative"
                    >
                      <div className="relative aspect-[2/3] bg-gray-100 overflow-hidden">
                        {/* Badges */}
                        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                          {item.onSale && (
                            <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                              ON SALE
                            </span>
                          )}
                          {hasDiscount && (
                            <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-green-600 to-green-500 text-white text-xs font-bold rounded-full shadow-lg">
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
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                        />

                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
                          <span className="font-medium">View Details</span>
                        </div>
                      </div>
                    </Link>

                    <div className="p-6 flex flex-col flex-grow">
                      <Link to={`/books/${item.bookId}`} className="block mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-red-600 transition-colors">
                          {item.title}
                        </h3>
                      </Link>
                      <p className="text-gray-600 text-sm mb-3">
                        by {item.author}
                      </p>

                      {/* Rating if available */}
                      {item.rating && (
                        <div className="flex items-center gap-2 mb-4">
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
                      <div className="mb-6">
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
                          <div className="flex items-center gap-1 text-sm text-green-600 font-medium mt-2 bg-green-50 px-2 py-1 rounded-lg inline-block">
                            <TrendingDown className="w-4 h-4" />
                            Save ${(item.price - discountedPrice).toFixed(2)}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-auto flex gap-3">
                        <button
                          onClick={() =>
                            handleAddToCart(item.bookId, item.title)
                          }
                          disabled={
                            !item.isAvailable || addingToCartId === item.bookId
                          }
                          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                            item.isAvailable
                              ? "bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600 shadow-md hover:shadow-lg"
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
                          className="p-3 border-2 border-gray-300 rounded-lg hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-all group"
                          title="Remove from wishlist"
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
              <div className="mt-16 flex justify-center">
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
