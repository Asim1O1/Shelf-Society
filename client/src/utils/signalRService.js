// src/utils/signalRService.js
import * as signalR from "@microsoft/signalr";
import useAuthStore from "../stores/useAuthStore";
import useStaffStore from "../stores/useStaffStore";

// SignalR connection instance
let connection = null;

// Custom event emitter for notifications
const notificationListeners = [];

export const addNotificationListener = (listener) => {
  notificationListeners.push(listener);
  return () => {
    const index = notificationListeners.indexOf(listener);
    if (index > -1) {
      notificationListeners.splice(index, 1);
    }
  };
};

const notifyListeners = (notification) => {
  notificationListeners.forEach((listener) => listener(notification));
};

// Initialize the SignalR connection
export const initializeSignalRConnection = async () => {
  // If already connected, don't reconnect
  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    console.log("SignalR connection already established");
    return connection;
  }

  try {
    // Get auth token for connection
    const { getToken } = useAuthStore.getState();
    const token = await getToken();

    // Create connection with authentication
    connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5009/orderhub", {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .build();

    // Register event handlers
    registerEventHandlers(connection);

    // Start connection
    await connection.start();
    console.log("SignalR connected successfully");

    return connection;
  } catch (error) {
    console.error("Error establishing SignalR connection:", error);
    throw error;
  }
};

// Register SignalR event handlers
const registerEventHandlers = (connection) => {
  // Handle "OrderCompleted" notifications
  connection.on("OrderCompleted", (notification) => {
    console.log("Order completed notification received:", notification);

    // Forward to staff store for handling if user is staff
    const { user } = useAuthStore.getState();
    if (user?.role === "Staff" || user?.role === "Admin") {
      const { handleOrderCompletedNotification } = useStaffStore.getState();
      handleOrderCompletedNotification(notification);
    }

    // Notify all listeners (including NotificationsPanel)
    notifyListeners(notification);
  });

  // Add other event handlers as needed
};

// Stop the SignalR connection
export const stopSignalRConnection = async () => {
  if (connection) {
    try {
      await connection.stop();
      console.log("SignalR connection stopped");
    } catch (error) {
      console.error("Error stopping SignalR connection:", error);
    }
  }
};

// Check connection status
export const isConnected = () => {
  return (
    connection && connection.state === signalR.HubConnectionState.Connected
  );
};

// Get the SignalR connection instance (useful for direct access)
export const getConnection = () => {
  return connection;
};

// Auto-reconnect handler (can be called from components that detect connection issues)
export const reconnect = async () => {
  if (connection && connection.state !== signalR.HubConnectionState.Connected) {
    try {
      await connection.start();
      console.log("SignalR reconnected successfully");
      return true;
    } catch (error) {
      console.error("Error reconnecting SignalR:", error);
      return false;
    }
  }
  return isConnected();
};

// Start SignalR service for any authenticated user
export const startSignalRService = async () => {
  const { isAuthenticated } = useAuthStore.getState();

  // Connect for any authenticated user
  if (isAuthenticated) {
    try {
      console.log("Starting SignalR service for authenticated user");
      await initializeSignalRConnection();
      return true;
    } catch (error) {
      console.error("Failed to start SignalR service:", error);
      return false;
    }
  }
  return false;
};

export default {
  initializeSignalRConnection,
  stopSignalRConnection,
  isConnected,
  getConnection,
  reconnect,
  startSignalRService,
  addNotificationListener,
};
