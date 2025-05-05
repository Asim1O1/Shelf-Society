import React from "react";
import Navbar from "../components/common/NavBar";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Explore our collection of top quality books for all readers
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Browse by genre, author, or special promotions!
              </p>
              <div className="flex">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Search for your next favorite book"
                    className="w-full py-3 px-4 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                  <button className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
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
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      ></path>
                    </svg>
                  </button>
                </div>
                <button className="ml-4 px-8 py-3 bg-red-500 text-white font-medium rounded-full hover:bg-red-600 transition duration-300">
                  Go
                </button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="w-64 h-64 md:w-80 md:h-80 bg-black rounded-full relative overflow-hidden">
                <img
                  src="/api/placeholder/400/400"
                  alt="Person reading a book"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Genres Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Genres</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "Fiction", icon: "📚" },
              { name: "Non-Fiction", icon: "📙" },
              { name: "Children's", icon: "📚" },
              { name: "Young Adult", icon: "📖" },
              { name: "Best Sellers", icon: "🏆" },
              { name: "Classics", icon: "📜" },
            ].map((genre, index) => (
              <div
                key={index}
                className="bg-pink-100 rounded-lg p-6 flex flex-col items-center"
              >
                <h3 className="font-medium text-lg mb-4">{genre.name}</h3>
                <div className="w-16 h-16 flex items-center justify-center">
                  <img
                    src={`/api/placeholder/80/80`}
                    alt={`${genre.name} icon`}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
