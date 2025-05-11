// src/pages/admin/EditStaffForm.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import useStaffManagementStore from "../../stores/useStaffManagementStore";

const EditStaffForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    getStaffMemberById,
    updateStaffMember,
    currentStaffMember,
    isLoading,
    error,
    clearError,
    clearCurrentStaffMember,
  } = useStaffManagementStore();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [formErrors, setFormErrors] = useState({});

  // Fetch staff member data when component mounts
  useEffect(() => {
    getStaffMemberById(id);

    // Clean up when component unmounts
    return () => {
      clearCurrentStaffMember();
      clearError();
    };
  }, [id]);

  // Update form when staff member data is loaded
  useEffect(() => {
    if (currentStaffMember) {
      setFormData({
        firstName: currentStaffMember.firstName,
        lastName: currentStaffMember.lastName,
        email: currentStaffMember.email,
        password: "",
        confirmPassword: "",
      });
    }
  }, [currentStaffMember]);

  // Show error messages from the store
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const validateForm = () => {
    const errors = {};

    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    // In edit mode, only validate password if it's provided
    if (formData.password || formData.confirmPassword) {
      if (formData.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
      }

      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Only include fields that have changed
    const updatedData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
    };

    // Only include password if provided
    if (formData.password) {
      updatedData.password = formData.password;
      updatedData.confirmPassword = formData.confirmPassword;
    }

    const result = await updateStaffMember(id, updatedData);
    if (result.success) {
      toast.success("Staff member updated successfully");
      navigate("/admin/staff");
    }
  };

  if (isLoading && !currentStaffMember) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Edit Staff Member</h1>
        <Link to="/admin/staff" className="text-blue-600 hover:text-blue-800">
          Back to Staff List
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {currentStaffMember ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    formErrors.firstName ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {formErrors.firstName && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    formErrors.lastName ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {formErrors.lastName && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  formErrors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  New Password{" "}
                  <span className="text-gray-500">
                    (Leave blank to keep current)
                  </span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    formErrors.password ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.password}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    formErrors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {formErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/admin/staff")}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              >
                {isLoading ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⟳</span>
                    Updating...
                  </>
                ) : (
                  "Update Staff Member"
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 text-center text-gray-500">
            Staff member not found or you don't have permission to edit.
          </div>
        )}
      </div>
    </div>
  );
};

export default EditStaffForm;
