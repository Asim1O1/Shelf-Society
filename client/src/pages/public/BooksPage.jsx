import { Filter, Grid, List, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import BookFilters from "../../components/book/BookFilter";
import BookList from "../../components/book/BookList";
import AnnouncementBanner from "../../components/common/AnnouncementBanner";
import Navbar from "../../components/common/NavBar";
import Pagination from "../../components/common/Pagination";
import axiosInstance from "../../utils/axiosInstance";

const BooksPage = () => {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 12,
    totalCount: 0,
  });

  const [filters, setFilters] = useState({
    search: "",
    genre: "",
    author: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "title_asc",
  });

  // Get query parameters from URL on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const newFilters = { ...filters };

    if (searchParams.get("search"))
      newFilters.search = searchParams.get("search");
    if (searchParams.get("genre")) newFilters.genre = searchParams.get("genre");
    if (searchParams.get("author"))
      newFilters.author = searchParams.get("author");
    if (searchParams.get("sortBy"))
      newFilters.sortBy = searchParams.get("sortBy");

    setFilters(newFilters);
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [pagination.pageNumber, filters]);

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("pageNumber", pagination.pageNumber);
      params.append("pageSize", pagination.pageSize);

      // Add filters if they exist
      if (filters.search) params.append("search", filters.search);
      if (filters.genre) params.append("genre", filters.genre);
      if (filters.author) params.append("author", filters.author);
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);

      const response = await axiosInstance.get(`/books?${params.toString()}`);
      if (response.data.success) {
        setBooks(response.data.data.items);
        setPagination({
          ...pagination,
          totalCount: response.data.data.totalCount,
        });
      }
    } catch (err) {
      console.error("Error fetching books:", err);
      setError("Failed to load books. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPageNumber) => {
    setPagination({
      ...pagination,
      pageNumber: newPageNumber,
    });
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // Reset to first page when filters change
    setPagination({
      ...pagination,
      pageNumber: 1,
    });
  };

  const clearAllFilters = () => {
    handleFilterChange({
      search: "",
      genre: "",
      author: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "title_asc",
    });
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 rounded-xl h-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );

  const activeFilterCount = Object.values(filters).filter(
    (f) => f && f !== "title_asc"
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <AnnouncementBanner />
      <Navbar />

      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Browse Books
              </h1>
              <p className="text-gray-600 mt-2">
                Showing{" "}
                {Math.min(
                  (pagination.pageNumber - 1) * pagination.pageSize + 1,
                  pagination.totalCount
                )}{" "}
                -{" "}
                {Math.min(
                  pagination.pageNumber * pagination.pageSize,
                  pagination.totalCount
                )}{" "}
                of {pagination.totalCount} books
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded ${
                    viewMode === "grid" ? "bg-white shadow-sm" : ""
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded ${
                    viewMode === "list" ? "bg-white shadow-sm" : ""
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <label className="text-gray-600 font-medium">Sort by:</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    handleFilterChange({ ...filters, sortBy: e.target.value })
                  }
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                >
                  <option value="title_asc">Title (A-Z)</option>
                  <option value="title_desc">Title (Z-A)</option>
                  <option value="price_asc">Price (Low to High)</option>
                  <option value="price_desc">Price (High to Low)</option>
                  <option value="date_desc">Newest First</option>
                  <option value="rating_desc">Highest Rated</option>
                </select>
              </div>

              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="md:hidden flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Filter className="w-5 h-5" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-white text-red-600 rounded-full px-2 py-1 text-xs font-semibold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-gray-600">Active filters:</span>
              {filters.search && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
                  Search: {filters.search}
                  <button
                    onClick={() =>
                      handleFilterChange({ ...filters, search: "" })
                    }
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              )}
              {filters.genre && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
                  Genre: {filters.genre}
                  <button
                    onClick={() =>
                      handleFilterChange({ ...filters, genre: "" })
                    }
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              )}
              {filters.author && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
                  Author: {filters.author}
                  <button
                    onClick={() =>
                      handleFilterChange({ ...filters, author: "" })
                    }
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
                  Price: ${filters.minPrice || "0"} - ${filters.maxPrice || "∞"}
                  <button
                    onClick={() =>
                      handleFilterChange({
                        ...filters,
                        minPrice: "",
                        maxPrice: "",
                      })
                    }
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden md:block md:w-1/4 lg:w-1/5">
            <div className="sticky top-4">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center justify-between">
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="bg-red-100 text-red-600 rounded-full px-2 py-1 text-xs font-semibold">
                      {activeFilterCount}
                    </span>
                  )}
                </h2>
                <BookFilters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                />
              </div>
            </div>
          </aside>

          {/* Mobile Filters Sidebar */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={() => setShowMobileFilters(false)}
              ></div>
              <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Filters
                    </h2>
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <BookFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1">
            {isLoading ? (
              <LoadingSkeleton />
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center justify-between">
                <span>{error}</span>
                <button
                  onClick={fetchBooks}
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  Try again
                </button>
              </div>
            ) : books.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  No books found
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  We couldn't find any books matching your criteria. Try
                  adjusting your filters or search terms.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <BookList books={books} viewMode={viewMode} />

                {/* Pagination */}
                {pagination.totalCount > pagination.pageSize && (
                  <div className="mt-12 flex justify-center">
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
          </main>
        </div>
      </div>
    </div>
  );
};

export default BooksPage;
