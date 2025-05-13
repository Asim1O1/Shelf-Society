// src/components/book/BookFilters.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

const BookFilters = ({ filters, onFilterChange }) => {
  const [genres, setGenres] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await axiosInstance.get("/books?pageSize=100");
        if (response.data.success) {
          const books = response.data.data.items;

          const uniqueGenres = [
            ...new Set(books.map((book) => book.genre)),
          ].filter(Boolean);
          setGenres(uniqueGenres.sort());

          const uniqueAuthors = [
            ...new Set(books.map((book) => book.author)),
          ].filter(Boolean);
          setAuthors(uniqueAuthors.sort().slice(0, 20));
        }
      } catch (error) {
        console.error("Error fetching filter options:", error);
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

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Search */}
        <div>
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-2"
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
            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 transition-all duration-200"
          />
        </div>

        {/* Genre */}
        <div>
          <label
            htmlFor="genre"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Genre
          </label>
          <select
            id="genre"
            name="genre"
            value={localFilters.genre}
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 transition-all duration-200"
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
          <label
            htmlFor="author"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Author
          </label>
          <select
            id="author"
            name="author"
            value={localFilters.author}
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 transition-all duration-200"
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
          <div className="flex gap-3">
            <div className="flex-1">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  id="minPrice"
                  name="minPrice"
                  min="0"
                  step="0.01"
                  value={localFilters.minPrice}
                  onChange={handleInputChange}
                  placeholder="Min"
                  className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 transition-all duration-200"
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  id="maxPrice"
                  name="maxPrice"
                  min="0"
                  step="0.01"
                  value={localFilters.maxPrice}
                  onChange={handleInputChange}
                  placeholder="Max"
                  className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="space-y-3 pt-4">
          <button
            type="submit"
            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Apply Filters
          </button>

          <button
            type="button"
            onClick={handleClearFilters}
            className="w-full bg-white text-gray-700 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors font-medium"
          >
            Clear Filters
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookFilters;
