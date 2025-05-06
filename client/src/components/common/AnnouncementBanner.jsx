// src/components/common/AnnouncementBanner.jsx
import React, { useEffect, useState } from "react";
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
      }, 5000); // Change every 5 seconds

      return () => clearInterval(intervalId);
    }
  }, [announcements.length]);

  if (isLoading || announcements.length === 0 || !isBannerVisible) {
    return null; // Don't show anything if loading, no announcements, or banner closed
  }

  const currentAnnouncement = announcements[currentIndex];

  return (
    <div className="bg-red-600 text-white py-3 px-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-center">
          {announcements.length > 1 && (
            <button
              onClick={() =>
                setCurrentIndex(
                  (prevIndex) =>
                    (prevIndex - 1 + announcements.length) %
                    announcements.length
                )
              }
              className="mr-3 text-white hover:text-red-200"
              aria-label="Previous announcement"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                ></path>
              </svg>
            </button>
          )}

          <div className="flex-1 text-center">
            <h4 className="font-bold text-lg">{currentAnnouncement.title}</h4>
            <p>{currentAnnouncement.content}</p>
          </div>

          <div className="flex">
            {announcements.length > 1 && (
              <button
                onClick={() =>
                  setCurrentIndex(
                    (prevIndex) => (prevIndex + 1) % announcements.length
                  )
                }
                className="ml-3 text-white hover:text-red-200"
                aria-label="Next announcement"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </button>
            )}

            <button
              onClick={() => setIsBannerVisible(false)}
              className="ml-3 text-white hover:text-red-200"
              aria-label="Close announcement"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>
        </div>

        {announcements.length > 1 && (
          <div className="flex justify-center mt-2">
            {announcements.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 w-2 mx-1 rounded-full ${
                  index === currentIndex ? "bg-white" : "bg-red-300"
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
