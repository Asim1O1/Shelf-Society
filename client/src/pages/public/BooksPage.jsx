import { Filter, Grid3X3, List, Search, X, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import BookFilters from "../../components/book/BookFilter";
import BookList from "../../components/book/Booklist";
import AnnouncementBanner from "../../components/common/AnnouncementBanner";
import Navbar from "../../components/common/NavBar";
import Footer from "../../components/common/Footer";
import Pagination from "../../components/common/Pagination";
import axiosInstance from "../../utils/axiosInstance";

const BooksPage = () => {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
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

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 rounded-lg h-64 mb-4"></div>
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
    <>
    <div className="min-h-screen bg-white">
      <AnnouncementBanner />
      <Navbar />

      {/* Page Header - Minimal Design */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-7xl py-8">
          <h1 className="text-3xl font-light text-gray-900 mb-2">
            Browse Books
          </h1>
          <p className="text-gray-500 font-light">
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
      </div>

      {/* Horizontal Filter Bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="py-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange({ ...filters, search: e.target.value })
                    }
                    placeholder="Search books, authors, or ISBN..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Filter Controls */}
              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <div className="hidden md:flex items-center gap-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === "grid"
                        ? "bg-red-50 text-red-600"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                    title="Grid view"
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === "list"
                        ? "bg-red-50 text-red-600"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                    title="List view"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={filters.sortBy}
                    onChange={(e) =>
                      handleFilterChange({ ...filters, sortBy: e.target.value })
                    }
                    className="appearance-none px-4 py-2.5 pr-10 bg-white border border-gray-200 rounded-full text-gray-700 focus:outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 transition-all duration-200"
                  >
                    <option value="title_asc">Title (A-Z)</option>
                    <option value="title_desc">Title (Z-A)</option>
                    <option value="price_asc">Price (Low to High)</option>
                    <option value="price_desc">Price (High to Low)</option>
                    <option value="date_desc">Newest First</option>
                    <option value="rating_desc">Highest Rated</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>

                {/* Mobile/Desktop Filter Toggle */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all duration-200 bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>

                {/* Clear Filters */}
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
                    title="Clear all filters"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Active Filters - Minimal Style */}
            {activeFilterCount > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {filters.genre && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
                    Genre: {filters.genre}
                    <button
                      onClick={() =>
                        handleFilterChange({ ...filters, genre: "" })
                      }
                      className="hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
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
                      className="hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {(filters.minPrice || filters.maxPrice) && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
                    Price: ${filters.minPrice || "0"} - $
                    {filters.maxPrice || "∞"}
                    <button
                      onClick={() =>
                        handleFilterChange({
                          ...filters,
                          minPrice: "",
                          maxPrice: "",
                        })
                      }
                      className="hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* Mobile Filters Sidebar */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setShowMobileFilters(false)}
            ></div>
            <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-light text-gray-900">Filters</h2>
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
        <main>
          {isLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={fetchBooks}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Try again
              </button>
            </div>
          ) : books.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-light text-gray-900 mb-2">
                No books found
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                We couldn't find any books matching your criteria. Try adjusting
                your filters or search terms.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
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
      <Footer />
    </>
  );
};

export default BooksPage;
