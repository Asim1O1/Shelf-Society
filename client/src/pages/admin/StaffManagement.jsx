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
      ) : staffMembers.length === 0 ? (
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
              {staffMembers.map((staffMember) => (
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
                      onClick={() => handleDeleteStaff(staffMember)}
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
                  handlePageChange(Math.max(1, pagination.pageNumber - 1))
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
                Page {pagination.pageNumber} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.pageNumber + 1)}
                disabled={pagination.pageNumber >= totalPages}
                className={`px-4 py-2 rounded ${
                  pagination.pageNumber >= totalPages
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-6">
              Are you sure you want to delete staff member{" "}
              <span className="font-medium">
                {`${deleteConfirmation.firstName} ${deleteConfirmation.lastName}`}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
