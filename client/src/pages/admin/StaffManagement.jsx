// src/pages/admin/StaffManagement.jsx
import React, { useEffect, useState } from "react";

import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import useAuthStore from "../../stores/useAuthStore";
import axiosInstance from "../../utils/axiosInstance";

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
  });
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) {
      fetchStaff();
    }
  }, [token, pagination.pageNumber]);

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(
        `/staff-management?pageNumber=${pagination.pageNumber}&pageSize=${pagination.pageSize}`
      );

      if (response.data.success) {
        setStaff(response.data.data.items);
        setPagination({
          ...pagination,
          totalCount: response.data.data.totalCount,
        });
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
      toast.error("Failed to fetch staff members");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStaff = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        const response = await axiosInstance.delete(`/staff-management/${id}`);
        if (response.data.success) {
          toast.success("Staff member deleted successfully");
          fetchStaff();
        }
      } catch (error) {
        console.error("Error deleting staff:", error);
        toast.error("Failed to delete staff member");
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Staff Management</h1>
        <Link
          to="/admin/staff/create"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Staff Member
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : staff.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No staff members found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {staff.map((staffMember) => (
                <tr key={staffMember.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {`${staffMember.firstName.charAt(
                            0
                          )}${staffMember.lastName.charAt(0)}`}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {`${staffMember.firstName} ${staffMember.lastName}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {staffMember.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(staffMember.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/admin/staff/edit/${staffMember.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteStaff(staffMember.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
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

export default StaffManagement;
