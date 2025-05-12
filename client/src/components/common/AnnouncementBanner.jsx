// src/components/common/AnnouncementBanner.jsx
import { Bell, ChevronLeft, ChevronRight, Clock, X } from "lucide-react";
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
    // Auto-rotate announcements if there are multiple
    if (announcements.length > 1) {
      const intervalId = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
      }, 7000); // Change every 7 seconds

      return () => clearInterval(intervalId);
    }
  }, [announcements.length]);

  // Calculate remaining days
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
    <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white py-4 px-4 shadow-lg relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-96 h-96 bg-gradient-to-br from-red-400 to-transparent rounded-full -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-gradient-to-bl from-red-400 to-transparent rounded-full -bottom-48 -right-48 animate-pulse"></div>
      </div>

      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="flex items-center justify-between">
          {/* Left side - Navigation for multiple announcements */}
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
                className="mr-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all transform hover:scale-110"
                aria-label="Previous announcement"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {/* Announcement icon */}
            <div className="hidden sm:flex items-center mr-4">
              <div className="p-2 bg-white/10 rounded-full animate-bounce">
                <Bell className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Center - Announcement content */}
          <div className="flex-1 text-center px-4">
            <div className="animate-fade-in">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <h4 className="font-bold text-lg md:text-xl">
                  {currentAnnouncement.title}
                </h4>
                {/* Time remaining badge */}
                {remainingDays > 0 && (
                  <span className="hidden md:inline-flex items-center px-2 py-1 rounded-full bg-white/20 text-xs font-medium">
                    <Clock className="w-3 h-3 mr-1" />
                    {remainingDays} days left
                  </span>
                )}
              </div>
              <p className="text-sm md:text-base text-red-100">
                {currentAnnouncement.content}
              </p>
            </div>
          </div>

          {/* Right side - Navigation and close */}
          <div className="flex items-center">
            {announcements.length > 1 && (
              <button
                onClick={() =>
                  setCurrentIndex(
                    (prevIndex) => (prevIndex + 1) % announcements.length
                  )
                }
                className="mr-3 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all transform hover:scale-110"
                aria-label="Next announcement"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setIsBannerVisible(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all transform hover:scale-110 hover:rotate-90"
              aria-label="Close announcement"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pagination dots */}
        {announcements.length > 1 && (
          <div className="flex justify-center mt-3 space-x-2">
            {announcements.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? "bg-white w-8 h-2"
                    : "bg-white/40 w-2 h-2 hover:bg-white/60"
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
