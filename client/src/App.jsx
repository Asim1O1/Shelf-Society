import React, { useEffect } from "react";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useNavigate,
} from "react-router-dom";

// Auth Components
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

// Public Pages
import HomePage from "./pages/public/HomePage";
import BooksPage from "./pages/public/BooksPage";

// User Pages
import BookDetailPage from "./pages/User/BookDetail";
import CheckoutPage from "./pages/User/CheckOutPage";
import OrderConfirmationPage from "./pages/User/OrderConfirmationPage";
import WhitelistPage from "./pages/User/Whitelists";

// Admin Pages
import AdminBookManagePage from "./pages/admin/AdminBookManagePage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AnnouncementManagement from "./pages/admin/AnnounceManagement";
import DiscountManagement from "./pages/admin/DiscountManagement";
import StaffManagement from "./pages/admin/StaffManagement";

// Admin Components
import BookForm from "./components/admin/BookForm";
import CreateAnnouncement from "./components/admin/CreateAnnouncement";
import CreateDiscount from "./components/admin/CreateDiscount";
import CreateStaff from "./components/admin/CreateStaff";
import EditAnnouncement from "./components/admin/EditAnnouncementPage";
import EditDiscount from "./components/admin/EditDiscount";

// Common Components
import CartPage from "./components/cart/CartPage";
import ToastNotification from "./components/common/ToastNotification";

// Utils and Stores
import useAuthStore from "./stores/useAuthStore";
import ProtectedRoute, { AdminRoute } from "./utils/ProtectRoute";

// Route Constants
const ROUTES = {
  // Auth Routes
  LOGIN: "/login",
  REGISTER: "/register",

  // Public Routes
  HOME: "/",
  BOOKS: "/books",
  BOOK_DETAIL: "/books/:id",

  // User Routes
  WHITELIST: "/whitelist",
  PROFILE: "/profile",
  MY_ORDERS: "/my-orders",
  CART: "/cart",
  CHECKOUT: "/checkout",
  ORDER_CONFIRMATION: "/order-confirmation/:id",

  // Admin Routes
  ADMIN: "/admin",
  ADMIN_BOOKS: "/admin/books",
  ADMIN_BOOKS_CREATE: "/admin/books/create",
  ADMIN_BOOKS_EDIT: "/admin/books/edit/:id",
  ADMIN_STAFF: "/admin/staff",
  ADMIN_STAFF_CREATE: "/admin/staff/create",
  ADMIN_DISCOUNTS: "/admin/discounts",
  ADMIN_DISCOUNTS_CREATE: "/admin/discounts/create",
  ADMIN_DISCOUNTS_EDIT: "/admin/discounts/edit/:id",
  ADMIN_ANNOUNCEMENTS: "/admin/announcements",
  ADMIN_ANNOUNCEMENTS_CREATE: "/admin/announcements/create",
  ADMIN_ANNOUNCEMENTS_EDIT: "/admin/announcements/edit/:id",
};

/**
 * Role-based redirect component that handles authentication and role-based routing
 */
const RoleRedirect = () => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === "Admin") {
        navigate(ROUTES.ADMIN, { replace: true });
      } else {
        navigate(ROUTES.HOME, { replace: true });
      }
    } else {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
};

/**
 * Main App component that handles routing and authentication
 */
function App() {
  const { isAuthenticated, init } = useAuthStore();

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
            path={ROUTES.LOGIN}
            element={isAuthenticated ? <RoleRedirect /> : <Login />}
          />
          <Route
            path={ROUTES.REGISTER}
            element={isAuthenticated ? <RoleRedirect /> : <Register />}
          />

          {/* Public Routes */}
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.BOOKS} element={<BooksPage />} />
          <Route path={ROUTES.BOOK_DETAIL} element={<BookDetailPage />} />

          {/* Member Routes (Protected) */}
          <Route element={<ProtectedRoute />}>
            <Route path={ROUTES.WHITELIST} element={<WhitelistPage />} />
            <Route path={ROUTES.PROFILE} element={<div>Member Profile Page</div>} />
            <Route path={ROUTES.MY_ORDERS} element={<div>My Orders Page</div>} />
            <Route path={ROUTES.CART} element={<CartPage />} />
            <Route path={ROUTES.CHECKOUT} element={<CheckoutPage />} />
            <Route
              path={ROUTES.ORDER_CONFIRMATION}
              element={<OrderConfirmationPage />}
            />
          </Route>

          {/* Admin Routes */}
          <Route path={ROUTES.ADMIN} element={<AdminRoute />}>
            <Route index element={<AdminDashboard />} />
            <Route path="books" element={<AdminBookManagePage />} />
            <Route path="books/create" element={<BookForm />} />
            <Route path="books/edit/:id" element={<BookForm />} />

            {/* Staff Management Routes */}
            <Route path="staff" element={<StaffManagement />} />
            <Route path="staff/create" element={<CreateStaff />} />

            {/* Discount Management Routes */}
            <Route path="discounts" element={<DiscountManagement />} />
            <Route path="discounts/create" element={<CreateDiscount />} />
            <Route path="discounts/edit/:id" element={<EditDiscount />} />

            {/* Announcement Management Routes */}
            <Route path="announcements" element={<AnnouncementManagement />} />
            <Route path="announcements/create" element={<CreateAnnouncement />} />
            <Route path="announcements/edit/:id" element={<EditAnnouncement />} />
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
