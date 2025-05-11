// src/utils/signalRService.js
import * as signalR from "@microsoft/signalr";
import useAuthStore from "../stores/useAuthStore";
import useStaffStore from "../stores/useStaffStore";

// Enable this for detailed connection logging
const ENABLE_DETAILED_LOGS = true;

// Helper log function
const log = (message, ...args) => {
  if (ENABLE_DETAILED_LOGS) {
    console.log(`[SignalR ${new Date().toISOString()}] ${message}`, ...args);
  }
};

// SignalR connection instance
let connection = null;

// Initialize the SignalR connection
export const initializeSignalRConnection = async () => {
  // If already connected, don't reconnect
  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    log("Connection already established - no need to reconnect");
    return connection;
  }

  try {
    // Get auth token for connection
    log("Getting authentication token...");
    const { getToken, user } = useAuthStore.getState();
    const token = await getToken();
    log("Got token, user role:", user?.role);

    // Create connection with authentication
    log("Creating new SignalR connection...");
    connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5009/orderhub", {
        accessTokenFactory: () => token,
      })
      .configureLogging(signalR.LogLevel.Debug) // Enable detailed SignalR logs
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .build();

    // Log connection state changes
    connection.onclose((error) => {
      log(
        "Connection closed",
        error ? `with error: ${error}` : "without errors"
      );
    });

    connection.onreconnecting((error) => {
      log("Attempting to reconnect...", error);
    });

    connection.onreconnected((connectionId) => {
      log("Reconnected with ID:", connectionId);
    });

    // Register event handlers
    log("Registering event handlers...");
    registerEventHandlers(connection);

    // Start connection
    log("Starting connection...");
    await connection.start();
    log("Connection started successfully with ID:", connection.connectionId);

    return connection;
  } catch (error) {
    log("ERROR establishing connection:", error);
    throw error;
  }
};

// Register SignalR event handlers
const registerEventHandlers = (connection) => {
  log("Setting up 'OrderCompleted' handler");

  // Handle "OrderCompleted" notifications
  connection.on("OrderCompleted", (notification) => {
    log("📣 ORDER COMPLETED notification received:", notification);

    // Forward to staff store for handling
    const { user } = useAuthStore.getState();
    if (user?.role === "Staff" || user?.role === "Admin") {
      log("User is staff/admin, forwarding to staff store");
      const { handleOrderCompletedNotification } = useStaffStore.getState();
      handleOrderCompletedNotification(notification);
    }

    // For all users, trigger the global notification handler
    if (window.handleBookOrderNotification) {
      log("Calling global notification handler");
      window.handleBookOrderNotification(notification);
    } else {
      log("WARNING: No global notification handler registered");
    }
  });

  // Add other event handlers as needed
};

// Stop the SignalR connection
export const stopSignalRConnection = async () => {
  if (connection) {
    try {
      log("Stopping connection...");
      await connection.stop();
      log("Connection stopped successfully");
    } catch (error) {
      log("ERROR stopping connection:", error);
    }
  }
};

// Check connection status
export const isConnected = () => {
  const status =
    connection && connection.state === signalR.HubConnectionState.Connected;
  log("Connection status check:", status ? "CONNECTED" : "DISCONNECTED");
  return status;
};

// Get the SignalR connection instance (useful for direct access)
export const getConnection = () => {
  return connection;
};

// Auto-reconnect handler (can be called from components that detect connection issues)
export const reconnect = async () => {
  if (connection && connection.state !== signalR.HubConnectionState.Connected) {
    try {
      log("Manually reconnecting...");
      await connection.start();
      log("Manual reconnection successful");
      return true;
    } catch (error) {
      log("ERROR reconnecting:", error);
      return false;
    }
  }
  return isConnected();
};

// Start SignalR service (this is the main entry point used by components)
export const startSignalRService = async () => {
  const { isAuthenticated, user } = useAuthStore.getState();
  log(
    "startSignalRService called, authenticated:",
    isAuthenticated,
    "user:",
    user?.email
  );

  if (isAuthenticated) {
    try {
      await initializeSignalRConnection();
      return true;
    } catch (error) {
      log("Failed to start SignalR service:", error);
      return false;
    }
  }

  log("User not authenticated, not starting SignalR");
  return false;
};

export default {
  initializeSignalRConnection,
  stopSignalRConnection,
  isConnected,
  getConnection,
  reconnect,
  startSignalRService,
};
