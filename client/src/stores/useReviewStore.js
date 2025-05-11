// src/stores/useReviewStore.js
import { toast } from "react-toastify";
import { create } from "zustand";
import axiosInstance from "../utils/axiosInstance";
import useAuthStore from "./useAuthStore";

const useReviewStore = create((set, get) => ({
  bookReviews: null,
  userReviews: null,
  currentReview: null,
  isLoading: false,
  error: null,

  // Get all reviews for a book
  getBookReviews: async (bookId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(`/reviews/books/${bookId}`);

      if (response.data.success) {
        set({
          bookReviews: response.data.data,
          isLoading: false,
        });
        return { success: true, data: response.data.data };
      } else {
        set({
          error: response.data.message || "Failed to fetch book reviews",
          isLoading: false,
        });
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      console.error("Error fetching book reviews:", err);
      set({
        error: err.response?.data?.message || "Failed to fetch book reviews",
        isLoading: false,
      });
      return { success: false, message: err.response?.data?.message };
    }
  },

  // Get user's reviews
  getUserReviews: async () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) return;

    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/reviews/user");

      if (response.data.success) {
        set({
          userReviews: response.data.data,
          isLoading: false,
        });
        return { success: true, data: response.data.data };
      } else {
        set({
          error: response.data.message || "Failed to fetch user reviews",
          isLoading: false,
        });
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      console.error("Error fetching user reviews:", err);
      set({
        error: err.response?.data?.message || "Failed to fetch user reviews",
        isLoading: false,
      });
      return { success: false, message: err.response?.data?.message };
    }
  },

  // Create a review
  createReview: async (reviewData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post("/reviews", reviewData);

      if (response.data.success) {
        // Update book reviews cache if available
        const { bookReviews } = get();
        if (bookReviews && bookReviews.bookId === reviewData.bookId) {
          set({
            bookReviews: {
              ...bookReviews,
              reviews: [response.data.data, ...bookReviews.reviews],
              reviewCount: bookReviews.reviewCount + 1,
              averageRating: calculateNewAverage(
                bookReviews.averageRating,
                bookReviews.reviewCount,
                response.data.data.rating
              ),
            },
          });
        }

        // Update user reviews cache if available
        const { userReviews } = get();
        if (userReviews) {
          set({
            userReviews: {
              ...userReviews,
              reviews: [response.data.data, ...userReviews.reviews],
              reviewCount: userReviews.reviewCount + 1,
            },
          });
        }

        set({
          currentReview: response.data.data,
          isLoading: false,
        });
        toast.success("Review posted successfully");
        return { success: true, data: response.data.data };
      } else {
        set({
          error: response.data.message || "Failed to create review",
          isLoading: false,
        });
        toast.error(response.data.message || "Failed to create review");
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      console.error("Error creating review:", err);
      set({
        error: err.response?.data?.message || "Failed to create review",
        isLoading: false,
      });
      toast.error(err.response?.data?.message || "Failed to create review");
      return { success: false, message: err.response?.data?.message };
    }
  },

  // Update a review
  updateReview: async (id, reviewData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.put(`/reviews/${id}`, reviewData);

      if (response.data.success) {
        const updatedReview = response.data.data;
        const { bookReviews, userReviews } = get();

        // Update book reviews cache if available
        if (bookReviews && bookReviews.bookId === updatedReview.bookId) {
          const updatedReviews = bookReviews.reviews.map((review) =>
            review.id === id ? updatedReview : review
          );

          // Recalculate average rating
          const newAverage =
            updatedReviews.reduce((sum, review) => sum + review.rating, 0) /
            updatedReviews.length;

          set({
            bookReviews: {
              ...bookReviews,
              reviews: updatedReviews,
              averageRating: newAverage,
            },
          });
        }

        // Update user reviews cache if available
        if (userReviews) {
          set({
            userReviews: {
              ...userReviews,
              reviews: userReviews.reviews.map((review) =>
                review.id === id ? updatedReview : review
              ),
            },
          });
        }

        set({
          currentReview: updatedReview,
          isLoading: false,
        });
        toast.success("Review updated successfully");
        return { success: true, data: updatedReview };
      } else {
        set({
          error: response.data.message || "Failed to update review",
          isLoading: false,
        });
        toast.error(response.data.message || "Failed to update review");
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      console.error("Error updating review:", err);
      set({
        error: err.response?.data?.message || "Failed to update review",
        isLoading: false,
      });
      toast.error(err.response?.data?.message || "Failed to update review");
      return { success: false, message: err.response?.data?.message };
    }
  },

  // Delete a review
  deleteReview: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.delete(`/reviews/${id}`);

      if (response.data.success) {
        const { bookReviews, userReviews } = get();

        // Find the review before it's removed to identify the book
        let bookId = null;
        let reviewToRemove = null;

        if (userReviews) {
          reviewToRemove = userReviews.reviews.find(
            (review) => review.id === id
          );
          if (reviewToRemove) bookId = reviewToRemove.bookId;
        }

        // Update book reviews cache if available
        if (bookReviews && (bookId === bookReviews.bookId || reviewToRemove)) {
          const updatedReviews = bookReviews.reviews.filter(
            (review) => review.id !== id
          );
          const newCount = bookReviews.reviewCount - 1;
          let newAverage = null;

          if (newCount > 0) {
            newAverage =
              updatedReviews.reduce((sum, review) => sum + review.rating, 0) /
              newCount;
          }

          set({
            bookReviews: {
              ...bookReviews,
              reviews: updatedReviews,
              reviewCount: newCount,
              averageRating: newAverage,
            },
          });
        }

        // Update user reviews cache if available
        if (userReviews) {
          const updatedReviews = userReviews.reviews.filter(
            (review) => review.id !== id
          );
          set({
            userReviews: {
              ...userReviews,
              reviews: updatedReviews,
              reviewCount: userReviews.reviewCount - 1,
            },
          });
        }

        set({
          isLoading: false,
        });
        toast.success("Review deleted successfully");
        return { success: true };
      } else {
        set({
          error: response.data.message || "Failed to delete review",
          isLoading: false,
        });
        toast.error(response.data.message || "Failed to delete review");
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      console.error("Error deleting review:", err);
      set({
        error: err.response?.data?.message || "Failed to delete review",
        isLoading: false,
      });
      toast.error(err.response?.data?.message || "Failed to delete review");
      return { success: false, message: err.response?.data?.message };
    }
  },

  // Clear book reviews
  clearBookReviews: () => {
    set({ bookReviews: null });
  },

  // Clear user reviews
  clearUserReviews: () => {
    set({ userReviews: null });
  },

  // Clear current review
  clearCurrentReview: () => {
    set({ currentReview: null });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));

// Helper function to calculate new average rating when adding a new review
const calculateNewAverage = (currentAverage, currentCount, newRating) => {
  if (!currentAverage || currentCount === 0) return newRating;
  const totalSum = currentAverage * currentCount;
  return (totalSum + newRating) / (currentCount + 1);
};

export default useReviewStore;
