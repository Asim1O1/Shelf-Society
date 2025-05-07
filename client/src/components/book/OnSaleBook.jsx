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

  if (isLoading) {
    return (
      <div className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              On Sale
            </h2>
            <div className="ml-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
              LIMITED TIME
            </div>
          </div>
          <div className="flex justify-center">
            <div className="relative w-14 h-14">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-red-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              On Sale
            </h2>
            <div className="ml-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
              LIMITED TIME
            </div>
          </div>
          <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-lg shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't show the section if no books are on sale
  if (saleBooks.length === 0) {
    return null;
  }

  return (
    <div className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            On Sale
          </h2>
          <div className="ml-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider shadow-sm">
            LIMITED TIME
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-8 sm:gap-x-6 md:gap-x-8">
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
                <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg group-hover:translate-y-[-4px] h-full flex flex-col">
                  <div className="relative pt-[140%] overflow-hidden">
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 font-bold text-xs uppercase tracking-wider z-10 rounded-full shadow-sm">
                      ON SALE
                    </div>
                    <img
                      src={
                        book.imageUrl ||
                        "https://via.placeholder.com/300x450?text=No+Image"
                      }
                      alt={book.title}
                      className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-500 ease-in-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-red-600 transition-colors duration-200">
                      {book.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2 italic line-clamp-1">
                      {book.author}
                    </p>

                    <div className="mt-auto">
                      {hasDiscount ? (
                        <div className="flex items-center">
                          <span className="text-gray-400 line-through text-sm mr-2">
                            ${book.price.toFixed(2)}
                          </span>
                          <span className="text-red-600 font-bold">
                            ${discountedPrice}
                          </span>
                          <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            -{book.discountPercentage}%
                          </span>
                        </div>
                      ) : (
                        <span className="font-medium text-gray-900">
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

        <div className="mt-10 text-center">
          <Link
            to="/books"
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-300 transform hover:translate-y-[-2px]"
          >
            View All Books
            <svg
              className="ml-2 -mr-1 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              ></path>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OnSaleBooks;
