import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";

// Admin-only protected route
export const AdminRoute = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "Admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

// Staff-only protected route
export const StaffRoute = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "Staff") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

// General protected route for any authenticated user
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
