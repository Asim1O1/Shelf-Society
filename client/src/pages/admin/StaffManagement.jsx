// src/pages/admin/StaffManagement.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import useStaffManagementStore from "../../stores/useStaffManagementStore";

const StaffManagement = () => {
  const {
    staffMembers,
    pagination,
    isLoading,
    error,
    getStaffMembers,
    deleteStaffMember,
    setPagination,
  } = useStaffManagementStore();

  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  useEffect(() => {
    // Load staff members when component mounts or pagination changes
    getStaffMembers();
  }, [pagination.pageNumber]);

  // Show error messages from the store
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleDeleteStaff = (staffMember) => {
    setDeleteConfirmation(staffMember);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;

    const result = await deleteStaffMember(deleteConfirmation.id);
    if (result.success) {
      toast.success("Staff member deleted successfully");
    }
    setDeleteConfirmation(null);
  };

  const handlePageChange = (newPageNumber) => {
    setPagination({ pageNumber: newPageNumber });
  };

  const totalPages = Math.ceil(pagination.totalCount / pagination.pageSize);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
            <p className="text-gray-600">Manage your staff members</p>
          </div>
          <Link
            to="/admin/staff/create"
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            Add Staff Member
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : staffMembers.length === 0 ? (
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No staff members</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding a new staff member.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {staffMembers.map((staffMember) => (
                  <tr key={staffMember.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                          <span className="text-white font-medium">
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
                      <div className="text-sm text-gray-700">
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
                        className="text-indigo-600 hover:text-indigo-800 mr-4 transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteStaff(staffMember)}
                        className="text-red-600 hover:text-red-800 transition-colors"
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
              <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() =>
                    handlePageChange(Math.max(1, pagination.pageNumber - 1))
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
                  Page {pagination.pageNumber} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.pageNumber + 1)}
                  disabled={pagination.pageNumber >= totalPages}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    pagination.pageNumber >= totalPages
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

        {/* Delete Confirmation Modal */}
        {deleteConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
              <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
              <p className="mb-6 text-gray-600">
                Are you sure you want to delete staff member{" "}
                <span className="font-medium text-gray-900">
                  {`${deleteConfirmation.firstName} ${deleteConfirmation.lastName}`}
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirmation(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffManagement;