import React, { useEffect } from "react";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useNavigate,
} from "react-router-dom";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import HomePage from "./pages/HomePage";

import BookForm from "./components/admin/BookForm";
import ToastNotification from "./components/common/ToastNotification";

import BooksListingPage from "./components/books/BooksListingPage";
import BooksDetailPage from "./components/books/BooksDetailPage";

import AdminBookManagePage from "./pages/AdminBookManagePage";
import AdminDashboard from "./pages/AdminDashboard";

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
          <Route path="/booklist" element={<BooksListingPage />} />
          <Route path="/booksdetail/:id" element={<BooksDetailPage />} />
          

          {/* Member Routes (Protected) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<div>Member Profile Page</div>} />
            <Route path="/my-orders" element={<div>My Orders Page</div>} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route index element={<AdminDashboard />} />
            <Route path="books" element={<AdminBookManagePage />} />
            <Route path="books/create" element={<BookForm />} />
            <Route path="books/edit/:id" element={<BookForm />} />
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
