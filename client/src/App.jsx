import React, { useEffect } from "react";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useNavigate,
} from "react-router-dom";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import HomePage from "./pages/public/HomePage";

import BookForm from "./components/admin/BookForm";
import ToastNotification from "./components/common/ToastNotification";

import CreateAnnouncement from "./components/admin/CreateAnnouncement";
import CreateDiscount from "./components/admin/CreateDiscount";
import CreateStaff from "./components/admin/CreateStaff";
import EditAnnouncement from "./components/admin/EditAnnouncementPage";
import EditDiscount from "./components/admin/EditDiscount";
import CartPage from "./components/cart/CartPage";
import AdminBookManagePage from "./pages/admin/AdminBookManagePage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AnnouncementManagement from "./pages/admin/AnnounceManagement";
import DiscountManagement from "./pages/admin/DiscountManagement";
import StaffManagement from "./pages/admin/StaffManagement";
import BooksPage from "./pages/public/BooksPage";
import BookDetailPage from "./pages/User/BookDetail";
import CheckoutPage from "./pages/User/CheckOutPage";
import OrderConfirmationPage from "./pages/User/OrderConfirmationPage";
import WhitelistPage from "./pages/User/Whitelists";
import useAuthStore from "./stores/useAuthStore";
import ProtectedRoute, { AdminRoute } from "./utils/ProtectRoute";

// Role-based redirect component
const RoleRedirect = () => {
  const { isAuthenticated, user } = useAuthStore();
  console.log("The is authenticated is", isAuthenticated, user);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("RoleRedirect useEffect triggered");
    if (isAuthenticated) {
      // If user is admin, redirect to admin dashboard
      if (user?.role === "Admin") {
        navigate("/admin", { replace: true });
      } else {
        // If user is a regular member, redirect to homepage
        navigate("/", { replace: true });
      }
    } else {
      // If not authenticated, redirect to login
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Return loading indicator while redirecting
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
};

function App() {
  const { isAuthenticated, user, init } = useAuthStore();

  // Initialize auth store when app loads
  useEffect(() => {
    init();
  }, [init]);

  return (
    <Router>
      <div className="min-h-screen">
        <ToastNotification />
        <Routes>
          {/* Auth Routes */}
          <Route
            path="/login"
            element={isAuthenticated ? <RoleRedirect /> : <Login />}
          />
          <Route
            path="/register"
            element={isAuthenticated ? <RoleRedirect /> : <Register />}
          />

          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />

          {/* Member Routes (Protected) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/whitelist" element={<WhitelistPage />} />
            <Route path="/profile" element={<div>Member Profile Page</div>} />
            <Route path="/my-orders" element={<div>My Orders Page</div>} />
            <Route path="/whitelist" element={<div>Whitelist Page</div>} />
            <Route path="/cart" element={<CartPage />} /> {/* Add this line */}
            <Route path="/checkout" element={<CheckoutPage />} />{" "}
            <Route
              path="/order-confirmation/:id"
              element={<OrderConfirmationPage />}
            />{" "}
            {/* Add this line */}
            <Route
              path="/order-confirmation/:id"
              element={<div>Order Confirmation Page</div>}
            />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route index element={<AdminDashboard />} />
            <Route path="books" element={<AdminBookManagePage />} />
            <Route path="books/create" element={<BookForm />} />
            <Route path="books/edit/:id" element={<BookForm />} />

            {/* Staff Management Routes */}
            <Route path="staff" element={<StaffManagement />} />
            <Route path="staff/create" element={<CreateStaff />} />
            {/* <Route path="staff/edit/:id" element={<EditStaff />} /> */}

            {/* Discount Management Routes */}
            <Route path="discounts" element={<DiscountManagement />} />
            <Route path="discounts/create" element={<CreateDiscount />} />
            <Route path="discounts/edit/:id" element={<EditDiscount />} />

            {/* Announcement Management Routes */}
            <Route path="announcements" element={<AnnouncementManagement />} />
            <Route
              path="announcements/create"
              element={<CreateAnnouncement />}
            />
            <Route
              path="announcements/edit/:id"
              element={<EditAnnouncement />}
            />

            {/* Order Management Routes */}
            {/* <Route path="orders" element={<OrderManagement />} />
            <Route path="orders/:id" element={<OrderDetail />} /> */}
          </Route>

          {/* Role-Based Redirection Route */}
          <Route path="/redirect" element={<RoleRedirect />} />

          {/* Fallback route */}
          <Route path="*" element={<div>Not Found</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
