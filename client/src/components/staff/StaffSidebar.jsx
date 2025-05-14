import { FaClipboardList, FaSignOutAlt, FaThLarge } from "react-icons/fa"; // Import icons
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";

export default function StaffSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore(); // Get logout function from auth store

  const isActive = (path) => {
    if (path === "/staff") {
      return location.pathname === "/staff";
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout(); // Call logout function from auth store
    navigate("/login"); // Navigate to login page after logout
  };

  const baseLinkClasses =
    "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors";
  const activeClasses = "bg-blue-100 text-blue-700";
  const inactiveClasses = "text-gray-700 hover:bg-gray-100";

  return (
    <div className="w-64 min-h-screen bg-white border-r shadow-md p-4 flex flex-col">
      <h2 className="text-2xl font-bold text-blue-600 mb-8 text-center">
        Staff Panel
      </h2>

      <ul className="space-y-2 flex-1">
        <li>
          <Link
            to="/staff"
            className={`${baseLinkClasses} ${
              isActive("/staff") ? activeClasses : inactiveClasses
            }`}
          >
            <FaThLarge className="w-5 h-5" />
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            to="/staff/orders"
            className={`${baseLinkClasses} ${
              isActive("/staff/orders") ? activeClasses : inactiveClasses
            }`}
          >
            <FaClipboardList className="w-5 h-5" />
            All Orders
          </Link>
        </li>
      </ul>

      {/* Logout button at the bottom */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className={`${baseLinkClasses} ${inactiveClasses} w-full text-red-600 hover:bg-red-50 hover:text-red-700`}
        >
          <FaSignOutAlt className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
