// src/hooks/useWhitelist.js
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import useAuthStore from "../stores/useAuthStore";
import axiosInstance from "../utils/axiosInstance";

const useWhitelist = () => {
  const [whitelist, setWhitelist] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 12,
    totalCount: 0,
  });
  const { isAuthenticated } = useAuthStore();

  const fetchWhitelist = useCallback(
    async (page = 1) => {
      if (!isAuthenticated) return;

      setIsLoading(true);
      try {
        const response = await axiosInstance.get(
          `/whitelist?pageNumber=${page}&pageSize=${pagination.pageSize}`
        );

        if (response.data.success) {
          setWhitelist(response.data.data.items);
          setPagination({
            ...pagination,
            pageNumber: page,
            totalCount: response.data.data.totalCount,
          });
        }
      } catch (err) {
        console.error("Error fetching whitelist:", err);
        setError("Failed to load your whitelist. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, pagination.pageSize]
  );

  const checkBookInWhitelist = useCallback(
    async (bookId) => {
      if (!isAuthenticated) return false;

      try {
        const response = await axiosInstance.get(`/whitelist/check/${bookId}`);
        return response.data.success && response.data.data;
      } catch (err) {
        console.error("Error checking whitelist status:", err);
        return false;
      }
    },
    [isAuthenticated]
  );

  const addToWhitelist = useCallback(
    async (bookId) => {
      if (!isAuthenticated) return false;

      try {
        const response = await axiosInstance.post("/whitelist", { bookId });

        if (response.data.success) {
          toast.success("Book added to whitelist");
          return true;
        }
        return false;
      } catch (err) {
        console.error("Error adding to whitelist:", err);
        if (err.response?.status === 400) {
          // Book is already in whitelist
          toast.info("Book is already in your whitelist");
        } else {
          toast.error("Failed to add book to whitelist");
        }
        return false;
      }
    },
    [isAuthenticated]
  );

  const removeFromWhitelist = useCallback(
    async (id) => {
      if (!isAuthenticated) return false;

      try {
        const response = await axiosInstance.delete(`/whitelist/${id}`);

        if (response.data.success) {
          toast.success("Book removed from whitelist");
          // Update local state
          setWhitelist((prev) => prev.filter((item) => item.id !== id));
          setPagination((prev) => ({
            ...prev,
            totalCount: prev.totalCount - 1,
          }));
          return true;
        }
        return false;
      } catch (err) {
        console.error("Error removing from whitelist:", err);
        toast.error("Failed to remove book from whitelist");
        return false;
      }
    },
    [isAuthenticated]
  );

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchWhitelist(pagination.pageNumber);
    }
  }, [fetchWhitelist, isAuthenticated, pagination.pageNumber]);

  return {
    whitelist,
    isLoading,
    error,
    pagination,
    fetchWhitelist,
    checkBookInWhitelist,
    addToWhitelist,
    removeFromWhitelist,
    setPagination,
  };
};

export default useWhitelist;
