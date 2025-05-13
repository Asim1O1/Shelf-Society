import { ArrowRight, Clock, Heart, ShoppingCart, Star } from "lucide-react";
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
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <div className="aspect-[2/3] bg-gray-200 animate-pulse"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md mx-auto text-center">
            <p className="font-medium">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (saleBooks.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-light text-gray-900 mb-2">
              Flash Sale
            </h2>
            <p className="text-gray-500 font-light">Limited time offers</p>
          </div>
          <Link
            to="/books?filter=sale"
            className="text-red-600 hover:text-red-700 font-light flex items-center gap-2 group"
          >
            View all deals
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
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
                <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden h-full flex flex-col">
                  {/* Book Image Container */}
                  <div className="relative aspect-[2/3] bg-gray-100">
                    {/* Sale Badge */}
                    <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
                      <span className="bg-red-500 text-white px-2 py-1 font-medium text-xs rounded">
                        SALE
                      </span>
                      {hasDiscount && (
                        <span className="bg-green-600 text-white px-2 py-1 font-medium text-xs rounded">
                          -{book.discountPercentage}%
                        </span>
                      )}
                    </div>

                    {/* Book Cover */}
                    <img
                      src={
                        book.imageUrl ||
                        "https://via.placeholder.com/300x450?text=No+Image"
                      }
                      alt={book.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>

                  {/* Book Details */}
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-normal text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-red-600 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-1 mb-3">
                      {book.author}
                    </p>

                    {/* Rating */}
                    {book.rating > 0 && (
                      <div className="flex items-center gap-1 mb-3">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-500">
                          {book.rating.toFixed(1)}
                        </span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="mt-auto">
                      {hasDiscount ? (
                        <div>
                          <span className="text-lg font-medium text-red-600">
                            ${discountedPrice}
                          </span>
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ${book.price.toFixed(2)}
                          </span>
                          <div className="text-xs text-green-600 font-medium mt-1">
                            Save ${(book.price - discountedPrice).toFixed(2)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-lg font-medium text-gray-900">
                          ${book.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default OnSaleBooks;
