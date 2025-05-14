import { useEffect, useState } from "react";
import { FaBell, FaBook, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  addNotificationListener,
  isConnected,
  startSignalRService,
} from "../../utils/signalRService";

const NotificationsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [signalRStatus, setSignalRStatus] = useState("disconnected");
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setIsLoading] = useState("");
  const [showClearModal, setShowClearModal] = useState(false); // Added state for modal

  useEffect(() => {
    // Start SignalR connection
    const connectSignalR = async () => {
      try {
        console.log("NotificationsPanel: Connecting to SignalR...");
        const success = await startSignalRService();
        console.log("NotificationsPanel: SignalR connection status:", success);
        setSignalRStatus(success ? "connected" : "disconnected");
      } catch (err) {
        console.error("NotificationsPanel: Error connecting to SignalR:", err);
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
      const saved = localStorage.getItem("bookstoreNotifications");
      if (saved) {
        const parsed = JSON.parse(saved);
        setNotifications(parsed);
        setUnreadCount(parsed.filter((n) => !n.read).length);
      }
    } catch (err) {
      console.error("Error loading saved notifications:", err);
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

  // Toggle the notification panel
  const togglePanel = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Mark all as read when opening
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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
    setNotifications([]);
    setUnreadCount(0);
  };

  // Format time
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
                onClick={handleClearClick}
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

      {/* Clear Notifications Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Clear Notifications</h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to clear all notifications?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearNotifications();
                  setShowClearModal(false);
                }}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;
``;
