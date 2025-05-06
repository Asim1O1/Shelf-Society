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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Add New Discount</h1>
        <p className="text-gray-600">Create a discount for a book</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {isLoadingBooks ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="bookId">
                  Book
                </label>
                <select
                  id="bookId"
                  name="bookId"
                  value={formData.bookId}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded ${
                    errors.bookId ? "border-red-500" : "border-gray-300"
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
                  <p className="text-red-500 text-sm mt-1">{errors.bookId}</p>
                )}
              </div>

              <div>
                <label
                  className="block text-gray-700 mb-2"
                  htmlFor="discountPercentage"
                >
                  Discount Percentage
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    id="discountPercentage"
                    name="discountPercentage"
                    value={formData.discountPercentage}
                    onChange={handleChange}
                    min="1"
                    max="100"
                    step="0.01"
                    className={`w-full p-2 border rounded ${
                      errors.discountPercentage
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <span className="ml-2">%</span>
                </div>
                {errors.discountPercentage && (
                  <p className="text-red-500 text-sm mt-1">
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
                  className="h-5 w-5 text-blue-600"
                />
                <label className="ml-2 text-gray-700" htmlFor="onSale">
                  Mark as "On Sale" (displays a sale badge)
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-gray-700 mb-2"
                    htmlFor="startDate"
                  >
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded ${
                      errors.startDate ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.startDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="endDate">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded ${
                      errors.endDate ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.endDate}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/admin/discounts")}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded mr-2 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Creating..." : "Create Discount"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateDiscount;
