import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import DeleteConfirmModal from "../../components/admin/DeleteConfirmModal";
import useAuthStore from "../../stores/useAuthStore";
import useBookStore from "../../stores/useBookStore";

/**
 * Custom hook for managing book filters and search
 */
const useBookFilters = (setFilters, setPagination, resetFilters) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ search: searchTerm });
    setPagination({ pageNumber: 1 });
  };

  const handleFilterChange = (filterName, value) => {
    setFilters({ [filterName]: value });
    setPagination({ pageNumber: 1 });
  };

  const handleClearFilters = () => {
    resetFilters();
    setSearchTerm("");
  };

  return {
    searchTerm,
    setSearchTerm,
    handleSearch,
    handleFilterChange,
    handleClearFilters,
  };
};

/**
 * Custom hook for managing book selection
 */
const useBookSelection = (books) => {
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    if (selectAll) {
      setSelectedBooks(books.map((book) => book.id));
    } else {
      setSelectedBooks([]);
    }
  }, [selectAll, books]);

  const handleSelectBook = (bookId) => {
    if (selectedBooks.includes(bookId)) {
      setSelectedBooks(selectedBooks.filter((id) => id !== bookId));
    } else {
      setSelectedBooks([...selectedBooks, bookId]);
    }
  };

  return {
    selectedBooks,
    selectAll,
    setSelectAll,
    handleSelectBook,
    setSelectedBooks,
  };
};

/**
 * Component for search and filter controls
 */
const SearchAndFilters = ({
  searchTerm,
  setSearchTerm,
  handleSearch,
  handleFilterChange,
  handleClearFilters,
  filters,
}) => (
  <div className="bg-white rounded-lg shadow-md p-6 mb-6">
    <form onSubmit={handleSearch} className="mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by title, author, ISBN..."
          className="flex-grow border rounded px-4 py-2"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
        >
          Search
        </button>
        <button
          type="button"
          onClick={handleClearFilters}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
        >
          Clear
        </button>
      </div>
    </form>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <FilterSelect
        label="Genre"
        value={filters.genre || ""}
        onChange={(value) => handleFilterChange("genre", value)}
        options={[
          { value: "", label: "All Genres" },
          { value: "fiction", label: "Fiction" },
          { value: "non-fiction", label: "Non-Fiction" },
          { value: "mystery", label: "Mystery" },
          { value: "sci-fi", label: "Science Fiction" },
          { value: "fantasy", label: "Fantasy" },
          { value: "romance", label: "Romance" },
          { value: "thriller", label: "Thriller" },
          { value: "biography", label: "Biography" },
        ]}
      />

      <FilterSelect
        label="Language"
        value={filters.language || ""}
        onChange={(value) => handleFilterChange("language", value)}
        options={[
          { value: "", label: "All Languages" },
          { value: "english", label: "English" },
          { value: "spanish", label: "Spanish" },
          { value: "french", label: "French" },
          { value: "german", label: "German" },
          { value: "japanese", label: "Japanese" },
          { value: "chinese", label: "Chinese" },
        ]}
      />

      <PriceRangeFilter
        minPrice={filters.minPrice}
        maxPrice={filters.maxPrice}
        onChange={handleFilterChange}
      />

      <FilterSelect
        label="Sort By"
        value={filters.sortBy || ""}
        onChange={(value) => handleFilterChange("sortBy", value)}
        options={[
          { value: "", label: "Default" },
          { value: "title_asc", label: "Title (A-Z)" },
          { value: "title_desc", label: "Title (Z-A)" },
          { value: "price_asc", label: "Price (Low to High)" },
          { value: "price_desc", label: "Price (High to Low)" },
          { value: "date_desc", label: "Newest First" },
          { value: "date_asc", label: "Oldest First" },
        ]}
      />
    </div>
  </div>
);

/**
 * Component for filter select dropdown
 */
const FilterSelect = ({ label, value, onChange, options }) => (
  <div>
    <label className="block mb-2 text-sm font-medium">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value || null)}
      className="w-full border rounded px-3 py-2"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

/**
 * Component for price range filter
 */
const PriceRangeFilter = ({ minPrice, maxPrice, onChange }) => (
  <div>
    <label className="block mb-2 text-sm font-medium">Price Range</label>
    <div className="flex items-center space-x-2">
      <input
        type="number"
        placeholder="Min"
        min="0"
        value={minPrice || ""}
        onChange={(e) => onChange("minPrice", e.target.value || null)}
        className="w-full border rounded px-3 py-2"
      />
      <span>-</span>
      <input
        type="number"
        placeholder="Max"
        min="0"
        value={maxPrice || ""}
        onChange={(e) => onChange("maxPrice", e.target.value || null)}
        className="w-full border rounded px-3 py-2"
      />
    </div>
  </div>
);

