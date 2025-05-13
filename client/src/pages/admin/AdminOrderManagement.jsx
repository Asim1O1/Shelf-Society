import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import AdminSidebar from "../../components/admin/AdminSidebar";
import useAuthStore from "../../stores/useAuthStore";
import useOrderStore from "../../stores/useOrderStore"; // Use existing store

const AdminOrderManagement = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const {
    orders,
    pagination,
    isLoading,
    error,
    getAllOrders,
    setPagination,
    getOrderById,
    updateOrderStatus,
    clearError,
  } = useOrderStore();

  // Local state for filtering (since the store doesn't have filter state)
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Order details modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Status update modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Check if user is admin/staff
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/admin/orders" } });
      return;
    }

    if (user && user.role !== "Admin" && user.role !== "Staff") {
      navigate("/");
      toast.error("You don't have permission to access this page");
      return;
    }

    // Use getAllOrders instead of getOrders
    getAllOrders({
      status: statusFilter,
      search: searchTerm,
    });
  }, [
    isAuthenticated,
    user,
    pagination.pageNumber,
    pagination.pageSize,
    statusFilter,
    searchTerm,
  ]);

  // Show error messages
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // For now, we'll just use client-side filtering since your store doesn't support search params
    // In a real implementation, you'd want to send these filters to the API
    setPagination({ pageNumber: 1 }); // Reset to first page
  };

  // Get order details
  const handleViewOrder = async (orderId) => {
    try {
      const result = await getOrderById(orderId);
      if (result.success) {
        setSelectedOrder(result.data);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  // Handle status change initiation
  const handleStatusChange = (orderId, status) => {
    // Find the order in our list or fetch it if not available
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setNewStatus(status);
      setShowStatusModal(true);
    } else {
      handleViewOrder(orderId).then(() => {
        setNewStatus(status);
        setShowStatusModal(true);
      });
    }
  };

  // Update order status
  const confirmStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;

    setIsUpdating(true);
    try {
      const result = await updateOrderStatus(selectedOrder.id, newStatus);
      if (result.success) {
        setShowStatusModal(false);

        // If details modal is open, update the displayed status
        if (showDetailsModal) {
          setSelectedOrder((prev) => ({
            ...prev,
            status: newStatus,
          }));
        }
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination({ pageNumber: newPage });
  };

  // Format date
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status badge color
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Processing":
        return "bg-gray-100 text-gray-800";
      case "Confirmed":
        return "bg-purple-100 text-purple-800";
      case "Shipped":
        return "bg-indigo-100 text-indigo-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      case "Refunded":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter orders by status and search term (client-side filtering)
  const filteredOrders = orders.filter((order) => {
    // Status filter
    if (statusFilter !== "All" && order.status !== statusFilter) {
      return false;
    }

    // Search filter - basic client-side implementation
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        order.id.toString().includes(searchLower) ||
        order.claimCode.toLowerCase().includes(searchLower) ||
        (order.customerName &&
          order.customerName.toLowerCase().includes(searchLower)) ||
        (order.customerEmail &&
          order.customerEmail.toLowerCase().includes(searchLower))
      );
    }

    return true;
  });

  const totalPages = Math.ceil(pagination.totalCount / pagination.pageSize);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminSidebar />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Management
          </h1>
          <p className="text-gray-600">Track and manage customer orders</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-full md:w-auto">
              <label
                htmlFor="statusFilter"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Filter by Status
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPagination({ pageNumber: 1 });
                }}
                className="block w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>

            <form
              onSubmit={handleSearchSubmit}
              className="w-full md:w-auto md:ml-auto"
            >
              <label
                htmlFor="searchTerm"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Search Orders
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="searchTerm"
                  placeholder="Order #, Customer Name or Email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full rounded-l-lg border border-gray-300 shadow-sm focus:border-gray-500 focus:ring-2 focus:ring-gray-500 px-4 py-2"
                />
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-r-lg shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>

        {isLoading && orders.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
            <div className="mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              No Orders Found
            </h2>
            <p className="text-gray-600">
              Try changing your search criteria or filters.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 border border-gray-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Order Info
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            #{order.id}
                          </div>
                          {order.claimCode && (
                            <div className="text-sm text-gray-500">
                              Claim Code:{" "}
                              <span className="font-mono">
                                {order.claimCode}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">
                            {formatDate(order.orderDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700">
                            {order.totalItems}{" "}
                            {order.totalItems === 1 ? "item" : "items"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ${order.finalAmount.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => handleViewOrder(order.id)}
                              className="text-gray-600 hover:text-gray-800 transition-colors"
                            >
                              View
                            </button>
                            <div className="relative inline-block text-left">
                              <select
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleStatusChange(
                                      order.id,
                                      e.target.value
                                    );
                                    e.target.value = "";
                                  }
                                }}
                                className="text-gray-700 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 px-3 py-1"
                              >
                                <option value="">Update Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Refunded">Refunded</option>
                              </select>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center bg-white rounded-xl shadow-sm px-6 py-4 border border-gray-100">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() =>
                      handlePageChange(Math.max(1, pagination.pageNumber - 1))
                    }
                    disabled={pagination.pageNumber === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg ${
                      pagination.pageNumber === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.pageNumber + 1)}
                    disabled={pagination.pageNumber >= totalPages}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg ${
                      pagination.pageNumber >= totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-medium">
                        {(pagination.pageNumber - 1) * pagination.pageSize + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(
                          pagination.pageNumber * pagination.pageSize,
                          pagination.totalCount
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium">
                        {pagination.totalCount}
                      </span>{" "}
                      results
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() =>
                          handlePageChange(
                            Math.max(1, pagination.pageNumber - 1)
                          )
                        }
                        disabled={pagination.pageNumber === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium ${
                          pagination.pageNumber === 1
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>

                      {/* Page numbers */}
                      {[...Array(totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        const isCurrent = pageNum === pagination.pageNumber;

                        // Show limited page numbers to avoid clutter
                        if (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= pagination.pageNumber - 1 &&
                            pageNum <= pagination.pageNumber + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                isCurrent
                                  ? "z-10 bg-gray-50 border-gray-500 text-gray-600"
                                  : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }

                        // Add ellipsis
                        if (
                          (pageNum === 2 && pagination.pageNumber > 3) ||
                          (pageNum === totalPages - 1 &&
                            pagination.pageNumber < totalPages - 2)
                        ) {
                          return (
                            <span
                              key={pageNum}
                              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                            >
                              ...
                            </span>
                          );
                        }

                        return null;
                      })}

                      <button
                        onClick={() =>
                          handlePageChange(pagination.pageNumber + 1)
                        }
                        disabled={pagination.pageNumber >= totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium ${
                          pagination.pageNumber >= totalPages
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-screen overflow-y-auto shadow-xl">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-900">
                Order #{selectedOrder.id} Details
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="h-6 w-6"
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
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">
                    Order Information
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Order Number</p>
                        <p className="font-medium">#{selectedOrder.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Order Date</p>
                        <p className="font-medium">
                          {formatDate(selectedOrder.orderDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <p>
                          <span
                            className={`px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusBadgeClass(
                              selectedOrder.status
                            )}`}
                          >
                            {selectedOrder.status}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Claim Code</p>
                        <p className="font-medium font-mono">
                          {selectedOrder.claimCode}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {selectedOrder.user && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">
                      Customer Information
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="mb-4">
                        <p className="text-xs text-gray-500">Customer Name</p>
                        <p className="font-medium">{`${selectedOrder.user.firstName} ${selectedOrder.user.lastName}`}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="font-medium">
                          {selectedOrder.user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">
                  Order Items
                </h4>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Item
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          Qty
                        </th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Price
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrder.items &&
                        selectedOrder.items.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-100">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                {item.imageUrl && (
                                  <div className="flex-shrink-0 h-10 w-10 mr-4">
                                    <img
                                      className="h-10 w-10 rounded object-cover"
                                      src={item.imageUrl}
                                      alt={item.title}
                                    />
                                  </div>
                                )}
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {item.title}
                                  </div>
                                  {item.author && (
                                    <div className="text-sm text-gray-500">
                                      {item.author}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-4 text-center">
                              {item.quantity}
                            </td>
                            <td className="px-3 py-4 text-right">
                              ${item.price.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-right font-medium">
                              ${(item.price * item.quantity).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-500">Subtotal</span>
                  <span className="text-sm font-medium">
                    $
                    {selectedOrder.subtotal?.toFixed(2) ||
                      (selectedOrder.finalAmount || 0).toFixed(2)}
                  </span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-500">Discount</span>
                    <span className="text-sm font-medium text-red-600">
                      -${selectedOrder.discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-base font-medium text-gray-900">
                    Total
                  </span>
                  <span className="text-base font-medium text-gray-900">
                    ${selectedOrder.finalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <div className="flex items-center">
                  <span className="text-sm text-gray-700 mr-2">
                    Update Status:
                  </span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => {
                      setNewStatus(e.target.value);
                      setShowStatusModal(true);
                    }}
                    className="block px-4 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent rounded-lg"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Confirmation Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Update Order Status</h3>
            <p className="mb-6">
              Are you sure you want to update order #{selectedOrder.id} status
              from{" "}
              <span
                className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(
                  selectedOrder.status
                )}`}
              >
                {selectedOrder.status}
              </span>{" "}
              to{" "}
              <span
                className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(
                  newStatus
                )}`}
              >
                {newStatus}
              </span>
              ?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setNewStatus("");
                }}
                disabled={isUpdating}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusUpdate}
                disabled={isUpdating}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition-colors flex items-center"
              >
                {isUpdating ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  "Update Status"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrderManagement;
