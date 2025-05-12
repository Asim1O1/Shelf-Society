import { Clock, Heart, ShoppingCart, Star, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

const OnSaleBooks = () => {
  const [saleBooks, setSaleBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSaleBooks = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(
          "/books?onSale=true&pageSize=6"
        );

        if (response.data.success) {
          const onSaleItems = response.data.data.items.filter(
            (book) => book.onSale === true
          );
          setSaleBooks(onSaleItems);
        }
      } catch (err) {
        console.error("Error fetching on-sale books:", err);
        setError("Failed to load sale books. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSaleBooks();
  }, []);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="py-16 bg-gradient-to-b from-red-50 to-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="ml-4 h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="h-64 bg-gray-200 animate-pulse"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="py-16 bg-gradient-to-b from-red-50 to-white">
        <div className="container mx-auto px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md mx-auto text-center">
            <p className="font-semibold">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (saleBooks.length === 0) {
    return null;
  }

  return (
    <div className="py-16 bg-gradient-to-b from-red-50 to-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-100 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-100 rounded-full opacity-20 blur-3xl"></div>

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <h2 className="text-3xl font-bold text-gray-900">Flash Sale</h2>
            <div className="ml-4 flex items-center bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse">
              <Clock className="w-4 h-4 mr-2" />
              LIMITED TIME
            </div>
          </div>
          <Link
            to="/books?filter=sale"
            className="text-red-600 hover:text-red-700 font-medium flex items-center group"
          >
            View All Deals
            <svg
              className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {saleBooks.map((book) => {
            const hasDiscount =
              book.discountPercentage !== null && book.discountPercentage > 0;
            const discountedPrice = hasDiscount
              ? (
                  book.price -
                  (book.price * book.discountPercentage) / 100
                ).toFixed(2)
              : null;

            return (
              <Link to={`/books/${book.id}`} key={book.id} className="group">
                <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
                  {/* Book Image Container */}
                  <div className="relative pt-[140%] bg-gray-100">
                    {/* Sale Badge */}
                    <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
                      <div className="bg-red-500 text-white px-3 py-1 font-bold text-xs rounded-full shadow-md animate-bounce">
                        ON SALE
                      </div>
                      {hasDiscount && (
                        <div className="bg-green-500 text-white px-3 py-1 font-bold text-xs rounded-full shadow-md">
                          -{book.discountPercentage}%
                        </div>
                      )}
                    </div>

                    {/* Wishlist Button */}
                    <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
                    </button>

                    {/* Book Cover */}
                    <img
                      src={
                        book.imageUrl ||
                        "https://via.placeholder.com/300x450?text=No+Image"
                      }
                      alt={book.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>

                  {/* Book Details */}
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg font-semibold line-clamp-2 mb-1 group-hover:text-red-600 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-1">
                      {book.author}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center mb-3">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < 4 ? "fill-current" : ""}`}
                          />
                        ))}
                      </div>
                      <span className="text-gray-500 text-xs ml-2">(4.5)</span>
                    </div>

                    {/* Price and Actions */}
                    <div className="mt-auto">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          {hasDiscount ? (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500 line-through text-sm">
                                ${book.price.toFixed(2)}
                              </span>
                              <span className="text-red-600 font-bold text-lg">
                                ${discountedPrice}
                              </span>
                            </div>
                          ) : (
                            <span className="font-bold text-lg">
                              ${book.price.toFixed(2)}
                            </span>
                          )}
                          {hasDiscount && (
                            <div className="flex items-center text-green-600 text-xs font-semibold">
                              <TrendingDown className="w-3 h-3 mr-1" />
                              Save ${(book.price - discountedPrice).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Add to Cart Button */}
                      <button className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center justify-center group">
                        <ShoppingCart className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View All Books Button */}
        <div className="mt-12 text-center">
          <Link
            to="/books"
            className="inline-block px-8 py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-medium rounded-full hover:from-gray-900 hover:to-black transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Explore All Books
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OnSaleBooks;
