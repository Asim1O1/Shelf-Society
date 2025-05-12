import { ArrowRight, BookOpen, Calendar, Search, Star } from "lucide-react";
import { useEffect, useState } from "react";
import OnSaleBooks from "../../components/book/OnSaleBook";
import AnnouncementBanner from "../../components/common/AnnouncementBanner";
import Navbar from "../../components/common/NavBar";
import axiosInstance from "../../utils/axiosInstance";

const HomePage = () => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [genres, setGenres] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomePageData = async () => {
      try {
        setIsLoading(true);

        // Fetch genres
        const genresRes = await axiosInstance.get("/books/genres");
        setGenres(genresRes.data.data || []);

        // Fetch new releases
        const newReleasesRes = await axiosInstance.get(
          "/books?sortBy=date_desc&pageSize=6"
        );
        setNewReleases(newReleasesRes.data.data.items || []);

        // Fetch top rated books
        const topRatedRes = await axiosInstance.get(
          "/books?sortBy=rating_desc&pageSize=6"
        );
        setTopRated(topRatedRes.data.data.items || []);
      } catch (error) {
        console.error("Error fetching homepage data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomePageData();
  }, []);

  const genreColors = {
    fiction: {
      bg: "bg-purple-50 hover:bg-purple-100",
      gradient: "from-purple-400 to-purple-600",
      icon: "📚",
      shadow: "hover:shadow-purple-200",
    },
    "non-fiction": {
      bg: "bg-green-50 hover:bg-green-100",
      gradient: "from-green-400 to-green-600",
      icon: "📙",
      shadow: "hover:shadow-green-200",
    },
    mystery: {
      bg: "bg-gray-50 hover:bg-gray-100",
      gradient: "from-gray-400 to-gray-600",
      icon: "🔍",
      shadow: "hover:shadow-gray-200",
    },
    romance: {
      bg: "bg-pink-50 hover:bg-pink-100",
      gradient: "from-pink-400 to-pink-600",
      icon: "💕",
      shadow: "hover:shadow-pink-200",
    },
    "science fiction": {
      bg: "bg-blue-50 hover:bg-blue-100",
      gradient: "from-blue-400 to-blue-600",
      icon: "🚀",
      shadow: "hover:shadow-blue-200",
    },
    fantasy: {
      bg: "bg-purple-50 hover:bg-purple-100",
      gradient: "from-purple-400 to-purple-600",
      icon: "🧙",
      shadow: "hover:shadow-purple-200",
    },
    thriller: {
      bg: "bg-red-50 hover:bg-red-100",
      gradient: "from-red-400 to-red-600",
      icon: "😱",
      shadow: "hover:shadow-red-200",
    },
    biography: {
      bg: "bg-yellow-50 hover:bg-yellow-100",
      gradient: "from-yellow-400 to-yellow-600",
      icon: "👤",
      shadow: "hover:shadow-yellow-200",
    },
    default: {
      bg: "bg-gray-50 hover:bg-gray-100",
      gradient: "from-gray-400 to-gray-600",
      icon: "📖",
      shadow: "hover:shadow-gray-200",
    },
  };

  const getGenreStyle = (genre) => {
    const key = genre.toLowerCase();
    return genreColors[key] || genreColors.default;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/books?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  // Loading skeleton components
  const BookSkeleton = () => (
    <div className="animate-pulse">
      <div className="bg-gray-200 rounded-lg h-64 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <AnnouncementBanner />
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-red-50">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-100 rounded-full opacity-30 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-yellow-100 rounded-full opacity-20 blur-3xl"></div>
        </div>

        <div className="relative py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-16">
              <div className="md:w-1/2 space-y-8">
                <div className="space-y-6">
                  <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                    Discover Your Next{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">
                      Great Read
                    </span>
                  </h1>
                  <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
                    Browse thousands of books across all genres. Find
                    bestsellers, new releases, and timeless classics in our
                    curated collection.
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative group">
                  <div
                    className={`flex items-center bg-white rounded-2xl shadow-lg transition-all duration-300 ${
                      searchFocused ? "shadow-xl ring-2 ring-red-100" : ""
                    }`}
                  >
                    <div className="relative flex-grow">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by title, author, or ISBN..."
                        className="w-full py-5 px-6 pr-16 text-lg rounded-l-2xl focus:outline-none"
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleSearch(e);
                          }
                        }}
                      />
                      <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                    </div>
                    <button
                      onClick={handleSearch}
                      className="px-8 py-5 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold text-lg rounded-r-2xl hover:from-red-700 hover:to-red-600 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      Search
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-8 pt-8">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">
                      {genres.length}+
                    </p>
                    <p className="text-gray-600">Genres</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">1000+</p>
                    <p className="text-gray-600">Books</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">4.5★</p>
                    <p className="text-gray-600">Avg Rating</p>
                  </div>
                </div>
              </div>

              {/* Hero Image */}
              <div className="md:w-1/2 flex justify-center">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-400/20 to-red-600/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                  <div className="relative w-[350px] h-[450px] md:w-[450px] md:h-[550px] rounded-3xl overflow-hidden shadow-2xl bg-gray-100">
                    <img
                      src="/api/placeholder/450/550"
                      alt="Book collection showcase"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                    <div className="absolute bottom-8 left-8 right-8 text-white">
                      <p className="text-2xl font-bold mb-2">
                        Premium Collection
                      </p>
                      <p className="text-lg opacity-90">Curated for readers</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* On Sale Books Section */}
      <OnSaleBooks />

      {/* New Releases Section */}
      {!isLoading && newReleases.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <h2 className="text-4xl font-bold text-gray-900">
                  New Releases
                </h2>
                <div className="flex items-center bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                  <Calendar className="w-4 h-4 mr-2" />
                  Recent Arrivals
                </div>
              </div>
              <a
                href="/books?sortBy=date_desc"
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 group"
              >
                View All
                <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {newReleases.map((book) => (
                <a href={`/books/${book.id}`} key={book.id} className="group">
                  <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
                    <div className="relative aspect-[2/3] bg-gray-100">
                      <img
                        src={
                          book.imageUrl ||
                          "https://via.placeholder.com/300x450?text=No+Image"
                        }
                        alt={book.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-red-600 transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {book.author}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="ml-1 text-sm font-medium">
                            {book.rating?.toFixed(1) || "N/A"}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          ({book.reviewCount || 0})
                        </span>
                      </div>
                      <p className="font-bold text-lg text-gray-900">
                        ${book.price?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top Rated Books Section */}
      {!isLoading && topRated.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <h2 className="text-4xl font-bold text-gray-900">
                  Top Rated Books
                </h2>
                <div className="flex items-center bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-medium">
                  <Star className="w-4 h-4 mr-2 fill-current" />
                  Reader Favorites
                </div>
              </div>
              <a
                href="/books?sortBy=rating_desc"
                className="text-yellow-600 hover:text-yellow-700 font-medium flex items-center gap-2 group"
              >
                View All
                <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {topRated.map((book) => (
                <a href={`/books/${book.id}`} key={book.id} className="group">
                  <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
                    <div className="relative aspect-[2/3] bg-gray-100">
                      <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10 shadow-lg">
                        ★ {book.rating?.toFixed(1) || "N/A"}
                      </div>
                      <img
                        src={
                          book.imageUrl ||
                          "https://via.placeholder.com/300x450?text=No+Image"
                        }
                        alt={book.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-red-600 transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {book.author}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {book.reviewCount || 0} reviews
                        </span>
                      </div>
                      <p className="font-bold text-lg text-gray-900">
                        ${book.price?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Genres Section */}
      {!isLoading && genres.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-gray-900 mb-6">
                Browse by Genre
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover your next favorite book by exploring our diverse
                collection of genres
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {genres.map((genre, index) => {
                const style = getGenreStyle(genre.name);
                return (
                  <a
                    key={index}
                    href={`/books?genre=${encodeURIComponent(genre.name)}`}
                    className={`group cursor-pointer ${style.bg} ${style.shadow} rounded-2xl p-8 shadow-md transition-all duration-300 hover:scale-105`}
                  >
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div
                        className={`w-24 h-24 rounded-full bg-gradient-to-br ${style.gradient} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}
                      >
                        <span className="text-4xl">{style.icon}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-gray-800 mb-2">
                          {genre.name}
                        </h3>
                        <p className="text-gray-600">{genre.count} books</p>
                      </div>
                      <div
                        className={`w-full h-1 bg-gradient-to-r ${style.gradient} rounded-full opacity-0 group-hover:opacity-100 transition-opacity`}
                      ></div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-red-700">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl font-bold text-white">
              Start Your Reading Journey Today
            </h2>
            <p className="text-xl text-red-100">
              Join thousands of readers who have discovered their perfect books
              with us
            </p>
            <a
              href="/books"
              className="inline-flex items-center gap-3 bg-white text-red-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors shadow-xl hover:shadow-2xl"
            >
              <BookOpen className="w-6 h-6" />
              Browse All Books
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
