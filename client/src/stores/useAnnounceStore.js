// src/stores/useAnnouncementStore.js
import { create } from "zustand";
import axiosInstance from "../utils/axiosInstance";

const useAnnouncementStore = create((set, get) => ({
  announcements: [],
  activeAnnouncements: [],
  currentAnnouncement: null,
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

  // Get active announcements (public)
  getActiveAnnouncements: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/announcements/active");
      if (response.data.success) {
        set({
          activeAnnouncements: response.data.data,
          isLoading: false,
        });
        return { success: true };
      } else {
        set({ error: response.data.message, isLoading: false });
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch active announcements";
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  // Get all announcements (admin)
  getAnnouncements: async () => {
    const { pagination } = get();
    set({ isLoading: true, error: null });

    try {
      const params = new URLSearchParams();
      params.append("pageNumber", pagination.pageNumber);
      params.append("pageSize", pagination.pageSize);

      const response = await axiosInstance.get(
        `/announcements?${params.toString()}`
      );

      if (response.data.success) {
        const { items, pageNumber, pageSize, totalCount } = response.data.data;
        set({
          announcements: items,
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
        error.response?.data?.message || "Failed to fetch announcements";
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  // Get announcement by ID
  getAnnouncementById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(`/announcements/${id}`);
      if (response.data.success) {
        set({ currentAnnouncement: response.data.data, isLoading: false });
        return { success: true, data: response.data.data };
      } else {
        set({ error: response.data.message, isLoading: false });
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch announcement";
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  // Create announcement
  createAnnouncement: async (announcementData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post(
        "/announcements",
        announcementData
      );

      if (response.data.success) {
        set({ isLoading: false });
        return { success: true, data: response.data.data };
      } else {
        set({ error: response.data.message, isLoading: false });
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to create announcement";
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  // Update announcement
  updateAnnouncement: async (id, announcementData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.put(
        `/announcements/${id}`,
        announcementData
      );
      if (response.data.success) {
        if (get().currentAnnouncement?.id === id) {
          set({ currentAnnouncement: response.data.data });
        }
        set({ isLoading: false });
        return { success: true, data: response.data.data };
      } else {
        set({ error: response.data.message, isLoading: false });
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update announcement";
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  // Delete announcement
  deleteAnnouncement: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.delete(`/announcements/${id}`);
      if (response.data.success) {
        set({
          announcements: get().announcements.filter(
            (announcement) => announcement.id !== id
          ),
          currentAnnouncement:
            get().currentAnnouncement?.id === id
              ? null
              : get().currentAnnouncement,
          isLoading: false,
        });
        return { success: true };
      } else {
        set({ error: response.data.message, isLoading: false });
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to delete announcement";
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  clearCurrentAnnouncement: () => set({ currentAnnouncement: null }),
  clearError: () => set({ error: null }),
}));

export default useAnnouncementStore;
