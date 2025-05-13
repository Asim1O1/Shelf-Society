// src/components/user/NotificationsPanel.jsx
import { useCallback, useEffect, useRef, useState } from "react";
import { FaBell, FaBook, FaTimes, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import useAuthStore from "../../stores/useAuthStore";
import {
  getConnection,
  isConnected,
  startSignalRService,
} from "../../utils/signalRService";

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex space-x-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};

const NotificationsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [signalRStatus, setSignalRStatus] = useState("disconnected");
  const [unreadCount, setUnreadCount] = useState(0);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const connectionMonitorRef = useRef(null);

  // Initialize SignalR and set up notification handling
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    // Set up the global notification handler
    window.handleBookOrderNotification = (data) => {
      // Create a new notification object
      const newNotification = {
        id: `order-${data.orderId}-${Date.now()}`,
        message: data.message,
        books: data.books || [],
        timestamp: new Date(data.completedAt || Date.now()),
        read: false,
      };

      // Add to notifications list
      setNotifications((prev) => {
        const updated = [newNotification, ...prev].slice(0, 20);
        // Save to localStorage
        try {
          localStorage.setItem(
            "bookstoreNotifications",
            JSON.stringify(updated)
          );
        } catch (err) {
          console.error("Error saving notifications:", err);
          toast.error("Failed to save notification");
        }
        return updated;
      });

      // Update unread count
      setUnreadCount((prev) => prev + 1);

      // Show toast notification
      toast.success(data.message, {
        position: "bottom-right",
        autoClose: 5000,
      });
    };

    // Start SignalR connection
    const initializeRealtime = async () => {
      setIsLoading(true);
      try {
        const success = await startSignalRService();
        setSignalRStatus(success ? "connected" : "disconnected");

        if (success) {
          toast.success("Real-time notifications connected");
        } else {
          toast.warn("Real-time notifications unavailable");
        }

        // Start connection monitoring
        if (connectionMonitorRef.current) {
          clearInterval(connectionMonitorRef.current);
        }

        connectionMonitorRef.current = setInterval(() => {
          const connected = isConnected();
          setSignalRStatus(connected ? "connected" : "disconnected");
        }, 10000);
      } catch (err) {
        console.error("Error initializing SignalR:", err);
        toast.error("Failed to connect real-time notifications");
        setSignalRStatus("disconnected");
      } finally {
        setIsLoading(false);
      }
    };

    initializeRealtime();

    // Load notifications from localStorage
    try {
      const savedNotifications = localStorage.getItem("bookstoreNotifications");
      if (savedNotifications) {
        const parsed = JSON.parse(savedNotifications);
        setNotifications(parsed);
        setUnreadCount(parsed.filter((n) => !n.read).length);
      }
    } catch (err) {
      console.error("Error loading saved notifications:", err);
      toast.error("Failed to load saved notifications");
    }

    return () => {
      // Clean up the global handler
      window.handleBookOrderNotification = null;

      // Clear connection monitoring
      if (connectionMonitorRef.current) {
        clearInterval(connectionMonitorRef.current);
      }
    };
  }, [isAuthenticated, user]);

  // Toggle the notification panel
  const togglePanel = () => {
    setIsOpen(!isOpen);

    if (!isOpen) {
      // Mark all as read when opening
      setNotifications((prev) => {
        const updated = prev.map((n) => ({ ...n, read: true }));
        // Save to localStorage
        try {
          localStorage.setItem(
            "bookstoreNotifications",
            JSON.stringify(updated)
          );
        } catch (err) {
          console.error("Error saving notifications:", err);
        }
        return updated;
      });
      setUnreadCount(0);
    }
  };

  // Handle clear notifications button click
  const handleClearClick = () => {
    if (notifications.length === 0) {
      toast.info("No notifications to clear");
      return;
    }
    setShowClearModal(true);
  };

  // Clear all notifications
  const clearNotifications = () => {
    try {
      setNotifications([]);
      setUnreadCount(0);
      localStorage.removeItem("bookstoreNotifications");
      toast.success("All notifications cleared");
    } catch (err) {
      console.error("Error clearing notifications:", err);
      toast.error("Failed to clear notifications");
    } finally {
      setShowClearModal(false);
    }
  };

  // Format date/time
  const formatTime = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInHours = (now - notificationDate) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return notificationDate.toLocaleDateString();
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={togglePanel}
          className="relative p-2.5 text-gray-700 hover:text-red-600 hover:bg-gray-100 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label="Notifications"
        >
          <FaBell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-3 w-96 bg-white rounded-xl shadow-2xl z-50 border border-gray-100 overflow-hidden transform transition-all duration-200">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <h3 className="font-semibold text-lg">Notifications</h3>
                  <div className="flex items-center space-x-1.5">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        signalRStatus === "connected"
                          ? "bg-green-400 animate-pulse"
                          : "bg-red-400"
                      }`}
                      title={
                        signalRStatus === "connected"
                          ? "Real-time updates active"
                          : "Real-time updates inactive"
                      }
                    />
                    <span className="text-xs text-red-100">
                      {signalRStatus === "connected" ? "Live" : "Offline"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearClick}
                      className="p-1.5 text-red-100 hover:text-white hover:bg-red-700/50 rounded-lg transition-colors"
                      title="Clear all notifications"
                    >
                      <FaTrash className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={togglePanel}
                    className="p-1.5 text-red-100 hover:text-white hover:bg-red-700/50 rounded-lg transition-colors"
                  >
                    <FaTimes className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-[480px]">
              {notifications.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <li
                      key={notification.id}
                      className={`px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        notification.read ? "" : "bg-red-50/50"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="p-2 bg-red-100 rounded-full">
                            <FaBook className="h-4 w-4 text-red-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTime(notification.timestamp)}
                          </p>

                          {notification.books &&
                            notification.books.length > 0 && (
                              <div className="mt-3 bg-gray-50 rounded-lg p-3">
                                <p className="text-xs font-medium text-gray-700 mb-2">
                                  Books ordered:
                                </p>
                                <ul className="space-y-1.5">
                                  {notification.books
                                    .slice(0, 3)
                                    .map((book) => (
                                      <li key={book.bookId} className="text-xs">
                                        <Link
                                          to={`/books/${book.bookId}`}
                                          className="text-red-600 hover:text-red-800 hover:underline transition-colors"
                                        >
                                          <span className="font-medium text-gray-700">
                                            {book.quantity > 1
                                              ? `${book.quantity}× `
                                              : ""}
                                          </span>
                                          {book.title}
                                          <span className="text-gray-500 ml-1">
                                            by {book.author}
                                          </span>
                                        </Link>
                                      </li>
                                    ))}
                                  {notification.books.length > 3 && (
                                    <li className="text-xs text-gray-500 font-medium">
                                      +{notification.books.length - 3} more
                                      books
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-16 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <FaBell className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium mb-1">
                    No notifications yet
                  </p>
                  <p className="text-sm text-gray-500">
                    You'll be notified when customers place orders
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center">
                  Showing {notifications.length} notification
                  {notifications.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Clear All Confirmation Modal */}
      <ConfirmationModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={clearNotifications}
        title="Clear All Notifications"
        message="Are you sure you want to clear all notifications? This action cannot be undone."
      />
    </>
  );
};

export default NotificationsPanel;
