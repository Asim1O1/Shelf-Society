import { ArrowRight, BookOpen, Calendar, Search, Star } from "lucide-react";
import { useEffect, useState } from "react";
import OnSaleBooks from "../../components/book/OnSaleBook";
import AnnouncementBanner from "../../components/common/AnnouncementBanner";
import Navbar from "../../components/common/NavBar";
import Footer from "../../components/common/Footer";
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
      gradient: "from-purple-500 to-purple-600",
      icon: "📚",
    },
    "non-fiction": {
      bg: "bg-green-50 hover:bg-green-100",
      gradient: "from-green-500 to-green-600",
      icon: "📙",
    },
    mystery: {
      bg: "bg-gray-50 hover:bg-gray-100",
      gradient: "from-gray-500 to-gray-600",
      icon: "🔍",
    },
    romance: {
      bg: "bg-red-50 hover:bg-red-100",
      gradient: "from-red-500 to-red-600",
      icon: "💕",
    },
    "science fiction": {
      bg: "bg-blue-50 hover:bg-blue-100",
      gradient: "from-blue-500 to-blue-600",
      icon: "🚀",
    },
    fantasy: {
      bg: "bg-purple-50 hover:bg-purple-100",
      gradient: "from-purple-500 to-purple-600",
      icon: "🧙",
    },
    thriller: {
      bg: "bg-red-50 hover:bg-red-100",
      gradient: "from-red-500 to-red-600",
      icon: "😱",
    },
    biography: {
      bg: "bg-yellow-50 hover:bg-yellow-100",
      gradient: "from-yellow-500 to-yellow-600",
      icon: "👤",
    },
    default: {
      bg: "bg-gray-50 hover:bg-gray-100",
      gradient: "from-gray-500 to-gray-600",
      icon: "📖",
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

  return (
    <>
      <div className="min-h-screen bg-white">
        <AnnouncementBanner />
        <Navbar />

        {/* Hero Section - Minimal with red accents */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-red-50"></div>

          <div className="relative py-24 md:py-32">
            <div className="container mx-auto px-4 max-w-7xl">
              <div className="flex flex-col md:flex-row items-center gap-16">
                <div className="md:w-1/2 space-y-10">
                  <div className="space-y-6">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 leading-tight">
                      Your Next
                      <span className="block font-normal text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">
                        Great Read
                      </span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 max-w-lg font-light">
                      Discover curated books across all genres. From bestsellers
                      to hidden gems.
                    </p>
                  </div>

                  {/* Search Bar - Minimal with red accent */}
                  <form onSubmit={handleSearch} className="relative">
                    <div className="relative group">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search books..."
                        className="w-full py-4 px-6 bg-white border border-gray-200 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 transition-all duration-200"
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                      />
                      <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-full hover:from-red-700 hover:to-red-600 transition-all shadow-md hover:shadow-lg"
                      >
                        <Search className="w-5 h-5" />
                      </button>
                    </div>
                  </form>

                  {/* Stats - Minimal design */}
                  <div className="flex gap-12 pt-4">
                    <div>
                      <p className="text-3xl font-light text-gray-900">
                        {genres.length}+
                      </p>
                      <p className="text-sm text-gray-500 font-light">Genres</p>
                    </div>
                    <div>
                      <p className="text-3xl font-light text-gray-900">1000+</p>
                      <p className="text-sm text-gray-500 font-light">Books</p>
                    </div>
                    <div>
                      <p className="text-3xl font-light text-gray-900">4.5★</p>
                      <p className="text-sm text-gray-500 font-light">Rating</p>
                    </div>
                  </div>
                </div>

                {/* Hero Image - Cleaner presentation */}
                <div className="md:w-1/2 flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-400/20 to-red-600/20 rounded-3xl blur-2xl"></div>
                    <div className="relative w-[350px] h-[500px] md:w-[400px] md:h-[550px] rounded-3xl overflow-hidden bg-gray-100 shadow-2xl">
                      <img
                        src="https://img.freepik.com/free-photo/medium-shot-man-reading-home_23-2149879774.jpg?semt=ais_hybrid&w=740"
                        alt="Featured books"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                      <div className="absolute bottom-8 left-8 right-8 text-white">
                        <p className="text-2xl font-normal mb-2">
                          Premium Collection
                        </p>
                        <p className="text-lg font-light opacity-90">
                          Curated for readers
                        </p>
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

        {/* New Releases Section - Clean minimal design */}
        {!isLoading && newReleases.length > 0 && (
          <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4 max-w-7xl">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-3xl font-light text-gray-900 mb-2">
                    New Releases
                  </h2>
                  <p className="text-gray-500 font-light">
                    Fresh arrivals this month
                  </p>
                </div>
                <a
                  href="/books?sortBy=date_desc"
                  className="text-red-600 hover:text-red-700 font-light flex items-center gap-2 group"
                >
                  View all
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {newReleases.map((book) => (
                  <a href={`/books/${book.id}`} key={book.id} className="group">
                    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                      <div className="relative aspect-[2/3] bg-gray-100">
                        <img
                          src={
                            book.imageUrl ||
                            "https://via.placeholder.com/300x450?text=No+Image"
                          }
                          alt={book.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 space-y-2">
                        <h3 className="font-normal text-gray-900 text-sm line-clamp-2 group-hover:text-red-600 transition-colors">
                          {book.title}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {book.author}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">
                            ${book.price?.toFixed(2) || "0.00"}
                          </span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-gray-500">
                              {book.rating?.toFixed(1) || "N/A"}
                            </span>
                          </div>
                        </div>
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
          <section className="py-20 bg-white">
            <div className="container mx-auto px-4 max-w-7xl">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-3xl font-light text-gray-900 mb-2">
                    Top Rated
                  </h2>
                  <p className="text-gray-500 font-light">Readers' favorites</p>
                </div>
                <a
                  href="/books?sortBy=rating_desc"
                  className="text-red-600 hover:text-red-700 font-light flex items-center gap-2 group"
                >
                  View all
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {topRated.map((book) => (
                  <a href={`/books/${book.id}`} key={book.id} className="group">
                    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                      <div className="relative aspect-[2/3] bg-gray-100">
                        <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium z-10 shadow-sm">
                          ★ {book.rating?.toFixed(1) || "N/A"}
                        </div>
                        <img
                          src={
                            book.imageUrl ||
                            "https://via.placeholder.com/300x450?text=No+Image"
                          }
                          alt={book.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 space-y-2">
                        <h3 className="font-normal text-gray-900 text-sm line-clamp-2 group-hover:text-red-600 transition-colors">
                          {book.title}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {book.author}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">
                            ${book.price?.toFixed(2) || "0.00"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {book.reviewCount || 0} reviews
                          </span>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Genres Section - Minimal with colored accents */}
        {!isLoading && genres.length > 0 && (
          <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4 max-w-7xl">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-light text-gray-900 mb-4">
                  Browse by Genre
                </h2>
                <p className="text-gray-500 font-light max-w-2xl mx-auto">
                  Find your preferred reading category
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {genres.map((genre, index) => {
                  const style = getGenreStyle(genre.name);
                  return (
                    <a
                      key={index}
                      href={`/books?genre=${encodeURIComponent(genre.name)}`}
                      className={`group ${style.bg} rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-lg bg-gradient-to-br ${style.gradient} flex items-center justify-center shadow-md`}
                        >
                          <span className="text-2xl filter brightness-110">
                            {style.icon}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">
                            {genre.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {genre.count} books
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section - Red gradient maintained */}
        <section className="py-24 bg-gradient-to-r from-red-600 to-red-700">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h2 className="text-3xl font-light text-white mb-6">
              Start Reading Today
            </h2>
            <p className="text-red-100 font-light mb-10">
              Join our community of passionate readers
            </p>
            <a
              href="/books"
              className="inline-flex items-center gap-3 bg-white text-red-600 px-8 py-4 rounded-full font-medium hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl"
            >
              <BookOpen className="w-5 h-5" />
              Browse Library
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default HomePage;
