import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import useBookStore from "../../stores/useBookStore";
import Navbar from "../../components/common/NavBar";
import Footer from "../../components/common/Footer";
import BookImage from "./BookImage"; // Import our new component

const BooksListingPage = () => {
  const {
    books = [], // Provide default empty array
    pagination,
    filters,
    isLoading,
    error,
    getBooks,
    setFilters,
    setPagination,
    resetFilters,
  } = useBookStore();

  useEffect(() => {
    // Log the books data for debugging
    console.log("BooksListingPage books:", books);
    getBooks();
  }, [getBooks, pagination.pageNumber, pagination.pageSize, filters]);

  const handleSearchChange = (e) => {
    setFilters({ search: e.target.value });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ [name]: value });
  };

  const handlePageChange = (newPage) => {
    setPagination({ pageNumber: newPage });
  };

  const handleClearFilters = () => {
    resetFilters();
  };

  // Function to format price with two decimal places
  const formatPrice = (price) => {
    return parseFloat(price).toFixed(2);
  };

  // Function to determine book format display text
  const getFormatDisplayText = (formatValue) => {
    if (formatValue === "Hardcover") return "Hardcover";
    if (formatValue === "Paperback") return "Paperback";
    if (formatValue === "Ebook") return "Ebook";
    return "Unknown";
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-red-600 text-white p-8 rounded-lg mb-8">
          <h1 className="text-4xl font-bold mb-2">Explore our collection</h1>
          <h2 className="text-3xl mb-4">
            of <span className="text-red-300">top quality</span> books for all
            readers
          </h2>
          <p className="text-xl">
            Browse by genre, author, or special promotions!
          </p>

          <div className="mt-6 flex">
            <input
              type="text"
              placeholder="Search for your next favorite book"
              className="p-3 px-4 rounded-l-lg w-full text-gray-800 focus:outline-none"
              value={filters.search || ""}
              onChange={handleSearchChange}
            />
            <button
              className="bg-red-700 text-white px-6 py-3 rounded-r-lg hover:bg-red-800 transition flex items-center"
              onClick={() => getBooks()}
            >
              Go
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
              #Fiction
            </span>
            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
              #Biography
            </span>
            <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
              #Science
            </span>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="w-full md:w-auto">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Genre
              </label>
              <select
                name="genre"
                className="w-full p-2 border rounded"
                value={filters.genre || ""}
                onChange={handleFilterChange}
              >
                <option value="">All Genres</option>
                <option value="fiction">Fiction</option>
                <option value="non-fiction">Non-Fiction</option>
                <option value="sci-fi">Science Fiction</option>
                <option value="mystery">Mystery</option>
                <option value="biography">Biography</option>
              </select>
            </div>

            <div className="w-full md:w-auto">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Author
              </label>
              <select
                name="author"
                className="w-full p-2 border rounded"
                value={filters.author || ""}
                onChange={handleFilterChange}
              >
                <option value="">All Authors</option>
                <option value="j-k-rowling">J.K. Rowling</option>
                <option value="stephen-king">Stephen King</option>
                <option value="james-clear">James Clear</option>
                <option value="michelle-obama">Michelle Obama</option>
              </select>
            </div>

            <div className="w-full md:w-auto">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Language
              </label>
              <select
                name="language"
                className="w-full p-2 border rounded"
                value={filters.language || ""}
                onChange={handleFilterChange}
              >
                <option value="">All Languages</option>
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
              </select>
            </div>

            <div className="w-full md:w-auto">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Sort By
              </label>
              <select
                name="sortBy"
                className="w-full p-2 border rounded"
                value={filters.sortBy || ""}
                onChange={handleFilterChange}
              >
                <option value="">Relevance</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="title_asc">Title: A to Z</option>
                <option value="date_desc">Newest First</option>
                <option value="rating_desc">Highest Rated</option>
              </select>
            </div>

            <div className="w-full md:w-auto flex items-end">
              <button
                className="p-2 text-red-600 border border-red-600 rounded hover:bg-red-50 transition"
                onClick={handleClearFilters}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Books Grid */}
        {isLoading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6">
              {books && books.length > 0 ? "Available Books" : "No books found"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {books &&
                books.map((book) => (
                  <Link
                    to={`/books/${book.id}`}
                    key={book.id || book._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition group"
                  >
                    <div className="h-64 bg-gray-200 overflow-hidden">
                      {/* Using our new BookImage component */}
                      <BookImage
                        book={book}
                        className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400"
                        imgClassName="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        altText={book.title}
                      />
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-1 text-gray-800 line-clamp-1">
                        {book.title}
                      </h3>
                      <p className="text-gray-600 mb-2">{book.author}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-red-600">
                          ${formatPrice(book.price)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {getFormatDisplayText(book.format)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>

            {/* Pagination */}
            {books && books.length > 0 && pagination && (
              <div className="flex justify-center mt-8">
                <div className="flex space-x-1">
                  <button
                    disabled={pagination.pageNumber === 1}
                    onClick={() => handlePageChange(pagination.pageNumber - 1)}
                    className={`px-4 py-2 rounded ${
                      pagination.pageNumber === 1
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-white text-red-600 hover:bg-red-50"
                    }`}
                  >
                    Previous
                  </button>

                  {/* Page numbers */}
                  {pagination.totalCount &&
                    Array.from({
                      length: Math.ceil(
                        pagination.totalCount / pagination.pageSize
                      ),
                    }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handlePageChange(index + 1)}
                        className={`px-4 py-2 rounded ${
                          pagination.pageNumber === index + 1
                            ? "bg-red-600 text-white"
                            : "bg-white text-red-600 hover:bg-red-50"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}

                  <button
                    disabled={
                      !pagination.totalCount ||
                      pagination.pageNumber ===
                        Math.ceil(pagination.totalCount / pagination.pageSize)
                    }
                    onClick={() => handlePageChange(pagination.pageNumber + 1)}
                    className={`px-4 py-2 rounded ${
                      !pagination.totalCount ||
                      pagination.pageNumber ===
                        Math.ceil(pagination.totalCount / pagination.pageSize)
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-white text-red-600 hover:bg-red-50"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default BooksListingPage;
