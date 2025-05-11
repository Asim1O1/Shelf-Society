// src/components/user/NotificationsPanel.jsx
import { useCallback, useEffect, useRef, useState } from "react";
import { FaBell, FaBook, FaBug, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import useAuthStore from "../../stores/useAuthStore";
import {
  getConnection,
  isConnected,
  startSignalRService,
} from "../../utils/signalRService";

// Enable this for detailed logging
const DEBUG_MODE = true;

// Helper log function
const log = (message, ...args) => {
  if (DEBUG_MODE) {
    console.log(
      `[NotificationsPanel ${new Date().toISOString()}] ${message}`,
      ...args
    );
  }
};

const NotificationsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [signalRStatus, setSignalRStatus] = useState("disconnected");
  const [unreadCount, setUnreadCount] = useState(0);
  const [debugLog, setDebugLog] = useState([]);
  const [showDebug, setShowDebug] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  // Add to debug log
  const addLog = useCallback((message) => {
    if (DEBUG_MODE) {
      setDebugLog((prev) => {
        const newLogs = [
          `${new Date().toLocaleTimeString()}: ${message}`,
          ...prev,
        ];
        // Keep only last 20 log entries to avoid performance issues
        return newLogs.slice(0, 20);
      });
    }
  }, []);

  // Connection monitoring
  const connectionMonitorRef = useRef(null);

  // Initialize SignalR and set up notification handling
  useEffect(() => {
    log("Component mounted, isAuthenticated:", isAuthenticated);
    addLog(`Component mounted, user: ${user?.email || "none"}`);

    if (!isAuthenticated) {
      log("Not authenticated, skipping SignalR setup");
      addLog("Not authenticated, skipping setup");
      return;
    }

    // Set up the global notification handler
    log("Setting up global notification handler");
    addLog("Setting up notification handler");

    window.handleBookOrderNotification = (data) => {
      log("Notification received via global handler:", data);
      addLog(`Received notification for Order #${data.orderId}`);

      // Create a new notification object
      const newNotification = {
        id: `order-${data.orderId}-${Date.now()}`,
        message: data.message,
        books: data.books || [],
        timestamp: new Date(data.completedAt || Date.now()),
        read: false,
      };

      log("Created notification object:", newNotification);

      // Add to notifications list
      setNotifications((prev) => {
        const updated = [newNotification, ...prev].slice(0, 20);
        addLog(`Updated notifications count: ${updated.length}`);
        // Save to localStorage
        try {
          localStorage.setItem(
            "bookstoreNotifications",
            JSON.stringify(updated)
          );
        } catch (err) {
          log("Error saving to localStorage:", err);
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
      log("Initializing SignalR connection...");
      addLog("Connecting to SignalR...");

      try {
        const success = await startSignalRService();
        log("SignalR initialization result:", success);
        addLog(`SignalR connected: ${success ? "Yes" : "No"}`);

        setSignalRStatus(success ? "connected" : "disconnected");

        // Start connection monitoring
        if (connectionMonitorRef.current) {
          clearInterval(connectionMonitorRef.current);
        }

        connectionMonitorRef.current = setInterval(() => {
          const connected = isConnected();
          setSignalRStatus(connected ? "connected" : "disconnected");

          if (!connected) {
            log("Connection lost, attempting reconnect...");
            addLog("Connection lost, reconnecting...");
          }
        }, 10000);
      } catch (err) {
        log("Error initializing SignalR:", err);
        addLog(`Connection error: ${err.message}`);
        setSignalRStatus("disconnected");
      }
    };

    initializeRealtime();

    // Load notifications from localStorage
    try {
      log("Loading saved notifications from localStorage");
      const savedNotifications = localStorage.getItem("bookstoreNotifications");
      if (savedNotifications) {
        const parsed = JSON.parse(savedNotifications);
        log(`Loaded ${parsed.length} notifications from localStorage`);
        addLog(`Loaded ${parsed.length} saved notifications`);
        setNotifications(parsed);
        setUnreadCount(parsed.filter((n) => !n.read).length);
      }
    } catch (err) {
      log("Error loading saved notifications:", err);
      addLog(`Error loading saved notifications: ${err.message}`);
    }

    return () => {
      log("Component unmounting, cleaning up");
      // Clean up the global handler
      window.handleBookOrderNotification = null;

      // Clear connection monitoring
      if (connectionMonitorRef.current) {
        clearInterval(connectionMonitorRef.current);
      }

      log("Cleanup complete");
    };
  }, [isAuthenticated, user, addLog]);

  // Toggle the notification panel
  const togglePanel = () => {
    log("Toggling notification panel, current state:", isOpen);
    setIsOpen(!isOpen);

    if (!isOpen) {
      log("Opening panel, marking all as read");
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
          log("Error saving to localStorage:", err);
        }
        return updated;
      });
      setUnreadCount(0);
    }
  };

  // Clear all notifications
  const clearNotifications = () => {
    log("Clearing all notifications");
    setNotifications([]);
    setUnreadCount(0);

    // Clear localStorage
    try {
      localStorage.removeItem("bookstoreNotifications");
    } catch (err) {
      log("Error clearing localStorage:", err);
    }
  };

  // Manual reconnect function for debug panel
  const manualReconnect = async () => {
    log("Manual reconnect requested");
    addLog("Manual reconnect requested");

    try {
      await startSignalRService();
      addLog("Reconnect attempt completed");
    } catch (err) {
      log("Manual reconnect failed:", err);
      addLog(`Reconnect failed: ${err.message}`);
    }
  };

  // Force test notification
  const testNotification = () => {
    log("Test notification requested");
    addLog("Triggering test notification");

    // Simulate a notification
    if (window.handleBookOrderNotification) {
      window.handleBookOrderNotification({
        orderId: 999,
        totalItems: 3,
        finalAmount: 59.99,
        books: [
          {
            bookId: 1,
            title: "Test Book 1",
            author: "Test Author",
            quantity: 1,
          },
          {
            bookId: 2,
            title: "Test Book 2",
            author: "Another Author",
            quantity: 2,
          },
        ],
        message: "Test notification: Order #999 has been completed!",
        completedAt: new Date().toISOString(),
      });
    } else {
      log("ERROR: No notification handler registered");
      addLog("ERROR: No notification handler found");
      toast.error("Notification system not initialized");
    }
  };

  // Format date/time
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
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

      {DEBUG_MODE && (
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="absolute -top-1 -left-1 text-gray-400 hover:text-gray-600"
          title="Toggle debug panel"
        >
          <FaBug className="h-4 w-4" />
        </button>
      )}

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
                {DEBUG_MODE && (
                  <button
                    onClick={testNotification}
                    className="mt-4 px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                  >
                    Test Notification
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Debug Panel */}
      {DEBUG_MODE && showDebug && (
        <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 border border-gray-200 overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <div className="font-medium text-sm">Debug Panel</div>
            <div className="flex gap-2">
              <button
                onClick={manualReconnect}
                className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
              >
                Reconnect
              </button>
              <button
                onClick={testNotification}
                className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
              >
                Test
              </button>
            </div>
          </div>

          <div className="p-3 bg-gray-900 text-green-400 font-mono text-xs overflow-y-auto max-h-60">
            <div className="mb-2">
              <span className="text-gray-400">Status:</span> {signalRStatus}
              <span className="ml-2 text-gray-400">User:</span>{" "}
              {user?.email || "none"}
            </div>
            <div className="mb-2">
              <span className="text-gray-400">Connection ID:</span>{" "}
              {getConnection()?.connectionId || "none"}
            </div>
            <div className="text-gray-400 border-t border-gray-700 pt-1 mb-1">
              Log:
            </div>
            {debugLog.map((entry, i) => (
              <div key={i} className="whitespace-pre-wrap break-all mb-1">
                {entry}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;
