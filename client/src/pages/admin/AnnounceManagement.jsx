// src/pages/admin/AnnouncementManagement.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import axiosInstance from "../../utils/axiosInstance";

const AnnouncementManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
  });

  useEffect(() => {
    fetchAnnouncements();
  }, [pagination.pageNumber]);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("pageNumber", pagination.pageNumber);
      params.append("pageSize", pagination.pageSize);

      const response = await axiosInstance.get(
        `/announcements?${params.toString()}`
      );

      if (response.data.success) {
        setAnnouncements(response.data.data.items);
        setPagination({
          ...pagination,
          totalCount: response.data.data.totalCount,
        });
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast.error("Failed to fetch announcements");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        const response = await axiosInstance.delete(`/announcements/${id}`);
        if (response.data.success) {
          toast.success("Announcement deleted successfully");
          fetchAnnouncements();
        }
      } catch (error) {
        console.error("Error deleting announcement:", error);
        toast.error("Failed to delete announcement");
      }
    }
  };

  const handleToggleActive = async (announcement) => {
    try {
      const response = await axiosInstance.put(
        `/announcements/${announcement.id}`,
        {
          isActive: !announcement.isActive,
        }
      );

      if (response.data.success) {
        toast.success(
          `Announcement ${
            announcement.isActive ? "deactivated" : "activated"
          } successfully`
        );
        fetchAnnouncements();
      }
    } catch (error) {
      console.error("Error updating announcement:", error);
      toast.error("Failed to update announcement");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Announcement Management
        </h1>
        <Link
          to="/admin/announcements/create"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add New Announcement
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No announcements found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
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
              {announcements.map((announcement) => {
                const now = new Date();
                const startDate = new Date(announcement.startDate);
                const endDate = new Date(announcement.endDate);
                const isCurrentlyActive =
                  announcement.isActive && startDate <= now && endDate >= now;
                const isFuture = startDate > now;
                const isExpired = endDate < now;

                return (
                  <tr key={announcement.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {announcement.title}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {announcement.content}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(announcement.startDate).toLocaleDateString()}{" "}
                        - {new Date(announcement.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isCurrentlyActive && (
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
                      {!announcement.isActive && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleToggleActive(announcement)}
                        className={`text-blue-600 hover:text-blue-900 mr-4 ${
                          isExpired ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={isExpired}
                      >
                        {announcement.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <Link
                        to={`/admin/announcements/edit/${announcement.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() =>
                          handleDeleteAnnouncement(announcement.id)
                        }
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

export default AnnouncementManagement;
