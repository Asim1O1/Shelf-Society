// src/components/book/BookFilters.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

const BookFilters = ({ filters, onFilterChange }) => {
  const [genres, setGenres] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [localFilters, setLocalFilters] = useState(filters);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get("/books?pageSize=100");
        if (response.data.success) {
          const books = response.data.data.items;

          // Extract unique genres
          const uniqueGenres = [...new Set(books.map((book) => book.genre))].filter(Boolean);
          setGenres(uniqueGenres.sort());

          // Extract unique authors (limited to prevent too many options)
          const uniqueAuthors = [...new Set(books.map((book) => book.author))].filter(Boolean);
          setAuthors(uniqueAuthors.sort().slice(0, 20)); // Limit to top 20 authors
        }
      } catch (error) {
        console.error("Error fetching filter options:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilterOptions();
  }, []);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters({
      ...localFilters,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange(localFilters);
  };

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

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
        <button
          type="button"
          onClick={handleClearFilters}
          className="text-sm text-gray-600 hover:text-red-500 transition-colors"
        >
          Clear all
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <div className="relative">
            <input
              type="text"
              id="search"
              name="search"
              value={localFilters.search}
              onChange={handleInputChange}
              placeholder="Title, author, ISBN..."
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all"
            />
            <svg
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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

        {/* Genre */}
        <div>
          <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-2">
            Genre
          </label>
          <select
            id="genre"
            name="genre"
            value={localFilters.genre}
            onChange={handleInputChange}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all appearance-none bg-white"
          >
            <option value="">All Genres</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>

        {/* Author */}
        <div>
          <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
            Author
          </label>
          <select
            id="author"
            name="author"
            value={localFilters.author}
            onChange={handleInputChange}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all appearance-none bg-white"
          >
            <option value="">All Authors</option>
            {authors.map((author) => (
              <option key={author} value={author}>
                {author}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Range
          </label>
          <div className="flex space-x-3">
            <div className="flex-1">
              <input
                type="number"
                id="minPrice"
                name="minPrice"
                min="0"
                step="0.01"
                value={localFilters.minPrice}
                onChange={handleInputChange}
                placeholder="Min"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex-1">
              <input
                type="number"
                id="maxPrice"
                name="maxPrice"
                min="0"
                step="0.01"
                value={localFilters.maxPrice}
                onChange={handleInputChange}
                placeholder="Max"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Apply Filters Button */}
        <button
          type="submit"
          className="w-full bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-all"
        >
          Apply Filters
        </button>
      </form>
    </div>
  );
};

export default BookFilters;
