// src/pages/BookDetailPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import AnnouncementBanner from "../../components/common/AnnouncementBanner";
import Navbar from "../../components/common/NavBar";
import useAuthStore from "../../stores/useAuthStore";
import useCartStore from "../../stores/useCartStore";
import useWhitelist from "../../stores/useWhitelist";
import axiosInstance from "../../utils/axiosInstance";

const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const { checkBookInWhitelist, addToWhitelist, removeFromWhitelist } =
    useWhitelist();
  const [isInWhitelist, setIsInWhitelist] = useState(false);
  const { addToCart } = useCartStore();

  // Add this to your useEffect that fetches book details:
  useEffect(() => {
    const checkWhitelistStatus = async () => {
      if (isAuthenticated && book) {
        const isBookmarked = await checkBookInWhitelist(book.id);
        setIsInWhitelist(isBookmarked);
      }
    };

    checkWhitelistStatus();
  }, [book, isAuthenticated, checkBookInWhitelist]);

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  const fetchBookDetails = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/books/${id}`);
      if (response.data.success) {
        setBook(response.data.data);
        setCurrentImageIndex(0); // Reset to main image when book changes

        // Fetch related books by same author or genre
        fetchRelatedBooks(response.data.data);

        // If authenticated, check if book is in whitelist
        if (isAuthenticated) {
          checkWhitelistStatus();
        }
      }
    } catch (err) {
      console.error("Error fetching book details:", err);
      setError("Failed to load book details. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRelatedBooks = async (currentBook) => {
    try {
      // Fetch books by same author or genre, but not the current book
      const response = await axiosInstance.get(
        `/books?author=${encodeURIComponent(currentBook.author)}&pageSize=4`
      );
      if (response.data.success) {
        // Filter out the current book and limit to 4 related books
        const filtered = response.data.data.items
          .filter((book) => book.id !== parseInt(id))
          .slice(0, 4);
        setRelatedBooks(filtered);
      }
    } catch (err) {
      console.error("Error fetching related books:", err);
    }
  };

  const checkWhitelistStatus = async () => {
    try {
      const response = await axiosInstance.get(`/whitelist/check/${id}`);
      if (response.data.success) {
        setIsInWhitelist(response.data.data);
      }
    } catch (err) {
      console.error("Error checking whitelist status:", err);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (book?.stockQuantity || 10)) {
      setQuantity(value);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/books/${id}` } });
      return;
    }

    try {
      const result = await addToCart(book.id, quantity);
      if (result) {
        toast.success(`Added ${quantity} copy(s) of "${book.title}" to cart`);
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error("Failed to add book to cart");
    }
  };

  const handleToggleWhitelist = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/books/${id}` } });
      return;
    }

    try {
      if (isInWhitelist) {
        const whitelistData = await getWhitelistItemId(book.id);
        if (whitelistData) {
          await removeFromWhitelist(whitelistData.id);
          setIsInWhitelist(false);
        }
      } else {
        const result = await addToWhitelist(book.id);
        console.log("Whitelist result:", result);

        toast.success("Book added to whitelist");
        setIsInWhitelist(true);
      }
    } catch (err) {
      console.error("Error updating whitelist:", err);
    }
  };

  // Helper function to get whitelist item ID
  const getWhitelistItemId = async (bookId) => {
    try {
      const response = await axiosInstance.get("/whitelist");
      if (response.data.success) {
        const item = response.data.data.items.find(
          (item) => item.bookId === bookId
        );
        return item;
      }
      return null;
    } catch (err) {
      console.error("Error fetching whitelist:", err);
      return null;
    }
  };

  // Get all book images (main image + additional images)
  const getAllImages = () => {
    if (!book) return [];

    const images = [{ imageUrl: book.imageUrl, caption: book.title }]; // Main image

    if (book.additionalImages && book.additionalImages.length > 0) {
      // Sort additional images by display order if available
      const sortedAdditionalImages = [...book.additionalImages].sort(
        (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
      );

      images.push(...sortedAdditionalImages);
    }

    return images;
  };

  const nextImage = () => {
    const images = getAllImages();
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    const images = getAllImages();
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  // Calculate discounted price if applicable
  const hasDiscount =
    book?.discountPercentage !== null && book?.discountPercentage > 0;
  const discountedPrice = hasDiscount
    ? (book.price - (book.price * book.discountPercentage) / 100).toFixed(2)
    : null;
  const totalPrice = hasDiscount
    ? (discountedPrice * quantity).toFixed(2)
    : book
    ? (book.price * quantity).toFixed(2)
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AnnouncementBanner />
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AnnouncementBanner />
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error || "Book not found"}
          </div>
          <div className="mt-4">
            <Link
              to="/books"
              className="text-red-500 hover:text-red-700 font-medium"
            >
              &larr; Back to Books
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const allImages = getAllImages();
  const currentImage = allImages[currentImageIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      <AnnouncementBanner />
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="mb-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link to="/" className="text-gray-600 hover:text-red-500">
                  Home
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <Link
                    to="/books"
                    className="ml-1 text-gray-600 hover:text-red-500 md:ml-2"
                  >
                    Books
                  </Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span className="ml-1 text-gray-500 md:ml-2 line-clamp-1">
                    {book.title}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Book Image Gallery */}
              <div className="md:w-1/3 lg:w-1/4">
                <div className="relative">
                  {book.onSale && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 font-bold text-sm z-10">
                      ON SALE
                    </div>
                  )}

                  {/* Main Image */}
                  <div className="relative aspect-[2/3] overflow-hidden rounded-md shadow-md">
                    <img
                      src={
                        currentImage?.imageUrl ||
                        "https://via.placeholder.com/400x600?text=No+Image"
                      }
                      alt={currentImage?.caption || book.title}
                      className="w-full h-full object-cover"
                    />

                    {/* Navigation arrows - only if multiple images */}
                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 p-2 rounded-full shadow-md hover:bg-opacity-100"
                          aria-label="Previous image"
                        >
                          <svg
                            className="w-5 h-5 text-gray-800"
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
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 p-2 rounded-full shadow-md hover:bg-opacity-100"
                          aria-label="Next image"
                        >
                          <svg
                            className="w-5 h-5 text-gray-800"
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
                      </>
                    )}
                  </div>

                  {/* Thumbnail navigation - only if multiple images */}
                  {allImages.length > 1 && (
                    <div className="mt-4 flex overflow-x-auto gap-2 py-2">
                      {allImages.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden focus:outline-none ${
                            index === currentImageIndex
                              ? "border-red-500"
                              : "border-gray-200"
                          }`}
                          aria-label={`View image ${index + 1}`}
                        >
                          <img
                            src={
                              image.imageUrl ||
                              "https://via.placeholder.com/100x100?text=No+Image"
                            }
                            alt={image.caption || `Book image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Image caption - if available */}
                  {currentImage?.caption && currentImageIndex > 0 && (
                    <div className="mt-2 text-sm text-gray-600 text-center">
                      {currentImage.caption}
                    </div>
                  )}
                </div>
              </div>

              {/* Book Details */}
              <div className="md:w-2/3 lg:w-3/4">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {book.title}
                </h1>
                <p className="text-xl text-gray-700 mb-4">by {book.author}</p>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.round(book.rating)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-gray-600">
                    {book.rating.toFixed(1)} (
                    {book.rating ? "Based on reviews" : "No reviews yet"})
                  </span>
                </div>

                {/* Price and discount information */}
                <div className="mb-4">
                  {hasDiscount ? (
                    <div className="flex items-center">
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <span className="text-gray-500 line-through text-lg mr-2">
                            ${book.price.toFixed(2)}
                          </span>
                          <span className="text-red-600 font-bold text-2xl">
                            ${discountedPrice}
                          </span>
                        </div>
                        <div className="text-sm text-green-600 font-semibold mt-1">
                          Save {book.discountPercentage}% -{" "}
                          {book.onSale ? "ON SALE!" : "Limited Time Offer"}
                        </div>
                        {book.discountEndDate && (
                          <div className="text-sm text-gray-600 mt-1">
                            Offer ends{" "}
                            {new Date(
                              book.discountEndDate
                            ).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xl font-semibold">
                      ${book.price.toFixed(2)}
                    </div>
                  )}
                </div>

                {/* Rest of your existing code remains the same */}
                {/* Availability */}
                <div className="mb-4">
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full ${
                      book.stockQuantity > 0
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {book.stockQuantity > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </div>

                {/* Book details */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-gray-600">
                      <span className="font-semibold">Publisher:</span>{" "}
                      {book.publisher}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Publication Date:</span>{" "}
                      {new Date(book.publicationDate).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">ISBN:</span> {book.isbn}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">
                      <span className="font-semibold">Language:</span>{" "}
                      {book.language}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Format:</span>{" "}
                      {book.format}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Genre:</span> {book.genre}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex items-center">
                    <label htmlFor="quantity" className="mr-2 text-gray-700">
                      Quantity:
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      value={quantity}
                      onChange={handleQuantityChange}
                      min="1"
                      max={book.stockQuantity}
                      className="w-16 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </div>

                  <div className="flex flex-1 gap-2">
                    <button
                      onClick={handleAddToCart}
                      disabled={book.stockQuantity <= 0}
                      className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md ${
                        book.stockQuantity > 0
                          ? "bg-red-500 text-white hover:bg-red-600"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                        ></path>
                      </svg>
                      {book.stockQuantity > 0 ? "Add to Cart" : "Out of Stock"}
                    </button>

                    <button
                      onClick={handleToggleWhitelist}
                      className={`px-4 py-2 border rounded-md ${
                        isInWhitelist
                          ? "bg-red-100 text-red-700 border-red-300 hover:bg-red-200"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      <svg
                        className={`w-5 h-5 ${
                          isInWhitelist ? "text-red-500" : "text-gray-500"
                        }`}
                        fill={isInWhitelist ? "currentColor" : "none"}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Total */}
                {book.stockQuantity > 0 && quantity > 0 && (
                  <div className="bg-gray-100 p-4 rounded-md">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Total:</span>
                      <span className="text-xl font-bold text-gray-900">
                        ${totalPrice}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Description
              </h2>
              <div className="prose max-w-none">
                <p className="text-gray-700">{book.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Books */}
        {relatedBooks.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              More Books by {book.author}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedBooks.map((relatedBook) => (
                <Link to={`/books/${relatedBook.id}`} key={relatedBook.id}>
                  <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg h-full flex flex-col">
                    <div className="relative h-56">
                      {relatedBook.onSale && (
                        <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 font-bold text-sm z-10">
                          ON SALE
                        </div>
                      )}
                      <img
                        src={
                          relatedBook.imageUrl ||
                          "https://via.placeholder.com/300x450?text=No+Image"
                        }
                        alt={relatedBook.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="text-lg font-semibold line-clamp-2">
                        {relatedBook.title}
                      </h3>

                      <div className="mt-auto">
                        {relatedBook.discountPercentage ? (
                          <div className="flex items-center">
                            <span className="text-gray-500 line-through text-sm mr-2">
                              ${relatedBook.price.toFixed(2)}
                            </span>
                            <span className="text-red-600 font-bold">
                              $
                              {(
                                relatedBook.price -
                                (relatedBook.price *
                                  relatedBook.discountPercentage) /
                                  100
                              ).toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-semibold">
                            ${relatedBook.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetailPage;
