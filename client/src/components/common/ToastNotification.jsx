import { Toaster } from "sonner";

// Notification component using Sonner
const ToastNotification = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        className: "custom-toast",
        style: {
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
        },
        success: {
          style: {
            backgroundColor: "#f0f9f4",
            color: "#0d6832",
            borderLeft: "4px solid #22c55e",
          },
        },
        error: {
          style: {
            backgroundColor: "#fef2f2",
            color: "#991b1b",
            borderLeft: "4px solid #ef4444",
          },
        },
        info: {
          style: {
            backgroundColor: "#eff6ff",
            color: "#1e40af",
            borderLeft: "4px solid #3b82f6",
          },
        },
        warning: {
          style: {
            backgroundColor: "#fffbeb",
            color: "#92400e",
            borderLeft: "4px solid #f59e0b",
          },
        },
      }}
      closeButton
      richColors
      expand={false}
      pauseOnHover
    />
  );
};

export default ToastNotification;
