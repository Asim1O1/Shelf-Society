import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

const BookFilters = ({ filters, onFilterChange }) => {
  const [genres, setGenres] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [localFilters, setLocalFilters] = useState(filters);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Fetch genres and authors for filter options
    const fetchFilterOptions = async () => {
      try {
        const response = await axiosInstance.get("/books?pageSize=100");
        if (response.data.success) {
          const books = response.data.data.items;

          // Extract unique genres
          const uniqueGenres = [
            ...new Set(books.map((book) => book.genre)),
          ].filter(Boolean);
          setGenres(uniqueGenres.sort());

          // Extract unique authors (limited to prevent too many options)
          const uniqueAuthors = [
            ...new Set(books.map((book) => book.author)),
          ].filter(Boolean);
          setAuthors(uniqueAuthors.sort().slice(0, 20)); // Limit to top 20 authors
        }
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    };

    fetchFilterOptions();
  }, []);

  // Update local state when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters({
      ...localFilters,
      [name]: value,
    });
  };

  // Apply filters when form is submitted
  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange(localFilters);
    setIsExpanded(false);
  };

  // Clear all filters
  const handleClearFilters = () => {
    const clearedFilters = {
      ...filters,
      search: "",
      genre: "",
      author: "",
      minPrice: "",
      maxPrice: "",
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  // Get active filter count (excluding search)
  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.genre) count++;
    if (localFilters.author) count++;
    if (localFilters.minPrice || localFilters.maxPrice) count++;
    return count;
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200/50 overflow-hidden">
      {/* Mobile Filters Toggle Button */}
      <div className="lg:hidden p-3 border-b border-gray-100">
        <button
          className="w-full flex items-center justify-between p-2 font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-controls="filter-panel"
        >
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
            <span>Filters</span>
            {getActiveFilterCount() > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                {getActiveFilterCount()}
              </span>
            )}
          </div>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
              isExpanded ? "transform rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Filter Form - Horizontal Layout */}
      <div
        id="filter-panel"
        className={`${!isExpanded && "hidden lg:block"} p-4`}
      >
        <form onSubmit={handleSubmit}>
          {/* Desktop Header with Clear button */}
          <div className="hidden lg:flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              Refine Results
            </h2>
            {getActiveFilterCount() > 0 && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-sm text-red-600 hover:text-red-800 flex items-center transition-colors focus:outline-none focus:underline"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Clear all filters
              </button>
            )}
          </div>

          {/* Filters in a horizontal layout */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:space-x-4 space-y-4 lg:space-y-0">
            {/* Search Field */}
            <div className="flex-1 min-w-0">
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Search
              </label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type="text"
                  id="search"
                  name="search"
                  value={localFilters.search || ""}
                  onChange={handleInputChange}
                  placeholder="Title, author, ISBN..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-colors"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Genre */}
            <div className="flex-1 min-w-0">
              <label
                htmlFor="genre"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Genre
              </label>
              <div className="relative">
                <select
                  id="genre"
                  name="genre"
                  value={localFilters.genre || ""}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 bg-white appearance-none transition-colors"
                >
                  <option value="">All Genres</option>
                  {genres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Author */}
            <div className="flex-1 min-w-0">
              <label
                htmlFor="author"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Author
              </label>
              <div className="relative">
                <select
                  id="author"
                  name="author"
                  value={localFilters.author || ""}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 bg-white appearance-none transition-colors"
                >
                  <option value="">All Authors</option>
                  {authors.map((author) => (
                    <option key={author} value={author}>
                      {author}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Price Range */}
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Range
              </label>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-500 text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="minPrice"
                    name="minPrice"
                    min="0"
                    step="0.01"
                    value={localFilters.minPrice || ""}
                    onChange={handleInputChange}
                    placeholder="Min"
                    className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-colors"
                  />
                </div>
                <span className="text-gray-500">-</span>
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-500 text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="maxPrice"
                    name="maxPrice"
                    min="0"
                    step="0.01"
                    value={localFilters.maxPrice || ""}
                    onChange={handleInputChange}
                    placeholder="Max"
                    className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <div className="flex-shrink-0">
              <button
                type="submit"
                className="bg-gradient-to-r from-red-600 to-red-700 text-white py-2.5 px-5 rounded-lg hover:from-red-700 hover:to-red-800 transition duration-200 font-medium flex justify-center items-center shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 h-11 lg:mt-6"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                Apply
              </button>
            </div>
          </div>

          {/* Mobile Clear All Button */}
          <div className="mt-4 lg:hidden">
            {getActiveFilterCount() > 0 && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-sm text-red-600 hover:text-red-800 w-full text-center py-2 border border-gray-200 rounded-lg font-medium transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>

          {/* Active Filters Tags */}
          {getActiveFilterCount() > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500 mr-1 self-center">
                Active filters:
              </span>

              {localFilters.genre && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 transition-colors">
                  Genre: {localFilters.genre}
                  <button
                    onClick={() => {
                      const updated = { ...localFilters, genre: "" };
                      setLocalFilters(updated);
                      onFilterChange(updated);
                    }}
                    className="ml-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label={`Remove genre filter: ${localFilters.genre}`}
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              )}

              {localFilters.author && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 transition-colors">
                  Author: {localFilters.author}
                  <button
                    onClick={() => {
                      const updated = { ...localFilters, author: "" };
                      setLocalFilters(updated);
                      onFilterChange(updated);
                    }}
                    className="ml-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label={`Remove author filter: ${localFilters.author}`}
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              )}

              {(localFilters.minPrice || localFilters.maxPrice) && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 transition-colors">
                  Price:{" "}
                  {localFilters.minPrice ? `$${localFilters.minPrice}` : "$0"} -{" "}
                  {localFilters.maxPrice ? `$${localFilters.maxPrice}` : "Any"}
                  <button
                    onClick={() => {
                      const updated = {
                        ...localFilters,
                        minPrice: "",
                        maxPrice: "",
                      };
                      setLocalFilters(updated);
                      onFilterChange(updated);
                    }}
                    className="ml-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label="Remove price filter"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default BookFilters;
