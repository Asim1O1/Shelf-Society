import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AdminSidebar from "../../components/admin/AdminSidebar";
import DeleteConfirmModal from "../../components/admin/DeleteConfirmModal";
import StatCard from "../../components/admin/StatCard";
import useAuthStore from "../../stores/useAuthStore";
import useBookStore from "../../stores/useBookStore";
import showToast from "../../utils/ToastUtility";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { books, getBooks, isLoading, deleteBook } = useBookStore();

  const [stats, setStats] = useState({
    totalBooks: 0,
    totalGenres: 0,
    totalAuthors: 0,
    lowStock: 0,
    outOfStock: 0,
    averagePrice: 0,
  });

  const [recentBooks, setRecentBooks] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);

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

  // Fetch books data
  useEffect(() => {
    getBooks();
  }, []);

  // Calculate stats when books data changes
  useEffect(() => {
    if (books && books.length > 0) {
      // Calculate statistics
      const genres = new Set(books.map((book) => book.genre));
      const authors = new Set(books.map((book) => book.author));
      const lowStockBooks = books.filter(
        (book) => book.stockQuantity > 0 && book.stockQuantity < 5
      );
      const outOfStockBooks = books.filter((book) => book.stockQuantity === 0);
      const totalPrice = books.reduce((sum, book) => sum + book.price, 0);
      const avgPrice = totalPrice / books.length;

      setStats({
        totalBooks: books.length,
        totalGenres: genres.size,
        totalAuthors: authors.size,
        lowStock: lowStockBooks.length,
        outOfStock: outOfStockBooks.length,
        averagePrice: avgPrice.toFixed(2),
      });

      // Sort books by creation date to get the most recent ones
      const sortedBooks = [...books].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setRecentBooks(sortedBooks.slice(0, 5));
    }
  }, [books]);
  const handleDeleteBook = async (id) => {
    const result = await deleteBook(id);
    console.log(result); // Log the result for debugging
    if (result.success) {
      setConfirmDelete(null);
      showToast.success(result?.message || "Book deleted successfully");
    } else {
      showToast.error(result.message || "Failed to delete the book");
    }
  };

  if (!isAuthenticated || (user && user.role !== "Admin")) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="flex">
      <AdminSidebar />

      <div className="flex-1 p-8 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Books"
            value={stats.totalBooks}
            icon={
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                ></path>
              </svg>
            }
            color="blue"
            link="/books"
            linkText="View All"
          />

          <StatCard
            title="Genres"
            value={stats.totalGenres}
            icon={
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                ></path>
              </svg>
            }
            color="green"
          />

          <StatCard
            title="Authors"
            value={stats.totalAuthors}
            icon={
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                ></path>
              </svg>
            }
            color="purple"
          />
        </div>

        {/* Stock and Price Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Low Stock Books"
            value={stats.lowStock}
            icon={
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                ></path>
              </svg>
            }
            color="yellow"
          />

          <StatCard
            title="Out of Stock"
            value={stats.outOfStock}
            icon={
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                ></path>
              </svg>
            }
            color="red"
          />

          <StatCard
            title="Average Price"
            value={`$${stats.averagePrice}`}
            icon={
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            }
            color="green"
          />
        </div>

        {/* Recent Books */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              Recently Added Books
            </h2>
            <Link
              to="/books"
              className="text-blue-600 text-sm hover:text-blue-800"
            >
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Genre
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
                {recentBooks.map((book) => (
                  <tr key={book.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded object-cover"
                            src={book.imageUrl || "/placeholder-book.jpg"}
                            alt={book.title}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {book.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            ISBN: {book.isbn}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{book.author}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{book.genre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${book.price.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          book.stockQuantity === 0
                            ? "bg-red-100 text-red-800"
                            : book.stockQuantity < 5
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {book.stockQuantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          to={`/books/edit/${book.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => setConfirmDelete(book.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {recentBooks.length === 0 && !isLoading && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No books found
                    </td>
                  </tr>
                )}

                {isLoading && (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <DeleteConfirmModal
          isOpen={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
          onConfirm={() => handleDeleteBook(confirmDelete)}
          title="Confirm Deletion"
          message="Are you sure you want to delete this book? This action cannot be undone."
        />
      )}
    </div>
  );
};

export default AdminDashboard;
