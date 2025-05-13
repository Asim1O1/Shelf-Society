// src/components/common/AnnouncementBanner.jsx
import { ChevronLeft, ChevronRight, Clock, X } from "lucide-react";
import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

const AnnouncementBanner = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await axiosInstance.get("/announcements/active");
        if (response.data.success && response.data.data.length > 0) {
          setAnnouncements(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching announcements:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (announcements.length > 1) {
      const intervalId = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
      }, 7000);

      return () => clearInterval(intervalId);
    }
  }, [announcements.length]);

  const calculateRemainingDays = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (isLoading || announcements.length === 0 || !isBannerVisible) {
    return null;
  }

  const currentAnnouncement = announcements[currentIndex];
  const remainingDays = calculateRemainingDays(currentAnnouncement.endDate);

  return (
    <div className="bg-gradient-to-r from-red-600 to-red-500 text-white py-3">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center">
            {announcements.length > 1 && (
              <button
                onClick={() =>
                  setCurrentIndex(
                    (prevIndex) =>
                      (prevIndex - 1 + announcements.length) %
                      announcements.length
                  )
                }
                className="mr-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Previous announcement"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Center - Content */}
          <div className="flex-1 text-center px-4">
            <div className="flex items-center justify-center gap-3">
              <span className="font-medium text-sm md:text-base">
                {currentAnnouncement.title}
              </span>
              <span className="hidden md:inline text-sm text-red-100">
                {currentAnnouncement.content}
              </span>
              {remainingDays > 0 && (
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full bg-white/20 text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {remainingDays} days left
                </span>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center">
            {announcements.length > 1 && (
              <button
                onClick={() =>
                  setCurrentIndex(
                    (prevIndex) => (prevIndex + 1) % announcements.length
                  )
                }
                className="mr-2 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Next announcement"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setIsBannerVisible(false)}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Close announcement"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dots */}
        {announcements.length > 1 && (
          <div className="flex justify-center mt-2 gap-1">
            {announcements.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? "bg-white w-6 h-1.5"
                    : "bg-white/40 w-1.5 h-1.5 hover:bg-white/60"
                }`}
                aria-label={`Go to announcement ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementBanner;
