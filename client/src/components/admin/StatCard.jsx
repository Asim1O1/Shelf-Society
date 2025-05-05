import React from "react";
import { Link } from "react-router-dom";

const StatCard = ({ title, value, icon, color = "blue", link, linkText }) => {
  // Different background colors based on the color prop
  const bgColorMap = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
    yellow: "bg-yellow-100 text-yellow-600",
    purple: "bg-purple-100 text-purple-600",
  };

  const bgColorClass = bgColorMap[color] || bgColorMap.blue;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${bgColorClass}`}>{icon}</div>
        <div className="ml-4">
          <h2 className="text-gray-600 text-sm">{title}</h2>
          <div className="flex items-end">
            <span className="text-2xl font-semibold text-gray-800">
              {value}
            </span>
            {link && linkText && (
              <Link to={link} className="ml-2 text-blue-600 text-xs">
                {linkText}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
