// src/pages/admin/DiscountManagement.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Discount Management
        </h1>
        <Link
          to="/admin/discounts/create"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add New Discount
        </Link>
      </div>

      <div className="mb-4 flex items-center">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={() => setActiveOnly(!activeOnly)}
            className="form-checkbox h-5 w-5 text-blue-600"
          />
          <span className="ml-2 text-gray-700">Show active discounts only</span>
        </label>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : discounts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No discounts found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Book
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  On Sale
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {discounts.map((discount) => {
                const now = new Date();
                const startDate = new Date(discount.startDate);
                const endDate = new Date(discount.endDate);
                const isActive = startDate <= now && endDate >= now;
                const isFuture = startDate > now;
                const isExpired = endDate < now;

                return (
                  <tr key={discount.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {discount.bookImageUrl ? (
                          <img
                            src={discount.bookImageUrl}
                            alt={discount.bookTitle}
                            className="h-10 w-10 object-cover rounded"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-gray-500 text-xs">
                              No img
                            </span>
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {discount.bookTitle}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {discount.discountPercentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {discount.onSale ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          ON SALE
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(discount.startDate).toLocaleDateString()} -{" "}
                        {new Date(discount.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isActive && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                      {isFuture && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Upcoming
                        </span>
                      )}
                      {isExpired && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Expired
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/admin/discounts/edit/${discount.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteDiscount(discount.id)}
                        className="text-red-600 hover:text-red-900"
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
            <div className="flex justify-between items-center px-6 py-3 bg-gray-50">
              <button
                onClick={() =>
                  setPagination({
                    ...pagination,
                    pageNumber: Math.max(1, pagination.pageNumber - 1),
                  })
                }
                disabled={pagination.pageNumber === 1}
                className={`px-4 py-2 rounded ${
                  pagination.pageNumber === 1
                    ? "bg-gray-200 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
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
                className={`px-4 py-2 rounded ${
                  pagination.pageNumber >=
                  Math.ceil(pagination.totalCount / pagination.pageSize)
                    ? "bg-gray-200 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DiscountManagement;
