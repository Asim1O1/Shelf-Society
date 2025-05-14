// src/pages/admin/DiscountManagement.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import AdminSidebar from "../../components/admin/AdminSidebar";
import axiosInstance from "../../utils/axiosInstance";

const DiscountManagement = () => {
  const [discounts, setDiscounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
  });
  const [activeOnly, setActiveOnly] = useState(false);

  useEffect(() => {
    fetchDiscounts();
  }, [pagination.pageNumber, activeOnly]);

  const fetchDiscounts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("pageNumber", pagination.pageNumber);
      params.append("pageSize", pagination.pageSize);
      if (activeOnly) {
        params.append("activeOnly", true);
      }

      const response = await axiosInstance.get(
        `/discounts?${params.toString()}`
      );

      if (response.data.success) {
        setDiscounts(response.data.data.items);
        setPagination({
          ...pagination,
          totalCount: response.data.data.totalCount,
        });
      }
    } catch (error) {
      console.error("Error fetching discounts:", error);
      toast.error("Failed to fetch discounts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDiscount = async (id) => {
    if (window.confirm("Are you sure you want to delete this discount?")) {
      try {
        const response = await axiosInstance.delete(`/discounts/${id}`);
        if (response.data.success) {
          toast.success("Discount deleted successfully");
          fetchDiscounts();
        }
      } catch (error) {
        console.error("Error deleting discount:", error);
        toast.error("Failed to delete discount");
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminSidebar />

      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Discount Management
            </h1>
            <p className="text-gray-600">
              Manage book discounts and promotions
            </p>
          </div>
          <Link
            to="/admin/discounts/create"
            className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-lg font-medium hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            Add New Discount
          </Link>
        </div>

        <div className="mb-6 flex items-center">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={() => setActiveOnly(!activeOnly)}
              className="form-checkbox h-5 w-5 text-gray-600 rounded transition-colors"
            />
            <span className="ml-3 text-gray-700 font-medium">
              Show active discounts only
            </span>
          </label>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-600"></div>
          </div>
        ) : discounts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No discounts
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new discount.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Book
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    On Sale
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Period
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
                {discounts.map((discount) => {
                  const now = new Date();
                  const startDate = new Date(discount.startDate);
                  const endDate = new Date(discount.endDate);
                  const isActive = startDate <= now && endDate >= now;
                  const isFuture = startDate > now;
                  const isExpired = endDate < now;

                  return (
                    <tr
                      key={discount.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {discount.bookTitle}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {discount.discountPercentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {discount.onSale ? (
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            ON SALE
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {new Date(discount.startDate).toLocaleDateString()} -{" "}
                          {new Date(discount.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isActive && (
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        )}
                        {isFuture && (
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Upcoming
                          </span>
                        )}
                        {isExpired && (
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Expired
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/admin/discounts/edit/${discount.id}`}
                          className="text-indigo-600 hover:text-indigo-800 mr-4 transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteDiscount(discount.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.totalCount > pagination.pageSize && (
              <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() =>
                    setPagination({
                      ...pagination,
                      pageNumber: Math.max(1, pagination.pageNumber - 1),
                    })
                  }
                  disabled={pagination.pageNumber === 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    pagination.pageNumber === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {pagination.pageNumber} of{" "}
                  {Math.ceil(pagination.totalCount / pagination.pageSize)}
                </span>
                <button
                  onClick={() =>
                    setPagination({
                      ...pagination,
                      pageNumber: pagination.pageNumber + 1,
                    })
                  }
                  disabled={
                    pagination.pageNumber >=
                    Math.ceil(pagination.totalCount / pagination.pageSize)
                  }
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    pagination.pageNumber >=
                    Math.ceil(pagination.totalCount / pagination.pageSize)
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscountManagement;
