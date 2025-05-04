import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiX } from "react-icons/fi";

const AnnouncementBanner = ({ announcement }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || !announcement) return null;

  return (
    <div className="bg-red-600 text-white py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="text-center flex-grow">
            <p className="text-sm md:text-base font-medium">
              {announcement.message}
              {announcement.linkUrl && (
                <Link
                  to={announcement.linkUrl}
                  className="underline ml-2 hover:text-red-200 transition"
                >
                  {announcement.linkText || "Learn more"}
                </Link>
              )}
            </p>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="ml-4 text-white hover:text-red-200 transition"
            aria-label="Close announcement"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
