// src/stores/useStaffManagementStore.js
import { toast } from "react-toastify";
import { create } from "zustand";
import axiosInstance from "../utils/axiosInstance";
import useAuthStore from "./useAuthStore";

const useStaffManagementStore = create((set, get) => ({
  staffMembers: [],
  currentStaffMember: null,
  pagination: {
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
  },
  isLoading: false,
  error: null,

  // Get all staff members with pagination
  getStaffMembers: async () => {
    const { isAuthenticated, user } = useAuthStore.getState();
    // Only admins can manage staff
    if (!isAuthenticated || user?.role !== "Admin") {
      toast.error("Unauthorized access");
      return { success: false, message: "Unauthorized access" };
    }

    const { pagination } = get();
    set({ isLoading: true, error: null });

    try {
      const params = new URLSearchParams();
      params.append("pageNumber", pagination.pageNumber);
      params.append("pageSize", pagination.pageSize);

      const response = await axiosInstance.get(
        `/staff-management?${params.toString()}`
      );

      if (response.data.success) {
        const { items, totalCount, pageNumber, pageSize } = response.data.data;
        set({
          staffMembers: items,
          pagination: { pageNumber, pageSize, totalCount },
          isLoading: false,
        });
        return { success: true, data: response.data.data };
      } else {
        set({
          error: response.data.message || "Failed to fetch staff members",
          isLoading: false,
        });
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      console.error("Error fetching staff members:", err);
      set({
        error: err.response?.data?.message || "Failed to fetch staff members",
        isLoading: false,
      });
      return { success: false, message: err.response?.data?.message };
    }
  },

  // Get staff member by ID
  getStaffMemberById: async (id) => {
    const { isAuthenticated, user } = useAuthStore.getState();
    // Only admins can manage staff
    if (!isAuthenticated || user?.role !== "Admin") {
      toast.error("Unauthorized access");
      return { success: false, message: "Unauthorized access" };
    }

    set({ isLoading: true, error: null, currentStaffMember: null });
    try {
      const response = await axiosInstance.get(`/staff-management/${id}`);

      if (response.data.success) {
        set({
          currentStaffMember: response.data.data,
          isLoading: false,
        });
        return { success: true, data: response.data.data };
      } else {
        set({
          error: response.data.message || "Failed to fetch staff member",
          isLoading: false,
        });
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      console.error("Error fetching staff member:", err);
      set({
        error: err.response?.data?.message || "Failed to fetch staff member",
        isLoading: false,
      });
      return { success: false, message: err.response?.data?.message };
    }
  },

  // Create a new staff member
  createStaffMember: async (staffData) => {
    const { isAuthenticated, user } = useAuthStore.getState();
    // Only admins can manage staff
    if (!isAuthenticated || user?.role !== "Admin") {
      toast.error("Unauthorized access");
      return { success: false, message: "Unauthorized access" };
    }

    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post("/staff-management", staffData);

      if (response.data.success) {
        // Update the staff list if it exists
        if (get().staffMembers.length > 0) {
          set({
            staffMembers: [...get().staffMembers, response.data.data],
            pagination: {
              ...get().pagination,
              totalCount: get().pagination.totalCount + 1,
            },
          });
        }

        set({
          currentStaffMember: response.data.data,
          isLoading: false,
        });
        toast.success("Staff member created successfully");
        return { success: true, data: response.data.data };
      } else {
        set({
          error: response.data.message || "Failed to create staff member",
          isLoading: false,
        });
        toast.error(response.data.message || "Failed to create staff member");
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      console.error("Error creating staff member:", err);
      set({
        error: err.response?.data?.message || "Failed to create staff member",
        isLoading: false,
      });
      toast.error(
        err.response?.data?.message || "Failed to create staff member"
      );
      return { success: false, message: err.response?.data?.message };
    }
  },

  // Update staff member
  updateStaffMember: async (id, staffData) => {
    const { isAuthenticated, user } = useAuthStore.getState();
    // Only admins can manage staff
    if (!isAuthenticated || user?.role !== "Admin") {
      toast.error("Unauthorized access");
      return { success: false, message: "Unauthorized access" };
    }

    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.put(
        `/staff-management/${id}`,
        staffData
      );

      if (response.data.success) {
        const updatedStaff = response.data.data;

        // Update staff member in the list if it exists there
        set({
          staffMembers: get().staffMembers.map((staff) =>
            staff.id === id ? updatedStaff : staff
          ),
          // Update current staff member if it's the one being edited
          currentStaffMember:
            get().currentStaffMember?.id === id
              ? updatedStaff
              : get().currentStaffMember,
          isLoading: false,
        });

        toast.success("Staff member updated successfully");
        return { success: true, data: updatedStaff };
      } else {
        set({
          error: response.data.message || "Failed to update staff member",
          isLoading: false,
        });
        toast.error(response.data.message || "Failed to update staff member");
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      console.error("Error updating staff member:", err);
      set({
        error: err.response?.data?.message || "Failed to update staff member",
        isLoading: false,
      });
      toast.error(
        err.response?.data?.message || "Failed to update staff member"
      );
      return { success: false, message: err.response?.data?.message };
    }
  },

  // Delete staff member
  deleteStaffMember: async (id) => {
    const { isAuthenticated, user } = useAuthStore.getState();
    // Only admins can manage staff
    if (!isAuthenticated || user?.role !== "Admin") {
      toast.error("Unauthorized access");
      return { success: false, message: "Unauthorized access" };
    }

    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.delete(`/staff-management/${id}`);

      if (response.data.success) {
        // Remove staff member from the list
        set({
          staffMembers: get().staffMembers.filter((staff) => staff.id !== id),
          // Clear current staff member if it's the one being deleted
          currentStaffMember:
            get().currentStaffMember?.id === id
              ? null
              : get().currentStaffMember,
          // Update total count in pagination
          pagination: {
            ...get().pagination,
            totalCount: Math.max(0, get().pagination.totalCount - 1),
          },
          isLoading: false,
        });

        toast.success("Staff member deleted successfully");
        return { success: true };
      } else {
        set({
          error: response.data.message || "Failed to delete staff member",
          isLoading: false,
        });
        toast.error(response.data.message || "Failed to delete staff member");
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      console.error("Error deleting staff member:", err);
      set({
        error: err.response?.data?.message || "Failed to delete staff member",
        isLoading: false,
      });
      toast.error(
        err.response?.data?.message || "Failed to delete staff member"
      );
      return { success: false, message: err.response?.data?.message };
    }
  },

  // Set pagination
  setPagination: (pagination) => {
    set({ pagination: { ...get().pagination, ...pagination } });
  },

  // Clear current staff member
  clearCurrentStaffMember: () => {
    set({ currentStaffMember: null });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));

export default useStaffManagementStore;
