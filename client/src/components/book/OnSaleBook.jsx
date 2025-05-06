// src/components/book/OnSaleBooks.jsx
import React, { useEffect, useState } from "react";
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
        const response = await axiosInstance.get("/books?onSale=true&pageSize=6");
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

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-8">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="ml-4 h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="pt-[140%] bg-gray-200 animate-pulse"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">On Sale</h2>
            <div className="ml-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              LIMITED TIME
            </div>
          </div>
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (saleBooks.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <h2 className="text-3xl font-bold text-gray-900">On Sale</h2>
            <div className="ml-4 bg-red-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
              LIMITED TIME
            </div>
          </div>
          <Link
            to="/books"
            className="text-red-500 hover:text-red-600 font-medium flex items-center transition-colors"
          >
            View All Books
            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {saleBooks.map((book) => {
            const hasDiscount = book.discountPercentage !== null && book.discountPercentage > 0;
            const discountedPrice = hasDiscount
              ? (book.price - (book.price * book.discountPercentage) / 100).toFixed(2)
              : null;

            return (
              <Link
                to={`/books/${book.id}`}
                key={book.id}
                className="group block h-full"
                aria-label={`View details for ${book.title} by ${book.author}`}
              >
                <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col overflow-hidden border border-gray-100">
                  <div className="relative pt-[140%] overflow-hidden">
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1.5 font-bold text-sm z-10 rounded-full shadow-md">
                      {book.discountPercentage}% OFF
                    </div>
                    <div className="absolute inset-0 bg-gray-100">
                      <img
                        src={book.imageUrl || "https://via.placeholder.com/300x450?text=No+Image"}
                        alt={book.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  <div className="p-4 flex flex-col flex-grow">
                    <div className="mb-2">
                      <h3 className="text-lg font-semibold line-clamp-2 text-gray-900 group-hover:text-red-600 transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">{book.author}</p>
                    </div>

                    <div className="mt-auto">
                      {hasDiscount ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400 line-through text-sm">
                            ${book.price.toFixed(2)}
                          </span>
                          <span className="text-red-600 font-bold text-lg">
                            ${discountedPrice}
                          </span>
                        </div>
                      ) : (
                        <span className="font-bold text-lg text-gray-900">
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
