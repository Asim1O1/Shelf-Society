// src/pages/CartPage.jsx
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";
import useCartStore from "../../stores/useCartStore";
import AnnouncementBanner from "../common/AnnouncementBanner";
import Navbar from "../common/NavBar";

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AnnouncementBanner />
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
          <div className="mt-4">
            <button
              onClick={getCart}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AnnouncementBanner />
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-4">
              Explore our catalog and add books to your cart.
            </p>
            <Link
              to="/books"
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Browse Books
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
        <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-xl font-semibold">
                    Items ({cart.totalItems})
                  </h2>
                  <button
                    onClick={handleClearCart}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Clear Cart
                  </button>
                </div>

                <div className="divide-y">
                  {cart.items.map((item) => (
                    <div
                      key={item.id}
                      className="py-4 flex flex-col sm:flex-row items-start sm:items-center"
                    >
                      <div className="flex-shrink-0 mb-3 sm:mb-0 sm:mr-4 w-full sm:w-20">
                        <Link to={`/books/${item.bookId}`}>
                          <img
                            src={
                              item.imageUrl ||
                              "https://via.placeholder.com/80x120?text=No+Image"
                            }
                            alt={item.title}
                            className="w-full sm:w-20 h-auto object-cover rounded"
                          />
                        </Link>
                      </div>

                      <div className="flex-grow">
                        <Link to={`/books/${item.bookId}`}>
                          <h3 className="text-lg font-medium text-gray-900 hover:text-red-600">
                            {item.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-600">{item.author}</p>

                        <div className="mt-2 flex flex-wrap items-center">
                          <div className="flex items-center mr-6 mb-2 sm:mb-0">
                            <span className="text-gray-700 mr-2">Qty:</span>
                            <div className="flex items-center border rounded-md">
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item.id,
                                    item.quantity - 1
                                  )
                                }
                                className="px-2 py-1 text-gray-700 hover:bg-gray-100"
                              >
                                −
                              </button>
                              <span className="px-2 py-1 min-w-[30px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item.id,
                                    item.quantity + 1
                                  )
                                }
                                className="px-2 py-1 text-gray-700 hover:bg-gray-100"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="text-red-600 font-medium mr-4">
                            ${item.subtotal.toFixed(2)}
                          </div>

                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-gray-500 hover:text-red-600"
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
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">
                      ${cart.totalPrice.toFixed(2)}
                    </span>
                  </div>

                  {cart.discountPercentage > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({cart.discountPercentage}%)</span>
                      <span>-${cart.discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-semibold text-lg border-t pt-3">
                    <span>Total</span>
                    <span>${cart.finalPrice.toFixed(2)}</span>
                  </div>

                  {cart.discountPercentage > 0 && (
                    <div className="text-sm text-green-600">
                      You saved ${cart.discountAmount.toFixed(2)}!
                    </div>
                  )}
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-red-500 text-white py-3 rounded-md hover:bg-red-600 transition duration-300"
                >
                  Proceed to Checkout
                </button>

                <div className="mt-4">
                  <Link
                    to="/books"
                    className="block text-center text-red-600 hover:text-red-800"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
