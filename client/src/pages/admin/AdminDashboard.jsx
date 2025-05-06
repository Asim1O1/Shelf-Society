import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AdminSidebar from "../../components/admin/AdminSidebar";
import StatCard from "../../components/admin/StatCard";
import useAuthStore from "../../stores/useAuthStore";
import useBookStore from "../../stores/useBookStore";

/**
 * Custom hook for managing dashboard statistics
 */
const useDashboardStats = (books) => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalGenres: 0,
    totalAuthors: 0,
    lowStock: 0,
    outOfStock: 0,
    averagePrice: 0,
  });

  const [recentBooks, setRecentBooks] = useState([]);

  useEffect(() => {
    if (books && books.length > 0) {
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

      const sortedBooks = [...books].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setRecentBooks(sortedBooks.slice(0, 5));
    }
  }, [books]);

  return { stats, recentBooks };
};

/**
 * Component for displaying statistics cards
 */
const StatsSection = ({ stats }) => (
  <>
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
  </>
);

/**
 * Component for quick action buttons
 */
const QuickActions = () => (
  <div className="bg-white rounded-lg shadow mb-8">
    <div className="px-6 py-4 border-b border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800">Quick Actions</h2>
    </div>
    <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
      <Link
        to="/books/create"
        className="bg-blue-600 text-white text-center py-3 px-4 rounded hover:bg-blue-700 transition flex items-center justify-center"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          ></path>
        </svg>
        Add New Book
      </Link>

      <Link
        to="/admin/announcements"
        className="bg-green-600 text-white text-center py-3 px-4 rounded hover:bg-green-700 transition flex items-center justify-center"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
          ></path>
        </svg>
        Manage Announcements
      </Link>

      <Link
        to="/admin/discounts"
        className="bg-yellow-600 text-white text-center py-3 px-4 rounded hover:bg-yellow-700 transition flex items-center justify-center"
      >
        <svg
          className="w-5 h-5 mr-2"
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
        Manage Discounts
      </Link>

      <Link
        to="/admin/staff"
        className="bg-purple-600 text-white text-center py-3 px-4 rounded hover:bg-purple-700 transition flex items-center justify-center"
      >
        <svg
          className="w-5 h-5 mr-2"
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
        Manage Staff
      </Link>
    </div>
  </div>
);

/**
 * Component for recent books table
 */
const RecentBooks = ({ books, onDelete }) => (
  <div className="bg-white rounded-lg shadow">
    <div className="px-6 py-4 border-b border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800">Recent Books</h2>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
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
                <Link
                  to={`/books/edit/${book.id}`}
                  className="text-blue-600 hover:text-blue-900 mr-4"
                >
                  Edit
                </Link>
                <button
                  onClick={() => onDelete(book)}
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
 * Main AdminDashboard component
 */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { books, getBooks, isLoading, deleteBook } = useBookStore();
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { stats, recentBooks } = useDashboardStats(books);

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

  const handleDeleteBook = async (id) => {
    const result = await deleteBook(id);
    if (result.success) {
      setConfirmDelete(null);
    }
  };

  if (!isAuthenticated || (user && user.role !== "Admin")) {
    return null;
  }

  return (
    <div className="flex">
      <AdminSidebar />

      <div className="flex-1 p-8 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <StatsSection stats={stats} />
            <QuickActions />
            <RecentBooks books={recentBooks} onDelete={setConfirmDelete} />
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

export default AdminDashboard;
