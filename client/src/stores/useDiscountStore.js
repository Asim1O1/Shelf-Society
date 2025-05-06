// src/stores/useDiscountStore.js
import { create } from "zustand";
import axiosInstance from "../utils/axiosInstance";

const useDiscountStore = create((set, get) => ({
  discounts: [],
  currentDiscount: null,
  pagination: {
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
  },
  isLoading: false,
  error: null,

  // Set pagination
  setPagination: (pagination) => {
    set({ pagination: { ...get().pagination, ...pagination } });
  },

  // Get all discounts
  getDiscounts: async (activeOnly = false) => {
    const { pagination } = get();
    set({ isLoading: true, error: null });

    try {
      const params = new URLSearchParams();
      params.append("pageNumber", pagination.pageNumber);
      params.append("pageSize", pagination.pageSize);

      if (activeOnly) {
        params.append("activeOnly", true);
      }

      const response = await axiosInstance.get(
        `/discounts?${params.toString()}`
      );

      if (response.data.success) {
        const { items, pageNumber, pageSize, totalCount } = response.data.data;
        set({
          discounts: items,
          pagination: { pageNumber, pageSize, totalCount },
          isLoading: false,
        });
        return { success: true };
      } else {
        set({ error: response.data.message, isLoading: false });
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch discounts";
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  // Get discount by ID
  getDiscountById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(`/discounts/${id}`);
      if (response.data.success) {
        set({ currentDiscount: response.data.data, isLoading: false });
        return { success: true, data: response.data.data };
      } else {
        set({ error: response.data.message, isLoading: false });
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch discount";
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  // Create discount
  createDiscount: async (discountData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post("/discounts", discountData);

      if (response.data.success) {
        set({ isLoading: false });
        return { success: true, data: response.data.data };
      } else {
        set({ error: response.data.message, isLoading: false });
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to create discount";
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  // Update discount
  updateDiscount: async (id, discountData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.put(
        `/discounts/${id}`,
        discountData
      );
      if (response.data.success) {
        if (get().currentDiscount?.id === id) {
          set({ currentDiscount: response.data.data });
        }
        set({ isLoading: false });
        return { success: true, data: response.data.data };
      } else {
        set({ error: response.data.message, isLoading: false });
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update discount";
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  // Delete discount
  deleteDiscount: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.delete(`/discounts/${id}`);
      if (response.data.success) {
        set({
          discounts: get().discounts.filter((discount) => discount.id !== id),
          currentDiscount:
            get().currentDiscount?.id === id ? null : get().currentDiscount,
          isLoading: false,
        });
        return { success: true };
      } else {
        set({ error: response.data.message, isLoading: false });
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to delete discount";
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  clearCurrentDiscount: () => set({ currentDiscount: null }),
  clearError: () => set({ error: null }),
}));

export default useDiscountStore;