/**
 * Component for book table
 */
const BookTable = ({
  books,
  selectedBooks,
  handleSelectBook,
  handleDeleteBook,
  setConfirmDelete,
  setSelectAll,
}) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <input
                type="checkbox"
                checked={selectedBooks.length === books.length}
                onChange={(e) => setSelectAll(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Author
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stock
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {books.map((book) => (
            <tr key={book.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedBooks.includes(book.id)}
                  onChange={() => handleSelectBook(book.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {book.title}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{book.author}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">${book.price}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{book.stockQuantity}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Link
                  to={`/books/edit/${book.id}`}
                  className="text-blue-600 hover:text-blue-900 mr-4"
                >
                  Edit
                </Link>
                <button
                  onClick={() => setConfirmDelete(book)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

/**
 * Component for pagination controls
 */
const Pagination = ({ pagination, onPageChange }) => {
  const pageCount = Math.ceil(pagination.totalCount / pagination.pageSize);
  const pageNumbers = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <div className="flex justify-center mt-6">
      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
        <button
          onClick={() => onPageChange(pagination.pageNumber - 1)}
          disabled={pagination.pageNumber === 1}
          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
        >
          Previous
        </button>
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => onPageChange(number)}
            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
              number === pagination.pageNumber
                ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
            }`}
          >
            {number}
          </button>
        ))}
        <button
          onClick={() => onPageChange(pagination.pageNumber + 1)}
          disabled={pagination.pageNumber === pageCount}
          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
        >
          Next
        </button>
      </nav>
    </div>
  );
};

/**
 * Main AdminBookManagePage component
 */
const AdminBookManagePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const {
    books,
    pagination,
    filters,
    isLoading,
    error,
    getBooks,
    setFilters,
    setPagination,
    resetFilters,
    deleteBook,
  } = useBookStore();

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [bulkActionOpen, setBulkActionOpen] = useState(false);

  const {
    searchTerm,
    setSearchTerm,
    handleSearch,
    handleFilterChange,
    handleClearFilters,
  } = useBookFilters(setFilters, setPagination, resetFilters);

  const {
    selectedBooks,
    selectAll,
    setSelectAll,
    handleSelectBook,
    setSelectedBooks,
  } = useBookSelection(books);

  // Check if user is admin, if not redirect
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user && user.role !== "Admin") {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch books when component mounts or filters/pagination changes
  useEffect(() => {
    getBooks();
  }, [pagination.pageNumber, pagination.pageSize, filters]);

  const handlePageChange = (newPage) => {
    if (
      newPage > 0 &&
      newPage <= Math.ceil(pagination.totalCount / pagination.pageSize)
    ) {
      setPagination({ pageNumber: newPage });
    }
  };

  const handleDeleteBook = async (id) => {
    const result = await deleteBook(id);
    if (result.success) {
      setConfirmDelete(null);
      if (selectedBooks.includes(id)) {
        setSelectedBooks(selectedBooks.filter((bookId) => bookId !== id));
      }
    }
  };

  const handleBulkDelete = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedBooks.length} books? This action cannot be undone.`
    );

    if (confirmDelete) {
      for (const bookId of selectedBooks) {
        await deleteBook(bookId);
      }

      setSelectedBooks([]);
      setSelectAll(false);
      setBulkActionOpen(false);
    }
  };

  if (!isAuthenticated || (user && user.role !== "Admin")) {
    return null;
  }

  return (
    <div className="flex">
      <AdminSidebar />

      <div className="flex-1 p-8 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Books</h1>
          <Link
            to="/books/create"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Add New Book
          </Link>
        </div>

        <SearchAndFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleSearch={handleSearch}
          handleFilterChange={handleFilterChange}
          handleClearFilters={handleClearFilters}
          filters={filters}
        />

        {selectedBooks.length > 0 && (
          <div className="mb-4 flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {selectedBooks.length} books selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Delete Selected
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        ) : (
          <>
            <BookTable
              books={books}
              selectedBooks={selectedBooks}
              handleSelectBook={handleSelectBook}
              handleDeleteBook={handleDeleteBook}
              setConfirmDelete={setConfirmDelete}
              setSelectAll={setSelectAll}
            />

            <Pagination
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </>
        )}

        {confirmDelete && (
          <DeleteConfirmModal
            isOpen={!!confirmDelete}
            onClose={() => setConfirmDelete(null)}
            onConfirm={() => handleDeleteBook(confirmDelete.id)}
            title="Delete Book"
            message={`Are you sure you want to delete "${confirmDelete.title}"? This action cannot be undone.`}
          />
        )}
      </div>
    </div>
  );
};

export default AdminBookManagePage;
