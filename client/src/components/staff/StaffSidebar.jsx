import { FaClipboardList, FaThLarge } from "react-icons/fa"; // Import icons
import { Link, useLocation } from "react-router-dom";

export default function StaffSidebar() {
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/staff") {
      return location.pathname === "/staff";
    }
    return location.pathname.startsWith(path);
  };

  const baseLinkClasses =
    "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors";
  const activeClasses = "bg-blue-100 text-blue-700";
  const inactiveClasses = "text-gray-700 hover:bg-gray-100";

  return (
    <div className="w-64 min-h-screen bg-white border-r shadow-md p-4">
      <h2 className="text-2xl font-bold text-blue-600 mb-8 text-center">
        Staff Panel
      </h2>
      <ul className="space-y-2">
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
    </div>
  );
}
