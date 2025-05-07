import React, { useEffect } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  useNavigate,
} from "react-router-dom";
import BookForm from "./components/admin/BookForm";
import CreateAnnouncement from "./components/admin/CreateAnnouncement";
import CreateDiscount from "./components/admin/CreateDiscount";
import CreateStaff from "./components/admin/CreateStaff";
import EditAnnouncement from "./components/admin/EditAnnouncementPage";
import EditDiscount from "./components/admin/EditDiscount";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import CartPage from "./components/cart/CartPage";
import ToastNotification from "./components/common/ToastNotification";
import AdminBookManagePage from "./pages/admin/AdminBookManagePage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AnnouncementManagement from "./pages/admin/AnnounceManagement";
import DiscountManagement from "./pages/admin/DiscountManagement";
import StaffManagement from "./pages/admin/StaffManagement";
import BooksPage from "./pages/public/BooksPage";
import HomePage from "./pages/public/HomePage";
import BookDetailPage from "./pages/User/BookDetail";
import CheckoutPage from "./pages/User/CheckOutPage";
import OrderConfirmationPage from "./pages/User/OrderConfirmationPage";
import WhitelistPage from "./pages/User/Whitelists";
import useAuthStore from "./stores/useAuthStore";
import ProtectedRoute, { AdminRoute } from "./utils/ProtectRoute";

// Component to redirect admin/staff away from public/user pages
const AdminStaffPublicRoute = ({ children }) => {
  const { user } = useAuthStore();

  if (user && (user.role === "Admin" || user.role === "Staff")) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

// Role-based redirect component
const RoleRedirect = () => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === "Admin" || user?.role === "Staff") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } else {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

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

          {/* Public Routes - Restricted for Admin/Staff */}
          <Route
            path="/"
            element={
              <AdminStaffPublicRoute>
                <HomePage />
              </AdminStaffPublicRoute>
            }
          />
          <Route
            path="/books"
            element={
              <AdminStaffPublicRoute>
                <BooksPage />
              </AdminStaffPublicRoute>
            }
          />
          <Route
            path="/books/:id"
            element={
              <AdminStaffPublicRoute>
                <BookDetailPage />
              </AdminStaffPublicRoute>
            }
          />

          {/* Member Routes (Protected) - Restricted for Admin/Staff */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/whitelist"
              element={
                <AdminStaffPublicRoute>
                  <WhitelistPage />
                </AdminStaffPublicRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <AdminStaffPublicRoute>
                  <div>Member Profile Page</div>
                </AdminStaffPublicRoute>
              }
            />
            <Route
              path="/my-orders"
              element={
                <AdminStaffPublicRoute>
                  <div>My Orders Page</div>
                </AdminStaffPublicRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <AdminStaffPublicRoute>
                  <CartPage />
                </AdminStaffPublicRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <AdminStaffPublicRoute>
                  <CheckoutPage />
                </AdminStaffPublicRoute>
              }
            />
            <Route
              path="/order-confirmation/:id"
              element={
                <AdminStaffPublicRoute>
                  <OrderConfirmationPage />
                </AdminStaffPublicRoute>
              }
            />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route index element={<AdminDashboard />} />
            <Route path="books" element={<AdminBookManagePage />} />
            <Route path="books/create" element={<BookForm />} />
            <Route path="books/edit/:id" element={<BookForm />} />
            <Route path="staff" element={<StaffManagement />} />
            <Route path="staff/create" element={<CreateStaff />} />
            <Route path="discounts" element={<DiscountManagement />} />
            <Route path="discounts/create" element={<CreateDiscount />} />
            <Route path="discounts/edit/:id" element={<EditDiscount />} />
            <Route path="announcements" element={<AnnouncementManagement />} />
            <Route
              path="announcements/create"
              element={<CreateAnnouncement />}
            />
            <Route
              path="announcements/edit/:id"
              element={<EditAnnouncement />}
            />
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
