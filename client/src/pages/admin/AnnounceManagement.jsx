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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Announcement Management
            </h1>
            <p className="text-gray-600">Create and manage announcements</p>
          </div>
          <Link
            to="/admin/announcements/create"
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            Add New Announcement
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : announcements.length === 0 ? (
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No announcements
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new announcement.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Title
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
                {announcements.map((announcement) => {
                  const now = new Date();
                  const startDate = new Date(announcement.startDate);
                  const endDate = new Date(announcement.endDate);
                  const isCurrentlyActive =
                    announcement.isActive && startDate <= now && endDate >= now;
                  const isFuture = startDate > now;
                  const isExpired = endDate < now;

                  return (
                    <tr
                      key={announcement.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {announcement.title}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {announcement.content}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {new Date(
                            announcement.startDate
                          ).toLocaleDateString()}{" "}
                          -{" "}
                          {new Date(announcement.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-2">
                          {isCurrentlyActive && (
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          )}
                          {isFuture && (
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              Upcoming
                            </span>
                          )}
                          {isExpired && (
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              Expired
                            </span>
                          )}
                          {!announcement.isActive && !isExpired && (
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Inactive
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleToggleActive(announcement)}
                          className={`text-blue-600 hover:text-blue-800 mr-4 transition-colors ${
                            isExpired ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          disabled={isExpired}
                        >
                          {announcement.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <Link
                          to={`/admin/announcements/edit/${announcement.id}`}
                          className="text-indigo-600 hover:text-indigo-800 mr-4 transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() =>
                            handleDeleteAnnouncement(announcement.id)
                          }
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

export default AnnouncementManagement;
