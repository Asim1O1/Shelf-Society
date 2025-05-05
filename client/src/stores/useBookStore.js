import { create } from "zustand";
import axiosInstance from "../utils/axiosInstance";

const toPascalCase = (str) => {
  const acronyms = ["ISBN", "URL", "ID"];
  const upper = str.toUpperCase();
  if (acronyms.includes(upper)) return upper;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

function convertKeysToPascalCase(obj) {
  if (Array.isArray(obj)) {
    return obj.map(convertKeysToPascalCase);
  } else if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => {
        const pascalKey = toPascalCase(key);

        return [pascalKey, convertKeysToPascalCase(value)];
      })
    );
  }
  return obj;
}

const useBookStore = create((set, get) => ({
  books: [],
  currentBook: null,
  pagination: {
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
  },
  filters: {
    search: "",
    sortBy: "",
    genre: "",
    author: "",
    language: "",
    minPrice: "",
    maxPrice: "",
  },
  isLoading: false,
  error: null,

  // Set filters
  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  // Reset filters
  resetFilters: () => {
    set({
      filters: {
        search: "",
        sortBy: "",
        genre: "",
        author: "",
        language: "",
        minPrice: "",
        maxPrice: "",
      },
    });
  },

  // Set pagination
  setPagination: (pagination) => {
    set({ pagination: { ...get().pagination, ...pagination } });
  },

  // Get books with filters + pagination
  getBooks: async () => {
    const { pagination, filters } = get();
    set({ isLoading: true, error: null });

    try {
      const params = new URLSearchParams();

      params.append("pageNumber", pagination.pageNumber);
      params.append("pageSize", pagination.pageSize);

      // Optional filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await axiosInstance.get(`/books?${params.toString()}`);

      if (response.data.success) {
        const { items, pageNumber, pageSize, totalCount } = response.data.data;
        set({
          books: items,
          pagination: { pageNumber, pageSize, totalCount },
          isLoading: false,
        });
        return { success: true };
      } else {
        set({ error: response.data.message, isLoading: false });
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch books";
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  // Get book by ID
  getBookById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(`/books/${id}`);
      if (response.data.success) {
        set({ currentBook: response.data.data, isLoading: false });
        return { success: true, data: response.data.data };
      } else {
        set({ error: response.data.message, isLoading: false });
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch book";
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  // Create book
  createBook: async (bookData) => {
    set({ isLoading: true, error: null });

    const formatEnumMap = {
      Hardcover: 1,
      Paperback: 2,
      Ebook: 3,
    };
    bookData.format = formatEnumMap[bookData.format];

    const pascalCaseData = convertKeysToPascalCase(bookData);
    console.log("PascalCase Data:", pascalCaseData);

    try {
      const response = await axiosInstance.post("/books", pascalCaseData);

      if (response.data.success) {
        set({ isLoading: false });
        return { success: true, data: response.data.data };
      } else {
        set({ error: response.data.message, isLoading: false });
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error("Error creating book:", error);
      const message = error.response?.data?.message || "Failed to create book";
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  // Update book
  updateBook: async (id, bookData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.put(`/books/${id}`, bookData);
      if (response.data.success) {
        if (get().currentBook?._id === id) {
          set({ currentBook: response.data.data });
        }
        set({ isLoading: false });
        return { success: true, data: response.data.data };
      } else {
        set({ error: response.data.message, isLoading: false });
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update book";
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  // Delete book
  deleteBook: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.delete(`/books/${id}`);
      if (response.data.success) {
        set({
          books: get().books.filter((book) => book._id !== id),
          currentBook: get().currentBook?._id === id ? null : get().currentBook,
          isLoading: false,
        });
        return { success: true };
      } else {
        set({ error: response.data.message, isLoading: false });
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete book";
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  clearCurrentBook: () => set({ currentBook: null }),
  clearError: () => set({ error: null }),
}));

export default useBookStore;
