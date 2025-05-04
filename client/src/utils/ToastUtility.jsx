import { toast } from "react-toastify";

// Custom toast styles to match the red theme
const customToastStyles = {
  success: {
    style: {
      background: "#f8f9fa",
      color: "#333",
      borderLeft: "4px solid #ef4444",
      borderRadius: "4px",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    },
    progressStyle: {
      background: "#ef4444",
    },
    icon: "✓",
  },
  error: {
    style: {
      background: "#f8f9fa",
      color: "#333",
      borderLeft: "4px solid #ef4444",
      borderRadius: "4px",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    },
    progressStyle: {
      background: "#ef4444",
    },
    icon: "✗",
  },
  info: {
    style: {
      background: "#f8f9fa",
      color: "#333",
      borderLeft: "4px solid #ef4444",
      borderRadius: "4px",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    },
    progressStyle: {
      background: "#ef4444",
    },
    icon: "ℹ",
  },
  warning: {
    style: {
      background: "#f8f9fa",
      color: "#333",
      borderLeft: "4px solid #ef4444",
      borderRadius: "4px",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    },
    progressStyle: {
      background: "#ef4444",
    },
    icon: "⚠",
  },
};

// Helper functions to show different types of notifications
const showToast = {
  success: (message) => {
    toast.success(message, {
      style: customToastStyles.success.style,
      progressStyle: customToastStyles.success.progressStyle,
      icon: customToastStyles.success.icon,
    });
  },
  error: (message) => {
    toast.error(message, {
      style: customToastStyles.error.style,
      progressStyle: customToastStyles.error.progressStyle,
      icon: customToastStyles.error.icon,
    });
  },
  info: (message) => {
    toast.info(message, {
      style: customToastStyles.info.style,
      progressStyle: customToastStyles.info.progressStyle,
      icon: customToastStyles.info.icon,
    });
  },
  warning: (message) => {
    toast.warning(message, {
      style: customToastStyles.warning.style,
      progressStyle: customToastStyles.warning.progressStyle,
      icon: customToastStyles.warning.icon,
    });
  },
};

export default showToast;
