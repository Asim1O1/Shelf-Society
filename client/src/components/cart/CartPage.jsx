// src/pages/CartPage.jsx
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";
import useCartStore from "../../stores/useCartStore";
import AnnouncementBanner from "../common/AnnouncementBanner";
import Navbar from "../common/NavBar";
import Footer from "../common/Footer";

const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const {
    cart,
    isLoading,
    error,
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart,
  } = useCartStore();

  useEffect(() => {
    if (isAuthenticated) {
      getCart();
    } else {
      navigate("/login", { state: { from: "/cart" } });
    }
  }, [isAuthenticated, getCart, navigate]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      // If quantity is less than 1, remove the item
      await removeFromCart(itemId);
    } else {
      await updateCartItem(itemId, newQuantity);
    }
  };

  const handleRemoveItem = async (itemId) => {
    await removeFromCart(itemId);
  };

  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      await clearCart();
    }
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <AnnouncementBanner />
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-t-4 border-b-4 border-red-300 opacity-20"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <AnnouncementBanner />
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto">
            <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-2">
                <svg
                  className="w-6 h-6 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-semibold">Error</span>
              </div>
              <p>{error}</p>
            </div>
            <div className="mt-6 text-center">
              <button
                onClick={getCart}
                className="px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <AnnouncementBanner />
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8 text-gray-800 text-center animate-fade-in">
            Your Shopping Cart
          </h1>
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center transform transition-all duration-300 hover:shadow-2xl">
              <div className="mb-6">
                <svg
                  className="w-24 h-24 mx-auto text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-gray-800">
                Your cart is empty
              </h3>
              <p className="text-gray-600 mb-6">
                Discover amazing books and add them to your cart to get started.
              </p>
              <Link
                to="/books"
                className="inline-block px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full hover:from-red-600 hover:to-red-700 transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-200"
              >
                Browse Books
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <AnnouncementBanner />
        <Navbar />

        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8 text-gray-800 text-center lg:text-left animate-fade-in">
            Your Shopping Cart
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
                <div className="p-6 lg:p-8">
                  <div className="mb-6 flex justify-between items-center border-b pb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">
                      Items ({cart.totalItems})
                    </h2>
                    <button
                      onClick={handleClearCart}
                      className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors duration-200 hover:underline"
                    >
                      Clear Cart
                    </button>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {cart.items.map((item) => (
                      <div
                        key={item.id}
                        className="py-6 flex flex-col sm:flex-row items-start gap-4 transition-all duration-200 hover:bg-gray-50 rounded-lg p-4"
                      >
                        <div className="flex-shrink-0 w-full sm:w-24">
                          <Link
                            to={`/books/${item.bookId}`}
                            className="block overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                          >
                            <img
                              src={
                                item.imageUrl ||
                                "https://via.placeholder.com/96x144?text=No+Image"
                              }
                              alt={item.title}
                              className="w-full h-36 sm:h-36 object-cover transform transition-transform duration-200 hover:scale-105"
                            />
                          </Link>
                        </div>

                        <div className="flex-grow">
                          <Link to={`/books/${item.bookId}`}>
                            <h3 className="text-lg font-medium text-gray-900 hover:text-red-600 transition-colors duration-200">
                              {item.title}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-600 mt-1">
                            {item.author}
                          </p>

                          <div className="mt-4 flex flex-wrap items-center gap-4">
                            <div className="flex items-center">
                              <span className="text-gray-700 mr-3">Qty:</span>
                              <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                                <button
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.id,
                                      item.quantity - 1
                                    )
                                  }
                                  className="px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-red-600 transition-all duration-200"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M20 12H4"
                                    />
                                  </svg>
                                </button>
                                <span className="px-4 py-2 min-w-[50px] text-center font-medium bg-gray-50">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.id,
                                      item.quantity + 1
                                    )
                                  }
                                  className="px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-red-600 transition-all duration-200"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            <div className="text-xl font-bold text-red-600">
                              ${item.subtotal.toFixed(2)}
                            </div>

                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="ml-auto text-gray-400 hover:text-red-600 transition-all duration-200 p-2 rounded-full hover:bg-red-50"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                ></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden sticky top-4 transform transition-all duration-300 hover:shadow-2xl">
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
                  <h2 className="text-2xl font-semibold">Order Summary</h2>
                </div>

                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal</span>
                      <span className="font-medium">
                        ${cart.totalPrice.toFixed(2)}
                      </span>
                    </div>

                    {cart.discountPercentage > 0 && (
                      <div className="flex justify-between text-green-600 bg-green-50 p-3 rounded-lg">
                        <span className="font-medium">
                          Discount ({cart.discountPercentage}%)
                        </span>
                        <span className="font-bold">
                          -${cart.discountAmount.toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between font-bold text-xl border-t-2 pt-4">
                      <span>Total</span>
                      <span className="text-red-600">
                        ${cart.finalPrice.toFixed(2)}
                      </span>
                    </div>

                    {cart.discountPercentage > 0 && (
                      <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg text-center">
                        <svg
                          className="w-5 h-5 inline mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        You saved ${cart.discountAmount.toFixed(2)}!
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-full hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 font-semibold text-lg shadow-lg"
                  >
                    Proceed to Checkout
                  </button>

                  <div className="mt-6">
                    <Link
                      to="/books"
                      className="block text-center text-red-600 hover:text-red-800 font-medium transition-colors duration-200"
                    >
                      <svg
                        className="w-5 h-5 inline mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 16l-4-4m0 0l4-4m-4 4h18"
                        />
                      </svg>
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CartPage;
