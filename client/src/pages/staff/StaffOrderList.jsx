import { format } from "date-fns";
import { useEffect, useState } from "react";
import { FaEye, FaFilter, FaSearch, FaTimesCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/common/Pagination";
import useOrderStore from "../../stores/useOrderStore";

const StaffOrdersList = () => {
  const navigate = useNavigate();
  const { getAllOrders, orders, isLoading, pagination, setPagination } =
    useOrderStore();

  // Filter state
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Load orders on component mount and when pagination/filters change
  useEffect(() => {
    const fetchOrders = async () => {
      const result = await getAllOrders({
        status,
        search: search.trim(),
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize,
      });

      // Optionally handle the result if needed
      if (!result.success) {
        // Could handle error here or let the store handle it
        console.error("Failed to fetch orders:", result.message);
      }
    };

    fetchOrders();
  }, [getAllOrders, pagination.pageNumber, pagination.pageSize, status]);

  // Function to load orders with current filters
  const loadOrders = async () => {
    const result = await getAllOrders({
      status,
      search: search.trim(),
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
    });

    return result;
  };

  // Reset all filters
  const resetFilters = async () => {
    setStatus("All");
    setSearch("");
    setStartDate("");
    setEndDate("");
    setPagination({ pageNumber: 1 });
    await loadOrders();
  };

  // Handle search form submit
  const handleSearch = async (e) => {
    e.preventDefault();
    setPagination({ pageNumber: 1 }); // Reset to first page when searching
    await loadOrders();
  };

  // Handle status change
  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPagination({ pageNumber: 1 }); // Reset to first page when changing status
  };

  // Handle page change
  const handlePageChange = (page) => {
    setPagination({ pageNumber: page });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return format(new Date(dateString), "MMM d, yyyy h:mm a");
  };

  // Get status badge color
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Confirmed":
        return "bg-blue-100 text-blue-800";
      case "Ready":
        return "bg-orange-100 text-orange-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders Management</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100"
        >
          <FaFilter className="mr-2" />{" "}
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-lg font-semibold">Filter Orders</h2>
            <button
              onClick={resetFilters}
              className="text-gray-500 hover:text-gray-700 flex items-center"
            >
              <FaTimesCircle className="mr-1" /> Reset Filters
            </button>
          </div>
          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status
              </label>
              <select
                id="status"
                className="w-full px-3 py-2 border rounded-lg"
                value={status}
                onChange={handleStatusChange}
              >
                <option value="All">All Orders</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Ready">Ready</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                className="w-full px-3 py-2 border rounded-lg"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                className="w-full px-3 py-2 border rounded-lg"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="flex">
              <div className="flex-grow">
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Search
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="search"
                    placeholder="Order ID, claim code, or customer"
                    className="w-full px-3 py-2 border rounded-l-lg"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700"
                  >
                    <FaSearch />
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading orders...</p>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Claim Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders && orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
                      {order.claimCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(order.orderDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.totalItems}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatCurrency(order.finalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/staff/orders/${order.id}`)}
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <FaEye className="mr-1" /> View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No orders found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalCount > 0 && (
          <div className="px-6 py-4 border-t">
            <Pagination
              currentPage={pagination.pageNumber}
              totalPages={Math.ceil(
                pagination.totalCount / pagination.pageSize
              )}
              onPageChange={handlePageChange}
            />
            <div className="mt-2 text-sm text-gray-500">
              Showing {(pagination.pageNumber - 1) * pagination.pageSize + 1} to{" "}
              {Math.min(
                pagination.pageNumber * pagination.pageSize,
                pagination.totalCount
              )}{" "}
              of {pagination.totalCount} orders
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default StaffOrdersList;
