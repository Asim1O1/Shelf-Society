// src/pages/BooksPage.jsx
import React, { useEffect, useState } from "react";
import BookFilters from "../../components/book/BookFilter";
import BookList from "../../components/book/Booklist";
import AnnouncementBanner from "../../components/common/AnnouncementBanner";
import Navbar from "../../components/common/NavBar";
import Pagination from "../../components/common/Pagination";
import axiosInstance from "../../utils/axiosInstance";

/**
 * Custom hook for managing book filters and pagination
 */
const useBookFilters = () => {
  const [filters, setFilters] = useState({
    search: "",
    genre: "",
    author: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "title_asc",
  });

  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 12,
    totalCount: 0,
  });

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, pageNumber: 1 }));
  };

  const handlePageChange = (newPageNumber) => {
    setPagination(prev => ({ ...prev, pageNumber: newPageNumber }));
    window.scrollTo(0, 0);
  };

  return {
    filters,
    pagination,
    handleFilterChange,
    handlePageChange,
    setPagination,
  };
};

/**
 * Component for displaying loading state
 */
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
  </div>
);

/**
 * Component for displaying error state
 */
const ErrorMessage = ({ message }) => (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
    {message}
  </div>
);

/**
 * Component for displaying empty state
 */
const EmptyState = ({ onClearFilters }) => (
  <div className="bg-white rounded-lg shadow p-8 text-center">
    <h3 className="text-xl font-semibold mb-2">No books found</h3>
    <p className="text-gray-600 mb-4">
      We couldn't find any books matching your criteria.
    </p>
    <button
      onClick={onClearFilters}
      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
    >
      Clear Filters
    </button>
  </div>
);

/**
 * Component for sort controls
 */
const SortControls = ({ value, onChange }) => (
  <div className="flex items-center">
    <span className="text-gray-600 mr-2">Sort by:</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-red-400"
    >
      <option value="title_asc">Title (A-Z)</option>
      <option value="title_desc">Title (Z-A)</option>
      <option value="price_asc">Price (Low to High)</option>
      <option value="price_desc">Price (High to Low)</option>
      <option value="date_desc">Newest First</option>
      <option value="rating_desc">Highest Rated</option>
    </select>
  </div>
);

/**
 * Main BooksPage component
 */
const BooksPage = () => {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { filters, pagination, handleFilterChange, handlePageChange, setPagination } = useBookFilters();

  useEffect(() => {
    fetchBooks();
  }, [pagination.pageNumber, filters]);

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("pageNumber", pagination.pageNumber);
      params.append("pageSize", pagination.pageSize);

      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await axiosInstance.get(`/books?${params.toString()}`);
      if (response.data.success) {
        setBooks(response.data.data.items);
        setPagination(prev => ({
          ...prev,
          totalCount: response.data.data.totalCount,
        }));
      }
    } catch (err) {
      console.error("Error fetching books:", err);
      setError("Failed to load books. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSortChange = (newSortBy) => {
    handleFilterChange({ ...filters, sortBy: newSortBy });
  };

  const handleClearFilters = () => {
    handleFilterChange({
      search: "",
      genre: "",
      author: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "title_asc",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AnnouncementBanner />
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Books</h1>
          <SortControls value={filters.sortBy} onChange={handleSortChange} />
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/4 lg:w-1/5">
            <BookFilters filters={filters} onFilterChange={handleFilterChange} />
          </div>

          <div className="md:w-3/4 lg:w-4/5">
            {isLoading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : books.length === 0 ? (
              <EmptyState onClearFilters={handleClearFilters} />
            ) : (
              <>
                <BookList books={books} />
                {pagination.totalCount > pagination.pageSize && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={pagination.pageNumber}
                      totalPages={Math.ceil(pagination.totalCount / pagination.pageSize)}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BooksPage;
