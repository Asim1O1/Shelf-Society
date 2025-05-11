import { Outlet } from "react-router-dom";
import StaffSidebar from "../components/staff/StaffSidebar";

const StaffLayout = () => {
  return (
    <div className="flex h-screen">
      <StaffSidebar />
      <div className="flex-grow p-6 bg-gray-50 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default StaffLayout;
