// src/stores/useOrderStore.js
import { toast } from "react-toastify";
import { create } from "zustand";
import axiosInstance from "../utils/axiosInstance";
import useAuthStore from "./useAuthStore";

const useOrderStore = create((set, get) => ({
  orders: [],
  currentOrder: null,
  pagination: {
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
  },
  isLoading: false,
  error: null,

  // Get user's orders with pagination
  getOrders: async () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) return;

    const { pagination } = get();
    set({ isLoading: true, error: null });

    try {
      const params = new URLSearchParams();
      params.append("pageNumber", pagination.pageNumber);
      params.append("pageSize", pagination.pageSize);

      const response = await axiosInstance.get(`/orders?${params.toString()}`);

      if (response.data.success) {
        const { items, totalCount, pageNumber, pageSize } = response.data.data;
        set({
          orders: items,
          pagination: { pageNumber, pageSize, totalCount },
          isLoading: false,
        });
        return { success: true };
      } else {
        set({
          error: response.data.message || "Failed to fetch orders",
          isLoading: false,
        });
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      set({
        error: err.response?.data?.message || "Failed to fetch orders",
        isLoading: false,
      });
      return { success: false, message: err.response?.data?.message };
    }
  },

  // Get order by ID
  getOrderById: async (id) => {
    set({ isLoading: true, error: null, currentOrder: null });
    try {
      const response = await axiosInstance.get(`/orders/${id}`);

      if (response.data.success) {
        set({
          currentOrder: response.data.data,
          isLoading: false,
        });
        return { success: true, data: response.data.data };
      } else {
        set({
          error: response.data.message || "Failed to fetch order",
          isLoading: false,
        });
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      set({
        error: err.response?.data?.message || "Failed to fetch order",
        isLoading: false,
      });
      return { success: false, message: err.response?.data?.message };
    }
  },

  // Place a new order
  placeOrder: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post("/orders", {});

      if (response.data.success) {
        set({
          currentOrder: response.data.data,
          isLoading: false,
        });
        toast.success("Order placed successfully");
        return { success: true, data: response.data.data };
      } else {
        set({
          error: response.data.message || "Failed to place order",
          isLoading: false,
        });
        toast.error(response.data.message || "Failed to place order");
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      console.error("Error placing order:", err);
      set({
        error: err.response?.data?.message || "Failed to place order",
        isLoading: false,
      });
      toast.error(err.response?.data?.message || "Failed to place order");
      return { success: false, message: err.response?.data?.message };
    }
  },

  // Cancel an order
  cancelOrder: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post(`/orders/${id}/cancel`);

      if (response.data.success) {
        // Update order in list if it exists there
        set({
          orders: get().orders.map((order) =>
            order.id === id ? response.data.data : order
          ),
          // Update current order if it's the one being cancelled
          currentOrder:
            get().currentOrder?.id === id
              ? response.data.data
              : get().currentOrder,
          isLoading: false,
        });
        toast.success("Order cancelled successfully");
        return { success: true, data: response.data.data };
      } else {
        set({
          error: response.data.message || "Failed to cancel order",
          isLoading: false,
        });
        toast.error(response.data.message || "Failed to cancel order");
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      console.error("Error cancelling order:", err);
      set({
        error: err.response?.data?.message || "Failed to cancel order",
        isLoading: false,
      });
      toast.error(err.response?.data?.message || "Failed to cancel order");
      return { success: false, message: err.response?.data?.message };
    }
  },

  // For staff: Get order by claim code
  getOrderByClaimCode: async (claimCode) => {
    set({ isLoading: true, error: null, currentOrder: null });
    try {
      const response = await axiosInstance.get(
        `/staff/orders/claim/${claimCode}`
      );

      if (response.data.success) {
        set({
          currentOrder: response.data.data,
          isLoading: false,
        });
        return { success: true, data: response.data.data };
      } else {
        set({
          error: response.data.message || "Failed to fetch order",
          isLoading: false,
        });
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      console.error("Error fetching order by claim code:", err);
      set({
        error: err.response?.data?.message || "Failed to fetch order",
        isLoading: false,
      });
      return { success: false, message: err.response?.data?.message };
    }
  },

  // For staff: Update order status
  updateOrderStatus: async (id, status) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.put(`/staff/orders/${id}/status`, {
        status,
      });

      if (response.data.success) {
        set({
          currentOrder: response.data.data,
          isLoading: false,
        });
        toast.success(`Order status updated to ${status}`);
        return { success: true, data: response.data.data };
      } else {
        set({
          error: response.data.message || "Failed to update order status",
          isLoading: false,
        });
        toast.error(response.data.message || "Failed to update order status");
        return { success: false, message: response.data.message };
      }
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

  // Set pagination
  setPagination: (pagination) => {
    set({ pagination: { ...get().pagination, ...pagination } });
  },

  // Clear current order
  clearCurrentOrder: () => {
    set({ currentOrder: null });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));

export default useOrderStore;
