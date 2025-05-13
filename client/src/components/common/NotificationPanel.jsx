// src/components/user/NotificationsPanel.jsx
<<<<<<< HEAD
import { useCallback, useEffect, useRef, useState } from "react";
import { FaBell, FaBook, FaTimes, FaTrash } from "react-icons/fa";
=======
import { useEffect, useState } from "react";
import { FaBell, FaBook, FaTimes } from "react-icons/fa";
>>>>>>> c2e8d12 (multiple UI updates, duplicate notification display bug fixed)
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  addNotificationListener,
  isConnected,
  startSignalRService,
} from "../../utils/signalRService";

<<<<<<< HEAD
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

=======
>>>>>>> c2e8d12 (multiple UI updates, duplicate notification display bug fixed)
const NotificationsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [signalRStatus, setSignalRStatus] = useState("disconnected");
  const [unreadCount, setUnreadCount] = useState(0);
<<<<<<< HEAD
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
=======

  useEffect(() => {
    // Start SignalR connection
    const connectSignalR = async () => {
>>>>>>> c2e8d12 (multiple UI updates, duplicate notification display bug fixed)
      try {
        console.log("NotificationsPanel: Connecting to SignalR...");
        const success = await startSignalRService();
<<<<<<< HEAD
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
=======
        console.log("NotificationsPanel: SignalR connection status:", success);
        setSignalRStatus(success ? "connected" : "disconnected");
      } catch (err) {
        console.error("NotificationsPanel: Error connecting to SignalR:", err);
>>>>>>> c2e8d12 (multiple UI updates, duplicate notification display bug fixed)
        setSignalRStatus("disconnected");
      } finally {
        setIsLoading(false);
      }
    };

    connectSignalR();

    // Add notification listener
    const removeListener = addNotificationListener((notification) => {
      console.log("NotificationsPanel: Notification received", notification);

      // Create notification object
      const newNotification = {
        id: `order-${notification.orderId}-${Date.now()}`,
        message: notification.message,
        books: notification.books || [],
        timestamp: new Date(notification.completedAt || Date.now()),
        read: false,
      };

      // Add to state
      setNotifications((prev) => [newNotification, ...prev].slice(0, 20));
      setUnreadCount((prev) => prev + 1);

      // Show toast
      toast.success(notification.message, {
        position: "bottom-right",
        autoClose: 5000,
      });
    });

    // Check connection status periodically
    const statusInterval = setInterval(() => {
      setSignalRStatus(isConnected() ? "connected" : "disconnected");
    }, 10000);

    // Load saved notifications from localStorage
    try {
<<<<<<< HEAD
      const savedNotifications = localStorage.getItem("bookstoreNotifications");
      if (savedNotifications) {
        const parsed = JSON.parse(savedNotifications);
=======
      const saved = localStorage.getItem("bookstoreNotifications");
      if (saved) {
        const parsed = JSON.parse(saved);
>>>>>>> c2e8d12 (multiple UI updates, duplicate notification display bug fixed)
        setNotifications(parsed);
        setUnreadCount(parsed.filter((n) => !n.read).length);
      }
    } catch (err) {
      console.error("Error loading saved notifications:", err);
<<<<<<< HEAD
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
=======
    }

    return () => {
      clearInterval(statusInterval);
      removeListener();
    };
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(
      "bookstoreNotifications",
      JSON.stringify(notifications)
    );
  }, [notifications]);
>>>>>>> c2e8d12 (multiple UI updates, duplicate notification display bug fixed)

  // Toggle the notification panel
  const togglePanel = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Mark all as read when opening
<<<<<<< HEAD
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
=======
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
>>>>>>> c2e8d12 (multiple UI updates, duplicate notification display bug fixed)
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
<<<<<<< HEAD
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
=======
    setNotifications([]);
    setUnreadCount(0);
  };

  // Format time
>>>>>>> c2e8d12 (multiple UI updates, duplicate notification display bug fixed)
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
<<<<<<< HEAD
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
=======
    <div className="relative">
      <button
        onClick={togglePanel}
        className="relative p-2 text-gray-700 hover:text-blue-600 focus:outline-none"
        aria-label="Notifications"
      >
        <FaBell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <div className="font-medium">Notifications</div>
            <div className="flex items-center">
              <div
                className={`h-2 w-2 rounded-full mr-2 ${
                  signalRStatus === "connected" ? "bg-green-500" : "bg-red-500"
                }`}
                title={
                  signalRStatus === "connected" ? "Connected" : "Disconnected"
                }
              ></div>
              <button
                onClick={clearNotifications}
                className="text-gray-500 hover:text-gray-700"
                title="Clear all"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-96">
            {notifications.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 ${
                      notification.read ? "" : "bg-blue-50"
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3 mt-1">
                        <FaBook className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTime(notification.timestamp)}
                        </p>

                        {notification.books &&
                          notification.books.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-gray-700">
                                Books purchased:
                              </p>
                              <ul className="mt-1 space-y-1">
                                {notification.books.slice(0, 3).map((book) => (
                                  <li key={book.bookId} className="text-xs">
                                    <Link
                                      to={`/books/${book.bookId}`}
                                      className="text-blue-600 hover:underline"
                                    >
                                      {book.quantity > 1
                                        ? `${book.quantity}× `
                                        : ""}
                                      {book.title}
                                    </Link>
                                  </li>
                                ))}
                                {notification.books.length > 3 && (
                                  <li className="text-xs text-gray-500">
                                    +{notification.books.length - 3} more
                                    book(s)
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
              <div className="py-8 text-center text-gray-500">
                <p className="mb-1">No notifications yet</p>
                <p className="text-xs">You'll see when people purchase books</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
>>>>>>> c2e8d12 (multiple UI updates, duplicate notification display bug fixed)
  );
};

export default NotificationsPanel;
