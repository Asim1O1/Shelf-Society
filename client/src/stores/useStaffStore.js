// src/stores/useStaffStore.js
import { toast } from "react-toastify";
import { create } from "zustand";
import axiosInstance from "../utils/axiosInstance";
import useAuthStore from "./useAuthStore";
import useOrderStore from "./useOrderStore";

const useStaffStore = create((set, get) => ({
  // General state
  isLoading: false,
  error: null,

  // Staff dashboard stats
  dashboardStats: {
    pendingOrders: 0,
    confirmedOrders: 0,
    readyOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalOrders: 0,
    todayOrders: 0,
    todayRevenue: 0,
  },

  // Order details
  orderDetail: null,

  // Orders list with pagination
  ordersList: {
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
  },

  // Real-time processing state
  recentCompletions: [],

  // Order processing functions

  // Check if user has staff permissions
  hasStaffAccess: () => {
    const { isAuthenticated, user } = useAuthStore.getState();
    if (
      !isAuthenticated ||
      (user?.role !== "Staff" && user?.role !== "Admin")
    ) {
      toast.error("Unauthorized access");
      return false;
    }
    return true;
  },

  // Process an order by claim code (wrapper around orderStore function)
  processClaimCode: async (claimCode) => {
    if (!get().hasStaffAccess()) return { success: false };

    set({ isLoading: true, error: null });

    try {
      // Use the orderStore function to get the order
      const result = await useOrderStore
        .getState()
        .getOrderByClaimCode(claimCode);

      set({ isLoading: false });

      if (result.success) {
        toast.success(`Order found: #${result.data.id}`);
      } else {
        set({ error: result.message || "Invalid claim code" });
        toast.error(result.message || "Invalid claim code");
      }

      return result;
    } catch (err) {
      console.error("Error processing claim code:", err);
      set({
        error: err.response?.data?.message || "Failed to process claim code",
        isLoading: false,
      });
      toast.error(
        err.response?.data?.message || "Failed to process claim code"
      );
      return { success: false, message: err.response?.data?.message };
    }
  },

  // Get order details (for staff) by ID
  getOrderDetail: async (id) => {
    if (!get().hasStaffAccess()) return { success: false };

    set({ isLoading: true, error: null });

    try {
      const response = await axiosInstance.get(`/staff/orders/${id}`);

      if (response.data.success) {
        set({
          orderDetail: response.data.data,
          isLoading: false,
        });
        return { success: true, data: response.data.data };
      } else {
        set({
          error: response.data.message || "Failed to fetch order details",
          isLoading: false,
        });
        toast.error(response.data.message || "Failed to fetch order details");
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      console.error("Error fetching order details:", err);
      set({
        error: err.response?.data?.message || "Failed to fetch order details",
        isLoading: false,
      });
      toast.error(
        err.response?.data?.message || "Failed to fetch order details"
      );
      return { success: false, message: err.response?.data?.message };
    }
  },

  // Get paginated orders list with filters
  getOrdersList: async (params = {}) => {
    if (!get().hasStaffAccess()) return { success: false };

    set({ isLoading: true, error: null });

    try {
      // Set default values for pagination if not provided
      const queryParams = {
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        ...params,
      };

      const response = await axiosInstance.get("/orders/list/all", {
        params: queryParams,
      });

      if (response.data.success) {
        set({
          ordersList: response.data.data,
          isLoading: false,
        });
        return { success: true, data: response.data.data };
      } else {
        set({
          error: response.data.message || "Failed to fetch orders list",
          isLoading: false,
        });
        toast.error(response.data.message || "Failed to fetch orders list");
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      console.error("Error fetching orders list:", err);
      set({
        error: err.response?.data?.message || "Failed to fetch orders list",
        isLoading: false,
      });
      toast.error(err.response?.data?.message || "Failed to fetch orders list");
      return { success: false, message: err.response?.data?.message };
    }
  },

  // Update order status (wrapper around orderStore function with additional functionality)
  updateOrderStatus: async (id, status) => {
    if (!get().hasStaffAccess()) return { success: false };

    set({ isLoading: true, error: null });

    try {
      // Use the orderStore function to update status
      const result = await useOrderStore
        .getState()
        .updateOrderStatus(id, status);

      if (result.success) {
        // If order was completed, add to recent completions
        if (status === "Completed") {
          const completionData = {
            id: result.data.id,
            completedAt: new Date(),
            totalItems: result.data.totalItems,
            finalAmount: result.data.finalAmount,
          };

          // Add to recent completions (keep most recent 10)
          set((state) => ({
            recentCompletions: [
              completionData,
              ...state.recentCompletions,
            ].slice(0, 10),
          }));
        }

        // Refresh the order detail if currently viewing an order
        if (get().orderDetail && get().orderDetail.id === id) {
          get().getOrderDetail(id);
        }

        // Refresh stats after status change
        get().getDashboardStats();
      }

      set({ isLoading: false });
      return result;
    } catch (err) {
      console.error("Error updating order status:", err);
      set({
        error: err.response?.data?.message || "Failed to update order status",
        isLoading: false,
      });
      toast.error(
        err.response?.data?.message || "Failed to update order status"
      );
      return { success: false, message: err.response?.data?.message };
    }
  },

  // Get staff dashboard statistics
  getDashboardStats: async () => {
    if (!get().hasStaffAccess()) return { success: false };

    set({ isLoading: true, error: null });

    try {
      const response = await axiosInstance.get("/staff/dashboard/stats");

      if (response.data.success) {
        set({
          dashboardStats: response.data.data,
          isLoading: false,
        });
        return { success: true, data: response.data.data };
      } else {
        set({
          error: response.data.message || "Failed to fetch dashboard stats",
          isLoading: false,
        });
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      set({
        error: err.response?.data?.message || "Failed to fetch dashboard stats",
        isLoading: false,
      });
      return { success: false, message: err.response?.data?.message };
    }
  },

  // Handle real-time order completion notifications from SignalR
  handleOrderCompletedNotification: (notification) => {
    // Add to recent completions
    set((state) => ({
      recentCompletions: [
        {
          id: notification.orderId,
          completedAt: new Date(notification.completedAt),
          totalItems: notification.totalItems,
          finalAmount: notification.finalAmount,
        },
        ...state.recentCompletions,
      ].slice(0, 10),
    }));

    // Show toast notification
    toast.success(notification.message);

    // Refresh dashboard stats
    get().getDashboardStats();
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Reset state (for logout, etc)
  reset: () => {
    set({
      isLoading: false,
      error: null,
      dashboardStats: {
        pendingOrders: 0,
        confirmedOrders: 0,
        readyOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        totalOrders: 0,
        todayOrders: 0,
        todayRevenue: 0,
      },
      orderDetail: null,
      ordersList: {
        items: [],
        totalCount: 0,
        pageNumber: 1,
        pageSize: 10,
      },
      recentCompletions: [],
    });
  },
}));

export default useStaffStore;
