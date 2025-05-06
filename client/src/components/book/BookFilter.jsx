// src/components/book/BookFilters.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

const BookFilters = ({ filters, onFilterChange }) => {
  const [genres, setGenres] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    // Fetch genres and authors for filter options
    const fetchFilterOptions = async () => {
      try {
        // This would ideally be API endpoints specifically for filter options
        // For now, we'll simulate it with book data
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

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>

      <form onSubmit={handleSubmit}>
        {/* Search */}
        <div className="mb-4">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Search
          </label>
          <input
            type="text"
            id="search"
            name="search"
            value={localFilters.search}
            onChange={handleInputChange}
            placeholder="Title, author, ISBN..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </div>

        {/* Genre */}
        <div className="mb-4">
          <label
            htmlFor="genre"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Genre
          </label>
          <select
            id="genre"
            name="genre"
            value={localFilters.genre}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
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
        <div className="mb-4">
          <label
            htmlFor="author"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Author
          </label>
          <select
            id="author"
            name="author"
            value={localFilters.author}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
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
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price Range
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              id="minPrice"
              name="minPrice"
              min="0"
              step="0.01"
              value={localFilters.minPrice}
              onChange={handleInputChange}
              placeholder="Min"
              className="w-1/2 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            <input
              type="number"
              id="maxPrice"
              name="maxPrice"
              min="0"
              step="0.01"
              value={localFilters.maxPrice}
              onChange={handleInputChange}
              placeholder="Max"
              className="w-1/2 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-col space-y-2">
          <button
            type="submit"
            className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition duration-300"
          >
            Apply Filters
          </button>

          <button
            type="button"
            onClick={handleClearFilters}
            className="w-full bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300 transition duration-300"
          >
            Clear Filters
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookFilters;
