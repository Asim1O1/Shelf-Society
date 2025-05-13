// src/pages/admin/EditDiscount.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import AdminSidebar from "../../components/admin/AdminSidebar";
import axiosInstance from "../../utils/axiosInstance";

const EditDiscount = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    discountPercentage: 10,
    onSale: false,
    startDate: "",
    endDate: "",
  });
  const [bookTitle, setBookTitle] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchDiscount = async () => {
      try {
        const response = await axiosInstance.get(`/discounts/${id}`);
        if (response.data.success) {
          const { discountPercentage, onSale, startDate, endDate, bookTitle } =
            response.data.data;

          // Format dates for input fields
          const formattedStartDate = new Date(startDate)
            .toISOString()
            .split("T")[0];
          const formattedEndDate = new Date(endDate)
            .toISOString()
            .split("T")[0];

          setFormData({
            discountPercentage,
            onSale,
            startDate: formattedStartDate,
            endDate: formattedEndDate,
          });

          setBookTitle(bookTitle);
        }
      } catch (error) {
        console.error("Error fetching discount:", error);
        toast.error("Failed to fetch discount details");
        navigate("/admin/discounts");
      } finally {
        setIsFetching(false);
      }
    };

    fetchDiscount();
  }, [id, navigate]);

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
      const response = await axiosInstance.put(`/discounts/${id}`, {
        discountPercentage: parseFloat(formData.discountPercentage),
        onSale: formData.onSale,
        startDate: formData.startDate,
        endDate: formData.endDate,
      });

      if (response.data.success) {
        toast.success("Discount updated successfully");
        navigate("/admin/discounts");
      }
    } catch (error) {
      console.error("Error updating discount:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to update discount");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminSidebar />

      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Edit Discount</h1>
            <p className="text-gray-600">Update discount for "{bookTitle}"</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6">
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
                      className={`w-full p-2 border rounded transition-colors ${
                        errors.discountPercentage
                          ? "border-red-500 bg-red-50"
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
                    className="h-5 w-5 text-gray-600"
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
                      className={`w-full p-2 border rounded transition-colors ${
                        errors.startDate
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.startDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.startDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 mb-2"
                      htmlFor="endDate"
                    >
                      End Date
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded transition-colors ${
                        errors.endDate
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
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

              <div className="mt-6 flex justify-end pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate("/admin/discounts")}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded mr-3 hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      Updating...
                    </span>
                  ) : (
                    "Update Discount"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditDiscount;
