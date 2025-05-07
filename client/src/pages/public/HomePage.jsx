import React, { useState } from "react";
import { Link } from "react-router-dom";
import OnSaleBooks from "../../components/book/OnSaleBook";
import AnnouncementBanner from "../../components/common/AnnouncementBanner";
import Navbar from "../../components/common/NavBar";
import Footer from "../../components/common/Footer";

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/books?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  // Genre data with better icons and URLs
  const genres = [
    { name: "Fiction", icon: "📚", path: "/genre/fiction" },
    { name: "Non-Fiction", icon: "📘", path: "/genre/non-fiction" },
    { name: "Children's", icon: "🧸", path: "/genre/childrens" },
    { name: "Young Adult", icon: "🌟", path: "/genre/young-adult" },
    { name: "Best Sellers", icon: "🏆", path: "/bestsellers" },
    { name: "Classics", icon: "📜", path: "/genre/classics" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <AnnouncementBanner />
      <Navbar />

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Discover your next{" "}
                <span className="text-red-600">favorite</span> book
              </h1>
              <p className="text-xl text-gray-600 mb-10 max-w-xl">
                Explore our curated collection of books from every genre and for
                readers of all ages.
              </p>
              <form onSubmit={handleSearch} className="flex w-full max-w-lg">
                <div className="relative flex-grow shadow-sm">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, author, or genre"
                    className="w-full py-4 px-6 pr-10 border border-gray-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-4 bg-red-600 text-white font-medium rounded-r-lg hover:bg-red-700 transition duration-300 shadow-sm"
                >
                  Search
                </button>
              </form>
              <div className="flex flex-wrap gap-3 mt-10">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-50 text-red-600 border border-red-100">
                  #Fiction
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-600 border border-blue-100">
                  #Biography
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-600 border border-green-100">
                  #Science
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-50 text-purple-600 border border-purple-100">
                  #Fantasy
                </span>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center md:justify-end">
              <div className="relative w-72 h-72 md:w-96 md:h-96">
                <div className="absolute top-4 right-4 w-full h-full bg-red-100 rounded-xl"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-white rounded-xl shadow-xl overflow-hidden">
                  <img
                    src="https://media.istockphoto.com/id/1398466630/photo/bearded-man-comfortably-sitting-on-a-coach-reading-a-book-and-holding-his-dog.webp?a=1&b=1&s=612x612&w=0&k=20&c=E3DsW2kuTefVau12TGXq7SghIK0n25QX7hVS_x47NX4="
                    alt="Person reading a book"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured/On Sale Books Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Featured Books
            </h2>
            <Link
              to="/books"
              className="text-red-600 hover:text-red-700 font-medium flex items-center transition-colors duration-200"
            >
              View all
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
          <OnSaleBooks />
        </div>
      </section>

      {/* Genres Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Browse by Genre
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {genres.map((genre, index) => (
              <Link
                key={index}
                to={genre.path}
                className="bg-white rounded-lg p-6 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-all duration-300 group border border-gray-100"
              >
                <span className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {genre.icon}
                </span>
                <h3 className="font-medium text-gray-900 group-hover:text-red-600 transition-colors duration-300">
                  {genre.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Explore Similar Titles */}
      <section className="py-10 bg-pink-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">
            Explore Similar Titles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {/* Classic Literature Collection */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group">
              <div className="h-64 bg-gray-100 overflow-hidden">
                <img
                  src="https://blueroseone.com/publish/wp-content/uploads/2023/05/Classic-Literature-and-its-relevance-to-modern-readers.png"
                  alt="Classic Literature Collection"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <div className="mb-2 text-center">
                  <span className="inline-block bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    $35
                  </span>
                </div>
                <h3 className="font-bold text-lg text-center mb-1">
                  Classic Literature Collection
                </h3>
                <p className="text-sm text-center text-gray-600">
                  Collector's Edition
                </p>
              </div>
            </div>

            {/* Fantasy Adventure Series */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group">
              <div className="h-64 bg-gray-100 overflow-hidden">
                <img
                  src="https://c4.wallpaperflare.com/wallpaper/524/531/625/adventure-art-artistic-artwork-wallpaper-preview.jpg"
                  alt="Fantasy Adventure Series"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <div className="mb-2 text-center">
                  <span className="inline-block bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    $15
                  </span>
                </div>
                <h3 className="font-bold text-lg text-center mb-1">
                  Fantasy Adventure Series
                </h3>
                <p className="text-sm text-center text-gray-600">
                  Limited Stock
                </p>
              </div>
            </div>

            {/* Young Adult Bundle */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group">
              <div className="h-64 bg-gray-100 overflow-hidden">
                <img
                  src="https://goodminds.com/cdn/shop/files/YOUNG_ADULT_FINAL_JUNE_14_2024_BORISLAV_1000x.png?v=1718407260"
                  alt="Young Adult Bundle"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <div className="mb-2 text-center">
                  <span className="inline-block bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    $45
                  </span>
                </div>
                <h3 className="font-bold text-lg text-center mb-1">
                  Young Adult Bundle
                </h3>
                <p className="text-sm text-center text-gray-600">
                  Perfect for Teens
                </p>
              </div>
            </div>

            {/* Sci-Fi Novel Collection */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group">
              <div className="h-64 bg-gray-100 overflow-hidden">
                <img
                  src="https://hips.hearstapps.com/hmg-prod/images/index-65e760a47743b.jpg?crop=0.502xw:1.00xh;0.251xw,0&resize=1200:*"
                  alt="Sci-Fi Novel Collection"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <div className="mb-2 text-center">
                  <span className="inline-block bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    $19
                  </span>
                </div>
                <h3 className="font-bold text-lg text-center mb-1">
                  Sci-Fi Novel Collection
                </h3>
                <p className="text-sm text-center text-gray-600">
                  New Releases
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
