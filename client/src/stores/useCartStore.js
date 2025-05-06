// src/stores/useCartStore.js
import { toast } from "react-toastify";
import { create } from "zustand";
import axiosInstance from "../utils/axiosInstance";
import useAuthStore from "./useAuthStore";

const useCartStore = create((set, get) => ({
  cart: null,
  isLoading: false,
  error: null,

  // Get cart items
  getCart: async () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) return;

    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/cart");
      if (response.data.success) {
        set({
          cart: response.data.data,
          isLoading: false,
        });
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      set({
        error: "Failed to load cart. Please try again later.",
        isLoading: false,
      });
    }
  },

  // Add item to cart
  addToCart: async (bookId, quantity = 1) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post("/cart", {
        bookId,
        quantity,
      });

      if (response.data.success) {
        set({ cart: response.data.data, isLoading: false });
        toast.success("Item added to cart");
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error adding to cart:", err);
      set({
        error: err.response?.data?.message || "Failed to add item to cart",
        isLoading: false,
      });
      toast.error(err.response?.data?.message || "Failed to add item to cart");
      return false;
    }
  },

  // Update cart item
  updateCartItem: async (itemId, quantity) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.put(`/cart/items/${itemId}`, {
        quantity,
      });

      if (response.data.success) {
        set({ cart: response.data.data, isLoading: false });
        toast.success("Cart updated");
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error updating cart:", err);
      set({
        error: err.response?.data?.message || "Failed to update cart",
        isLoading: false,
      });
      toast.error(err.response?.data?.message || "Failed to update cart");
      return false;
    }
  },

  // Remove item from cart
  removeFromCart: async (itemId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.delete(`/cart/items/${itemId}`);

      if (response.data.success) {
        set({ cart: response.data.data, isLoading: false });
        toast.success("Item removed from cart");
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error removing from cart:", err);
      set({
        error: err.response?.data?.message || "Failed to remove item",
        isLoading: false,
      });
      toast.error(err.response?.data?.message || "Failed to remove item");
      return false;
    }
  },

  // Clear cart
  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.delete("/cart");

      if (response.data.success) {
        set({ cart: response.data.data, isLoading: false });
        toast.success("Cart cleared");
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error clearing cart:", err);
      set({
        error: err.response?.data?.message || "Failed to clear cart",
        isLoading: false,
      });
      toast.error(err.response?.data?.message || "Failed to clear cart");
      return false;
    }
  },

  // Reset cart state (e.g., after logout)
  resetCart: () => {
    set({ cart: null, isLoading: false, error: null });
  },
}));

export default useCartStore;
