import { useEffect, useState } from "react";
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
import EditStaffForm from "./components/admin/EditStaffForm";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import CartPage from "./components/cart/CartPage";
import ToastNotification from "./components/common/ToastNotification";
import StaffLayout from "./layouts/StaffLayout";
import AdminBookManagePage from "./pages/admin/AdminBookManagePage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrderManagement from "./pages/admin/AdminOrderManagement";
import AnnouncementManagement from "./pages/admin/AnnounceManagement";
import DiscountManagement from "./pages/admin/DiscountManagement";
import StaffManagement from "./pages/admin/StaffManagement";
import BooksPage from "./pages/public/BooksPage";
import HomePage from "./pages/public/HomePage";
import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffOrderDetails from "./pages/staff/StaffOrderDetails";
import StaffOrdersList from "./pages/staff/StaffOrderList";
import BookDetailPage from "./pages/User/BookDetail";
import CheckoutPage from "./pages/User/CheckOutPage";
import MyOrdersPage from "./pages/User/MyOrdersPage";
import OrderConfirmationPage from "./pages/User/OrderConfirmationPage";
import WhitelistPage from "./pages/User/Whitelists";
import useAuthStore from "./stores/useAuthStore";
import ProtectedRoute, { AdminRoute } from "./utils/ProtectRoute";

// Component to redirect admin/staff away from public/user pages
const AdminStaffPublicRoute = ({ children }) => {
  const { user } = useAuthStore();

  if (user && user.role === "Admin") {
    return <Navigate to="/admin" replace />;
  } else if (user && user.role === "Staff") {
    return <Navigate to="/staff" replace />;
  }

  return children;
};

// Simplified role-based redirect component
const RoleRedirect = () => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    // Small delay to ensure auth state is loaded
    const redirectTimeout = setTimeout(() => {
      if (!isAuthenticated) {
        navigate("/login", { replace: true });
      } else if (user?.role === "Admin") {
        navigate("/admin", { replace: true });
      } else if (user?.role === "Staff") {
        navigate("/staff", { replace: true });
      } else {
        // For regular users or undefined roles
        navigate("/", { replace: true });
      }
      setIsRedirecting(false);
    }, 100); // Small delay to ensure state is ready

    return () => clearTimeout(redirectTimeout);
  }, [isAuthenticated, user, navigate]);

  if (!isRedirecting) {
    return null; // Navigation will happen, no need to show anything
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
};

function App() {
  const { isAuthenticated, user, init } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth store when app loads
  useEffect(() => {
    const initAuth = async () => {
      try {
        await init();
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        // Always set loading to false after a timeout to prevent infinite loading
        setTimeout(() => {
          setIsLoading(false);
        }, 1000); // Give it 1 second max
      }
    };

    initAuth();
  }, [init]);

  // Show loading state briefly while auth initializes
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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
                  <MyOrdersPage />
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
            <Route path="staff/edit/:id" element={<EditStaffForm />} />
            <Route path="orders" element={<AdminOrderManagement />} />
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

          {/* Staff Routes */}
          <Route path="/staff" element={<StaffLayout />}>
            <Route index element={<StaffDashboard />} />
            <Route path="orders" element={<StaffOrdersList />} />
            <Route path="orders/:id" element={<StaffOrderDetails />} />
          </Route>

          {/* Role-Based Redirection Route */}
          <Route path="/redirect" element={<RoleRedirect />} />

          {/* Fallback route */}
          <Route
            path="*"
            element={
              <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-gray-600 mb-8">Page not found</p>
                  <button
                    onClick={() => window.history.back()}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
