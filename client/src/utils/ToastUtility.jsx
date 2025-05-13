import { toast } from "sonner";

// Toast utility functions as a simple object to be imported
const ToastUtility = {
  success: (message) => {
    toast.success(message);
  },
  error: (message) => {
    toast.error(message);
  },
  info: (message) => {
    toast.info(message);
  },
  warning: (message) => {
    toast.warning(message);
  },
  promise: (promise, messages) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    });
  },
};

// Export as default for usage like: import ToastUtility from "../utils/ToastUtility";
export default ToastUtility;

// Also export a hook for components that prefer the hook pattern
export const useToast = () => {
  return {
    success: (message) => toast.success(message),
    error: (message) => toast.error(message),
    info: (message) => toast.info(message),
    warning: (message) => toast.warning(message),
    promise: (promise, messages) =>
      toast.promise(promise, {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      }),
  };
};

