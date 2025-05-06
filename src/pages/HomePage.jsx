import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/common/NavBar";
import Footer from "../components/common/Footer";
import BookCard from "../components/books/BookCard";
import useBookStore from "../stores/useBookStore";
import { FiArrowRight } from "react-icons/fi";

const HomePage = () => {
  const books = useBookStore((state) => state.books);
  const isLoading = useBookStore((state) => state.isLoading);
  const getBooks = useBookStore((state) => state.getBooks);
  const setFilters = useBookStore((state) => state.setFilters);
  const setPagination = useBookStore((state) => state.setPagination);

  const [searchQuery, setSearchQuery] = useState("");
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [dealsBooks, setDealsBooks] = useState([]);

  // Helper function to safely sort books
  const safeSort = (booksArray, sortFunction) => {
    if (!Array.isArray(booksArray) || booksArray.length === 0) return [];
    return [...booksArray].sort(sortFunction);
  };

  useEffect(() => {
    // Initialize book fetching
    if (setPagination) {
      setPagination({ pageNumber: 1, pageSize: 20 });
    }

    if (getBooks) {
      getBooks();
    }
  }, [getBooks, setPagination]);

  useEffect(() => {
    // Only process if books is an array and has items
    if (Array.isArray(books) && books.length > 0) {
      // Featured books (random selection)
      const featured = safeSort(books, () => 0.5 - Math.random()).slice(0, 4);
      setFeaturedBooks(featured);

      // Bestsellers (assuming we have a sales count or popularity field)
      const sellers = safeSort(
        books,
        (a, b) => (b.salesCount || 0) - (a.salesCount || 0)
      ).slice(0, 4);
      setBestSellers(sellers);

      // New releases (newest publication date)
      const newest = safeSort(books, (a, b) => {
        const dateA = a.publicationDate
          ? new Date(a.publicationDate)
          : new Date(0);
        const dateB = b.publicationDate
          ? new Date(b.publicationDate)
          : new Date(0);
        return dateB - dateA;
      }).slice(0, 4);
      setNewReleases(newest);

      // Deals (books on sale or with discounts)
      const deals = books
        .filter((book) => book.onSale || book.discountPercentage > 0)
        .slice(0, 4);
      setDealsBooks(deals.length > 0 ? deals : featured); // Fallback to featured if no deals
    }
  }, [books]);

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && setFilters) {
      setFilters({ search: searchQuery });
      // Redirect to search results page
      window.location.href = `/books?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  // Genres with icons
  const genres = [
    { name: "Fiction", path: "/genre/fiction", icon: "📚" },
    { name: "Non-Fiction", path: "/genre/non-fiction", icon: "📝" },
    { name: "Children's", path: "/genre/childrens", icon: "🧸" },
    { name: "Young Adult", path: "/genre/young-adult", icon: "👫" },
    { name: "Best Sellers", path: "/bestsellers", icon: "🏆" },
    { name: "Classics", path: "/genre/classics", icon: "📜" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Announcement Banner */}
      <div className="bg-red-600 text-white py-2 text-center">
        <p className="text-sm">
          Use code READNOW for free access to our book collection
        </p>
      </div>

      {/* Hero Section */}
      <section className="bg-white text-black py-20 md:py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Explore our collection of{" "}
                <span className="text-red-600">top quality</span> books for all
                readers
              </h1>
              <p className="text-xl mb-10 text-gray-600 max-w-xl">
                Browse by genre, author, or special promotions!
              </p>

              {/* Hero Search Bar */}
              <div className="flex w-full max-w-lg shadow-lg">
                <input
                  type="text"
                  placeholder="Search for your next favorite book"
                  className="flex-grow py-4 px-6 rounded-l-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-300 text-gray-800 bg-gray-50"
                />
                <button className="bg-red-600 text-white hover:bg-red-700 px-8 py-4 rounded-r-lg font-medium transition duration-300 flex items-center">
                  <span>Go</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex gap-4 mt-10">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-600">
                  #Fiction
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-600">
                  #Biography
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-600">
                  #Science
                </span>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center md:justify-end">
              <img
                src="https://images.unsplash.com/photo-1642197398012-e04b34d2bae6?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Person browsing books in library"
                className="rounded-2xl shadow-2xl object-cover h-96 w-full max-w-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Genres Section */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Genres</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {genres.map((genre, index) => (
              <Link
                key={index}
                to={genre.path}
                className="bg-pink-100 rounded-lg p-6 flex flex-col items-center transition-transform hover:-translate-y-1 hover:shadow-md"
              >
                <span className="text-4xl mb-4">{genre.icon}</span>
                <h3 className="font-medium text-lg text-center">
                  {genre.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bestsellers Section */}
      <section className="py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Bestsellers</h2>
            <Link
              to="/bestsellers"
              className="flex items-center text-red-600 hover:text-red-700 font-medium"
            >
              View All
              <FiArrowRight className="ml-2" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
          ) : bestSellers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {bestSellers.map((book) => (
                <BookCard key={book.id || book._id} book={book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No bestsellers available at the moment.
            </div>
          )}
        </div>
      </section>

      {/* New Releases Section */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">New Releases</h2>
            <Link
              to="/new-releases"
              className="flex items-center text-red-600 hover:text-red-700 font-medium"
            >
              View All
              <FiArrowRight className="ml-2" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
          ) : newReleases.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {newReleases.map((book) => (
                <BookCard key={book.id || book._id} book={book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No new releases available at the moment.
            </div>
          )}
        </div>
      </section>

      {/* Special Deals Section */}
      <section className="py-10 bg-red-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Special Deals</h2>
            <Link
              to="/deals"
              className="flex items-center text-red-600 hover:text-red-700 font-medium"
            >
              View All
              <FiArrowRight className="ml-2" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
          ) : dealsBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {dealsBooks.map((book) => (
                <BookCard key={book.id || book._id} book={book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No special deals available at the moment.
            </div>
          )}
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
