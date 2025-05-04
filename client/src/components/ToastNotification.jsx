import React, { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Notification component
const ToastNotification = () => {
  // Add custom CSS for toast styling without styled-components
  useEffect(() => {
    // Create a style element
    const styleEl = document.createElement("style");

    // Add the CSS as text content
    styleEl.textContent = `
      .Toastify__toast {
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      }
      
      .Toastify__toast--success {
        background-color: #f0f9f4;
        color: #0d6832;
        border-left: 4px solid #22c55e;
      }
      
      .Toastify__toast--error {
        background-color: #fef2f2;
        color: #991b1b;
        border-left: 4px solid #ef4444;
      }
      
      .Toastify__toast--info {
        background-color: #eff6ff;
        color: #1e40af;
        border-left: 4px solid #3b82f6;
      }
      
      .Toastify__toast--warning {
        background-color: #fffbeb;
        color: #92400e;
        border-left: 4px solid #f59e0b;
      }
      
      .Toastify__progress-bar {
        height: 3px;
      }
      
      .Toastify__close-button {
        color: inherit;
        opacity: 0.7;
      }
      
      .Toastify__close-button:hover {
        opacity: 1;
      }
    `;

    // Append to head
    document.head.appendChild(styleEl);

    // Clean up on unmount
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  return (
    <ToastContainer
      position="top-right"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />
  );
};

export default ToastNotification;
