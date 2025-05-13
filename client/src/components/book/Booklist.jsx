// src/components/book/BookList.jsx
import React from "react";
import BookCard from "./BookCard";

const BookList = ({ books, viewMode = "grid", isLoading = false }) => {
  // Loading state
  if (isLoading) {
    return (
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
        }
      >
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-100 overflow-hidden animate-pulse"
          >
            {viewMode === "grid" ? (
              <>
                <div className="aspect-[2/3] bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </>
            ) : (
              <div className="flex">
                <div className="w-24 h-36 bg-gray-200"></div>
                <div className="flex-1 p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (!books || books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <svg
          className="w-16 h-16 text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          No books found
        </h3>
        <p className="text-gray-500">
          Try adjusting your filters or search terms
        </p>
      </div>
    );
  }

  return (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4"
      }
    >
      {books.map((book) => (
        <BookCard key={book.id} book={book} viewMode={viewMode} />
      ))}
    </div>
  );
};

export default BookList;
