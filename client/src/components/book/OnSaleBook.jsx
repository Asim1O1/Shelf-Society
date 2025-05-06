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
        // Add parameters to filter books with "On Sale" flag
        // You might need to adjust this endpoint based on your API
        const response = await axiosInstance.get(
          "/books?onSale=true&pageSize=6"
        );

        if (response.data.success) {
          // Filter out books that have the "onSale" flag
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
      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">On Sale</h2>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">On Sale</h2>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
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
    <div className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">On Sale</h2>
          <div className="ml-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            LIMITED TIME
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {saleBooks.map((book) => {
            // Calculate discounted price if applicable
            const hasDiscount =
              book.discountPercentage !== null && book.discountPercentage > 0;
            const discountedPrice = hasDiscount
              ? (
                  book.price -
                  (book.price * book.discountPercentage) / 100
                ).toFixed(2)
              : null;

            return (
              <Link to={`/books/${book.id}`} key={book.id}>
                <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg h-full flex flex-col">
                  <div className="relative pt-[140%]">
                    <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 font-bold text-sm z-10">
                      ON SALE
                    </div>
                    <img
                      src={
                        book.imageUrl ||
                        "https://via.placeholder.com/300x450?text=No+Image"
                      }
                      alt={book.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg font-semibold line-clamp-2 mb-1">
                      {book.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">{book.author}</p>

                    <div className="mt-auto">
                      {hasDiscount ? (
                        <div className="flex items-center">
                          <span className="text-gray-500 line-through text-sm mr-2">
                            ${book.price.toFixed(2)}
                          </span>
                          <span className="text-red-600 font-bold">
                            ${discountedPrice}
                          </span>
                        </div>
                      ) : (
                        <span className="font-semibold">
                          ${book.price.toFixed(2)}
                        </span>
                      )}

                      {hasDiscount && (
                        <div className="text-xs text-green-600 font-semibold mt-1">
                          Save {book.discountPercentage}%
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/books"
            className="inline-block px-6 py-3 bg-red-600 text-white font-medium rounded hover:bg-red-700 transition duration-300"
          >
            View All Books
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OnSaleBooks;
