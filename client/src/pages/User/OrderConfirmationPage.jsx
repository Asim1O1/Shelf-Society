// src/pages/OrderConfirmationPage.jsx
import React, { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AnnouncementBanner from "../../components/common/AnnouncementBanner";
import Navbar from "../../components/common/NavBar";
import useAuthStore from "../../stores/useAuthStore";
import useOrderStore from "../../stores/useOrderStore";

const OrderConfirmationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { getOrderById, currentOrder, isLoading, error } = useOrderStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/order-confirmation/${id}` } });
      return;
    }

    getOrderById(id);
  }, [id, isAuthenticated, getOrderById, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AnnouncementBanner />
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentOrder) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AnnouncementBanner />
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error || "Order not found"}
          </div>
          <div className="mt-4">
            <Link
              to="/my-orders"
              className="text-red-500 hover:text-red-700 font-medium"
            >
              View Your Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AnnouncementBanner />
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <div className="bg-green-100 rounded-full p-3">
                    <svg
                      className="h-12 w-12 text-green-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Order Confirmed!
                </h1>
                <p className="text-gray-600">
                  Thank you for your order. We've sent a confirmation to your
                  email.
                </p>
              </div>

              <div className="border rounded-lg p-4 bg-blue-50 border-blue-200 mb-6">
                <div className="flex flex-col items-center">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    Your Claim Code
                  </h2>
                  <div className="bg-white px-6 py-3 rounded-lg border border-blue-300 mb-2">
                    <span className="text-2xl font-mono font-bold tracking-wider text-blue-800">
                      {currentOrder.claimCode}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    Present this code at our store to pick up your order
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Order Details
                </h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Order Number</p>
                    <p className="font-medium">{currentOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium">
                      {new Date(currentOrder.orderDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-medium">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {currentOrder.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="font-medium">
                      ${currentOrder.finalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Order Items
                </h2>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Item
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Qty
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Price
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentOrder.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <img
                                  className="h-10 w-10 rounded object-cover"
                                  src={
                                    item.imageUrl ||
                                    "https://via.placeholder.com/40x40?text=Book"
                                  }
                                  alt={item.title}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {item.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {item.author}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {item.quantity}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            ${item.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            ${item.subtotal.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div>
                    {currentOrder.status === "Pending" && (
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to cancel this order?"
                            )
                          ) {
                            // Handle cancel order
                          }
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Link
                      to="/books"
                      className="px-4 py-2 border border-gray-300 rounded-md text-center text-gray-700 hover:bg-gray-100"
                    >
                      Continue Shopping
                    </Link>
                    <Link
                      to="/my-orders"
                      className="px-4 py-2 bg-red-500 text-white rounded-md text-center hover:bg-red-600"
                    >
                      View Your Orders
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
