// src/pages/staff/StaffOrderDetails.jsx
import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaBox,
  FaCheckCircle,
  FaEnvelope,
  FaRegClock,
  FaTimesCircle,
  FaTruck,
  FaUser,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import useAuthStore from "../../stores/useAuthStore";
import useStaffStore from "../../stores/useStaffStore";

const StaffOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { orderDetail, getOrderDetail, updateOrderStatus, isLoading } =
    useStaffStore();

  const [isUpdating, setIsUpdating] = useState(false);

  // Check authorization
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role !== "Staff" && user.role !== "Admin") {
        toast.error("Unauthorized access");
        navigate("/");
      }
    } else {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);

  // Load order data
  useEffect(() => {
    console.log("Loading order data...");
    if (id) {
      getOrderDetail(id);
    }
  }, [id, getOrderDetail]);

  // Handle status update
  const handleStatusUpdate = async (newStatus) => {
    setIsUpdating(true);

    try {
      const result = await updateOrderStatus(id, newStatus);

      if (result.success) {
        toast.success(`Order status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return (
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
            Pending
          </span>
        );
      case "Confirmed":
        return (
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
            Confirmed
          </span>
        );
      case "Ready":
        return (
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
            Ready
          </span>
        );
      case "Completed":
        return (
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
            Completed
          </span>
        );
      case "Cancelled":
        return (
          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">
            {status}
          </span>
        );
    }
  };

  // Get next status options based on current status
  const getNextStatusOptions = (currentStatus) => {
    switch (currentStatus) {
      case "Pending":
        return [
          {
            status: "Confirmed",
            label: "Confirm Order",
            icon: <FaCheckCircle className="mr-2" />,
            color: "bg-blue-600 hover:bg-blue-700",
          },
          {
            status: "Cancelled",
            label: "Cancel Order",
            icon: <FaTimesCircle className="mr-2" />,
            color: "bg-red-600 hover:bg-red-700",
          },
        ];
      case "Confirmed":
        return [
          {
            status: "Ready",
            label: "Mark as Ready",
            icon: <FaBox className="mr-2" />,
            color: "bg-green-600 hover:bg-green-700",
          },
          {
            status: "Cancelled",
            label: "Cancel Order",
            icon: <FaTimesCircle className="mr-2" />,
            color: "bg-red-600 hover:bg-red-700",
          },
        ];
      case "Ready":
        return [
          {
            status: "Completed",
            label: "Complete Order",
            icon: <FaTruck className="mr-2" />,
            color: "bg-purple-600 hover:bg-purple-700",
          },
        ];
      default:
        return [];
    }
  };

  if (isLoading || !orderDetail) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <button
          onClick={() => navigate("/staff")}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft className="mr-2" /> Back to Dashboard
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Order Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h1 className="text-2xl font-bold">Order #{orderDetail.id}</h1>
              <p className="text-sm text-gray-500">
                Claim Code:{" "}
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                  {orderDetail.claimCode}
                </span>
              </p>
              <p className="text-sm text-gray-500">
                Order Date: {formatDate(orderDetail.orderDate)}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              {getStatusBadge(orderDetail.status)}
            </div>
          </div>
        </div>

        {/* Customer Information - New Section */}
        {orderDetail.customerName && (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <FaUser className="text-gray-500 mr-2" />
                <div>
                  <div className="text-sm text-gray-500">Customer Name</div>
                  <div className="font-medium">{orderDetail.customerName}</div>
                </div>
              </div>
              <div className="flex items-center">
                <FaEnvelope className="text-gray-500 mr-2" />
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="font-medium">{orderDetail.customerEmail}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className="p-6">
          {/* Order Items */}
          <h2 className="text-lg font-semibold mb-4">Order Items</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Book
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orderDetail.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="h-12 w-9 object-cover mr-3"
                          />
                        )}
                        <div>
                          <div className="font-medium text-gray-900">
                            {item.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.author}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Order Summary */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="flex justify-between mb-2">
              <div>Subtotal:</div>
              <div>{formatCurrency(orderDetail.totalAmount)}</div>
            </div>
            {orderDetail.discountAmount > 0 && (
              <div className="flex justify-between mb-2 text-green-600">
                <div>Discount ({orderDetail.discountPercentage}%):</div>
                <div>-{formatCurrency(orderDetail.discountAmount)}</div>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg">
              <div>Total:</div>
              <div>{formatCurrency(orderDetail.finalAmount)}</div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold mb-4">Order Timeline</h2>
            <div className="grid grid-cols-5 gap-2">
              <div
                className={`text-center ${
                  orderDetail.status === "Pending" ||
                  orderDetail.status === "Confirmed" ||
                  orderDetail.status === "Ready" ||
                  orderDetail.status === "Completed"
                    ? "text-blue-600"
                    : "text-gray-400"
                }`}
              >
                <div className="mb-2 flex justify-center">
                  <FaRegClock className="text-xl" />
                </div>
                <div className="text-sm">Pending</div>
                <div className="text-xs">
                  {formatDate(orderDetail.orderDate)}
                </div>
              </div>
              <div
                className={`text-center ${
                  orderDetail.status === "Confirmed" ||
                  orderDetail.status === "Ready" ||
                  orderDetail.status === "Completed"
                    ? "text-blue-600"
                    : "text-gray-400"
                }`}
              >
                <div className="mb-2 flex justify-center">
                  <FaCheckCircle className="text-xl" />
                </div>
                <div className="text-sm">Confirmed</div>
              </div>
              <div
                className={`text-center ${
                  orderDetail.status === "Ready" ||
                  orderDetail.status === "Completed"
                    ? "text-blue-600"
                    : "text-gray-400"
                }`}
              >
                <div className="mb-2 flex justify-center">
                  <FaBox className="text-xl" />
                </div>
                <div className="text-sm">Ready</div>
              </div>
              <div
                className={`text-center ${
                  orderDetail.status === "Completed"
                    ? "text-blue-600"
                    : "text-gray-400"
                }`}
              >
                <div className="mb-2 flex justify-center">
                  <FaTruck className="text-xl" />
                </div>
                <div className="text-sm">Completed</div>
                <div className="text-xs">
                  {formatDate(orderDetail.completedDate)}
                </div>
              </div>
              <div
                className={`text-center ${
                  orderDetail.status === "Cancelled"
                    ? "text-red-600"
                    : "text-gray-400"
                }`}
              >
                <div className="mb-2 flex justify-center">
                  <FaTimesCircle className="text-xl" />
                </div>
                <div className="text-sm">Cancelled</div>
                <div className="text-xs">
                  {formatDate(orderDetail.cancelledDate)}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {getNextStatusOptions(orderDetail.status).length > 0 && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold mb-4">Actions</h2>
              <div className="flex flex-wrap gap-3">
                {getNextStatusOptions(orderDetail.status).map((option) => (
                  <button
                    key={option.status}
                    onClick={() => handleStatusUpdate(option.status)}
                    disabled={isUpdating}
                    className={`flex items-center ${option.color} text-white px-4 py-2 rounded-lg`}
                  >
                    {option.icon} {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffOrderDetails;
