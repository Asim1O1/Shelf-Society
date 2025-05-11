// src/pages/staff/StaffDashboard.jsx
import { useEffect, useState } from "react";
import {
  FaBan,
  FaCheckCircle,
  FaClipboardList,
  FaRegClock,
  FaSearch,
} from "react-icons/fa";
import { MdNotifications, MdPendingActions } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useAuthStore from "../../stores/useAuthStore";
import useStaffStore from "../../stores/useStaffStore";
import { isConnected, startSignalRService } from "../../utils/signalRService";

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const {
    dashboardStats,
    recentCompletions,
    getDashboardStats,

    processClaimCode,
  } = useStaffStore();

  const [claimCode, setClaimCode] = useState("");
  const [signalRStatus, setSignalRStatus] = useState("disconnected");

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

  // Load data & initialize SignalR
  useEffect(() => {
    if (isAuthenticated && (user?.role === "Staff" || user?.role === "Admin")) {
      // Initialize SignalR
      const initializeRealtime = async () => {
        const success = await startSignalRService();
        setSignalRStatus(success ? "connected" : "disconnected");
      };

      initializeRealtime();

      // Load dashboard data
      getDashboardStats();

      // Set up polling for statistics (every 30 seconds)
      const statsInterval = setInterval(() => {
        getDashboardStats();

        // Also check SignalR connection status
        setSignalRStatus(isConnected() ? "connected" : "disconnected");
      }, 30000);

      return () => {
        clearInterval(statsInterval);
      };
    }
  }, [isAuthenticated, user, getDashboardStats]);

  // Handle claim code search
  const handleClaimCodeSearch = async (e) => {
    e.preventDefault();
    if (!claimCode.trim()) {
      toast.warn("Please enter a claim code");
      return;
    }

    const result = await processClaimCode(claimCode.trim());
    if (result.success) {
      navigate(`/staff/orders/${result.data.id}`);
    }

    // Clear input regardless of result
    setClaimCode("");
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
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Staff Dashboard</h1>
        <div className="flex items-center text-sm">
          <span
            className={`inline-block w-3 h-3 rounded-full mr-2 ${
              signalRStatus === "connected" ? "bg-green-500" : "bg-red-500"
            }`}
          ></span>
          {signalRStatus === "connected"
            ? "Real-time connected"
            : "Real-time disconnected"}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 flex items-center">
          <div className="rounded-full bg-blue-100 p-3 mr-4">
            <MdPendingActions className="text-blue-500 text-xl" />
          </div>
          <div>
            <p className="text-gray-500">Pending Orders</p>
            <p className="text-2xl font-bold">{dashboardStats.pendingOrders}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 flex items-center">
          <div className="rounded-full bg-yellow-100 p-3 mr-4">
            <FaRegClock className="text-yellow-500 text-xl" />
          </div>
          <div>
            <p className="text-gray-500">Ready for Pickup</p>
            <p className="text-2xl font-bold">{dashboardStats.readyOrders}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 flex items-center">
          <div className="rounded-full bg-green-100 p-3 mr-4">
            <FaCheckCircle className="text-green-500 text-xl" />
          </div>
          <div>
            <p className="text-gray-500">Completed Today</p>
            <p className="text-2xl font-bold">{dashboardStats.todayOrders}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 flex items-center">
          <div className="rounded-full bg-purple-100 p-3 mr-4">
            <FaClipboardList className="text-purple-500 text-xl" />
          </div>
          <div>
            <p className="text-gray-500">Today's Revenue</p>
            <p className="text-2xl font-bold">
              {formatCurrency(dashboardStats.todayRevenue)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Claim Code Search */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold mb-4">Process Order</h2>
          <form onSubmit={handleClaimCodeSearch} className="mb-4">
            <div className="flex">
              <input
                type="text"
                placeholder="Enter claim code"
                className="flex-grow px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={claimCode}
                onChange={(e) => setClaimCode(e.target.value)}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <FaSearch />
              </button>
            </div>
          </form>
          <p className="text-sm text-gray-500">
            Enter a customer's claim code to find and process their order.
          </p>
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Order Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3">
              <div className="text-3xl font-bold text-yellow-500 mb-1">
                {dashboardStats.pendingOrders}
              </div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
            <div className="text-center p-3">
              <div className="text-3xl font-bold text-blue-500 mb-1">
                {dashboardStats.confirmedOrders}
              </div>
              <div className="text-sm text-gray-500">Confirmed</div>
            </div>
            <div className="text-center p-3">
              <div className="text-3xl font-bold text-orange-500 mb-1">
                {dashboardStats.readyOrders}
              </div>
              <div className="text-sm text-gray-500">Ready</div>
            </div>
            <div className="text-center p-3">
              <div className="text-3xl font-bold text-green-500 mb-1">
                {dashboardStats.completedOrders}
              </div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
            <div className="text-center p-3">
              <div className="text-3xl font-bold text-red-500 mb-1">
                {dashboardStats.cancelledOrders}
              </div>
              <div className="text-sm text-gray-500">Cancelled</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Total orders in system:{" "}
              <span className="font-semibold">
                {dashboardStats.totalOrders}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Recent Completions Section */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <MdNotifications className="text-green-500 text-xl mr-2" />
          <h2 className="text-lg font-semibold">Recently Completed Orders</h2>
        </div>

        {recentCompletions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentCompletions.map((order) => (
                  <tr key={`${order.id}-${order.completedAt}`}>
                    <td className="px-6 py-4 whitespace-nowrap">{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(order.completedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.totalItems}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatCurrency(order.finalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/staff/orders/${order.id}`)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <FaBan className="mx-auto text-gray-300 text-3xl mb-2" />
            <p>No recent completions to display</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;
