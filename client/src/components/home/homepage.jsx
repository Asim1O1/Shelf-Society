import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../home/navbar";
import Footer from "../home/footer";
import BookCard from "../book/bookCard";
import AnnouncementBanner from "../book/AnnouncementBanner";
import { FiArrowRight } from "react-icons/fi";

const HomePage = () => {
  // Mock data and functions since we're not using the commented store
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock fetch functions
  const fetchBooks = () => {
    // Simulate API fetch with timeout
    setTimeout(() => {
      setBooks(mockBooks);
      setLoading(false);
    }, 1000);
  };

  const fetchFeaturedBooks = () => {
    // In a real implementation, this would fetch featured books
    console.log("Fetching featured books (mock)");
  };

  const [activeAnnouncement, setActiveAnnouncement] = useState(null);

  useEffect(() => {
    fetchBooks();
    fetchFeaturedBooks();

    // Simulate fetching an announcement (replace with actual API call)
    const mockAnnouncement = {
      id: 1,
      message: "Summer Reading Sale: Get 20% off on all fiction books!",
      linkUrl: "/deals",
      linkText: "Shop Now",
    };
    setActiveAnnouncement(mockAnnouncement);
  }, []);

  // Filter books for different sections
  const newReleases = books
    .filter((book) => {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return new Date(book.publicationDate) >= threeMonthsAgo;
    })
    .slice(0, 4);

  const bestsellers = [...books]
    .sort((a, b) => b.salesCount - a.salesCount)
    .slice(0, 4);

  const dealsBooks = books.filter((book) => book.onSale).slice(0, 4);

  // Genres with icons
  const genres = [
    {
      name: "Fiction",
      path: "/genre/fiction",
      icon: "📚",
      bgColor: "bg-red-50",
    },
    {
      name: "Non-Fiction",
      path: "/genre/non-fiction",
      icon: "📝",
      bgColor: "bg-red-50",
    },
    {
      name: "Children's",
      path: "/genre/childrens",
      icon: "🧸",
      bgColor: "bg-red-50",
    },
    {
      name: "Young Adult",
      path: "/genre/young-adult",
      icon: "👫",
      bgColor: "bg-red-50",
    },
    {
      name: "Best Sellers",
      path: "/bestsellers",
      icon: "🏆",
      bgColor: "bg-red-50",
    },
    {
      name: "Classics",
      path: "/genre/classics",
      icon: "🏛️",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      {/* Announcement Banner */}
      {activeAnnouncement && (
        <AnnouncementBanner announcement={activeAnnouncement} />
      )}

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
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">
            Genres
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {genres.map((genre) => (
              <Link
                key={genre.name}
                to={genre.path}
                className={`${genre.bgColor} rounded-lg p-4 flex flex-col items-center transition duration-300 hover:shadow-md hover:-translate-y-1`}
              >
                <div className="text-4xl mb-3">{genre.icon}</div>
                <h3 className="text-center font-semibold text-gray-900">
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Bestsellers</h2>
            <Link
              to="/bestsellers"
              className="flex items-center text-red-600 hover:text-red-700 font-medium"
            >
              View All
              <FiArrowRight className="ml-2" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {bestsellers.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* New Releases Section */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">New Releases</h2>
            <Link
              to="/new-releases"
              className="flex items-center text-red-600 hover:text-red-700 font-medium"
            >
              View All
              <FiArrowRight className="ml-2" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {newReleases.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Deals Section */}
      <section className="py-10 bg-red-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Special Deals</h2>
            <Link
              to="/deals"
              className="flex items-center text-red-600 hover:text-red-700 font-medium"
            >
              View All
              <FiArrowRight className="ml-2" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {dealsBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-red-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Become a Member Today</h2>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            Join our membership program to enjoy exclusive discounts, easy
            ordering, and the ability to save your favorite books.
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-red-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-bold text-lg transition duration-200"
          >
            Register Now
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Mock data for books
const mockBooks = [
  {
    id: 1,
    title: "The Midnight Library",
    author: "Matt Haig",
    coverImage: "https://source.unsplash.com/random/400x600?book,fantasy",
    price: 24.99,
    discountPercentage: 15,
    onSale: true,
    inStock: true,
    averageRating: 4.5,
    totalReviews: 120,
    publicationDate: "2023-02-15",
    listedDate: "2023-03-01",
    description:
      "Between life and death there is a library, and within that library, the shelves go on forever.",
    genre: "Fiction",
    salesCount: 1500,
  },
  {
    id: 2,
    title: "Project Hail Mary",
    author: "Andy Weir",
    coverImage: "https://source.unsplash.com/random/400x600?book,scifi",
    price: 27.99,
    discountPercentage: 0,
    onSale: false,
    inStock: true,
    averageRating: 4.8,
    totalReviews: 98,
    publicationDate: "2023-04-10",
    listedDate: "2023-04-15",
    description: "A lone astronaut must save the earth from disaster.",
    genre: "Science Fiction",
    salesCount: 1200,
  },
  {
    id: 3,
    title: "The Invisible Life of Addie LaRue",
    author: "V.E. Schwab",
    coverImage: "https://source.unsplash.com/random/400x600?book,fantasy",
    price: 22.99,
    discountPercentage: 20,
    onSale: true,
    inStock: true,
    averageRating: 4.3,
    totalReviews: 150,
    publicationDate: "2023-01-05",
    listedDate: "2023-01-10",
    description:
      "A girl makes a Faustian bargain to live forever—and is cursed to be forgotten by everyone she meets.",
    genre: "Fantasy",
    salesCount: 980,
  },
  {
    id: 4,
    title: "Atomic Habits",
    author: "James Clear",
    coverImage: "https://source.unsplash.com/random/400x600?book,selfhelp",
    price: 19.99,
    discountPercentage: 0,
    onSale: false,
    inStock: true,
    averageRating: 4.9,
    totalReviews: 250,
    publicationDate: "2023-03-20",
    listedDate: "2023-03-25",
    description: "An easy & proven way to build good habits & break bad ones.",
    genre: "Self Help",
    salesCount: 2500,
  },
  {
    id: 5,
    title: "The Four Winds",
    author: "Kristin Hannah",
    coverImage: "https://source.unsplash.com/random/400x600?book,historical",
    price: 25.99,
    discountPercentage: 10,
    onSale: true,
    inStock: false,
    averageRating: 4.6,
    totalReviews: 180,
    publicationDate: "2023-02-28",
    listedDate: "2023-03-05",
    description:
      "An epic novel of love and heroism and hope, set against the backdrop of the Great Depression.",
    genre: "Historical Fiction",
    salesCount: 1050,
  },
  {
    id: 6,
    title: "The Psychology of Money",
    author: "Morgan Housel",
    coverImage: "https://source.unsplash.com/random/400x600?book,finance",
    price: 18.99,
    discountPercentage: 0,
    onSale: false,
    inStock: true,
    averageRating: 4.7,
    totalReviews: 210,
    publicationDate: "2023-01-15",
    listedDate: "2023-01-20",
    description: "Timeless lessons on wealth, greed, and happiness.",
    genre: "Finance",
    salesCount: 1800,
  },
  {
    id: 7,
    title: "Where the Crawdads Sing",
    author: "Delia Owens",
    coverImage: "https://source.unsplash.com/random/400x600?book,novel",
    price: 23.99,
    discountPercentage: 15,
    onSale: true,
    inStock: true,
    averageRating: 4.4,
    totalReviews: 320,
    publicationDate: "2023-05-01",
    listedDate: "2023-05-05",
    description:
      "A painfully beautiful first novel that is at once a murder mystery, a coming-of-age narrative and a celebration of nature.",
    genre: "Fiction",
    salesCount: 2200,
  },
  {
    id: 8,
    title: "Educated",
    author: "Tara Westover",
    coverImage: "https://source.unsplash.com/random/400x600?book,memoir",
    price: 21.99,
    discountPercentage: 0,
    onSale: false,
    inStock: true,
    averageRating: 4.5,
    totalReviews: 280,
    publicationDate: "2023-04-20",
    listedDate: "2023-04-25",
    description:
      "A memoir about a girl who, kept out of school, leaves her survivalist family and goes on to earn a PhD from Cambridge University.",
    genre: "Memoir",
    salesCount: 1350,
  },
];

export default HomePage;
