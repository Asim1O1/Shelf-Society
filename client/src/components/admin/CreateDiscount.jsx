// src/pages/admin/CreateDiscount.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import axiosInstance from "../../utils/axiosInstance";

const CreateDiscount = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    bookId: "",
    discountPercentage: 10,
    onSale: false,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [books, setBooks] = useState([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axiosInstance.get("/books?pageSize=100");
        if (response.data.success) {
          setBooks(response.data.data.items);
        }
      } catch (error) {
        console.error("Error fetching books:", error);
        toast.error("Failed to fetch books");
      } finally {
        setIsLoadingBooks(false);
      }
    };

    fetchBooks();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.bookId) newErrors.bookId = "Book is required";

    if (!formData.discountPercentage)
      newErrors.discountPercentage = "Discount percentage is required";
    else if (
      formData.discountPercentage <= 0 ||
      formData.discountPercentage > 100
    )
      newErrors.discountPercentage = "Discount must be between 1% and 100%";

    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (start >= end) newErrors.endDate = "End date must be after start date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/discounts", {
        bookId: parseInt(formData.bookId),
        discountPercentage: parseFloat(formData.discountPercentage),
        onSale: formData.onSale,
        startDate: formData.startDate,
        endDate: formData.endDate,
      });

      if (response.data.success) {
        toast.success("Discount created successfully");
        navigate("/admin/discounts");
      }
    } catch (error) {
      console.error("Error creating discount:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to create discount");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Add New Discount
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Create a discount for a book
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {isLoadingBooks ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label
                htmlFor="bookId"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Book <span className="text-red-500">*</span>
              </label>
              <select
                id="bookId"
                name="bookId"
                value={formData.bookId}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent sm:text-sm transition-colors ${
                  errors.bookId
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <option value="">Select a book</option>
                {books.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title} by {book.author}
                  </option>
                ))}
              </select>
              {errors.bookId && (
                <p className="mt-2 text-sm text-red-500">{errors.bookId}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="discountPercentage"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Discount Percentage <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="discountPercentage"
                  name="discountPercentage"
                  value={formData.discountPercentage}
                  onChange={handleChange}
                  min="1"
                  max="100"
                  step="0.01"
                  className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent sm:text-sm transition-colors ${
                    errors.discountPercentage
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 bg-white"
                  }`}
                  placeholder="10"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">%</span>
                </div>
              </div>
              {errors.discountPercentage && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.discountPercentage}
                </p>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="onSale"
                name="onSale"
                checked={formData.onSale}
                onChange={handleChange}
                className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
              />
              <label htmlFor="onSale" className="ml-2 text-sm text-gray-700">
                Mark as "On Sale" (displays a sale badge)
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent sm:text-sm transition-colors ${
                    errors.startDate
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 bg-white"
                  }`}
                />
                {errors.startDate && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.startDate}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent sm:text-sm transition-colors ${
                    errors.endDate
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 bg-white"
                  }`}
                />
                {errors.endDate && (
                  <p className="mt-2 text-sm text-red-500">{errors.endDate}</p>
                )}
              </div>
            </div>

            <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/admin/discounts")}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`px-5 py-2.5 text-sm font-medium text-white bg-gray-900 border border-transparent rounded-lg shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-colors ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating...
                  </span>
                ) : (
                  "Create Discount"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateDiscount;
