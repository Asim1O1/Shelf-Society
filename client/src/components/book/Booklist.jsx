import React from "react";
import BookCard from "./BookCard";

const BookList = ({
  books = [],
  isLoading = false,
  error = null,
  title,
  viewAll,
  emptyMessage = "No books available at the moment",
  className = "",
}) => {
  // Loading state
  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        {title && (
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              {title}
            </h2>
          </div>
        )}
        <div className="flex justify-center items-center py-20">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-red-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`w-full ${className}`}>
        {title && (
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              {title}
            </h2>
          </div>
        )}
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 text-center shadow-sm">
          <svg
            className="w-12 h-12 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="text-xl font-medium text-gray-900 mb-3">
            Unable to load books
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!books || books.length === 0) {
    return (
      <div className={`w-full ${className}`}>
        {title && (
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              {title}
            </h2>
          </div>
        )}
        <div className="bg-gray-50 border border-gray-200/50 rounded-xl p-10 text-center shadow-sm">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <h3 className="text-xl font-medium text-gray-900 mb-3">
            {emptyMessage}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Try adjusting your filters or check back later for new additions.
          </p>
        </div>
      </div>
    );
  }

  // Main content with books grid
  return (
    <div className={`w-full ${className}`}>
      {/* Header with title and optional "View all" link */}
      {(title || viewAll) && (
        <div className="flex items-center justify-between mb-8">
          {title && (
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              {title}
            </h2>
          )}

          {viewAll && (
            <a
              href={viewAll.url}
              className="flex items-center text-red-600 hover:text-red-700 font-medium transition-colors group"
            >
              {viewAll.text || "View all"}
              <svg
                className="w-5 h-5 ml-1 transform transition-transform duration-300 group-hover:translate-x-1"
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
            </a>
          )}
        </div>
      )}

      {/* Books grid with refined spacing */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8 sm:gap-x-6 md:gap-x-8">
        {books.map((book) => (
          <div
            key={book.id || book._id}
            className="transform transition-all duration-300 will-change-transform"
          >
            <BookCard book={book} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookList;
