import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import useBookStore from "../../stores/useBookStore";
import BookImage from "./BookImage"; 
import NavBar from "../common/NavBar";
import Footer from "../common/Footer";

const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentBook, getBookById, isLoading, error, clearCurrentBook } =
    useBookStore();

  // State for image gallery
  const [selectedImage, setSelectedImage] = useState(0);
  const [bookImages, setBookImages] = useState([]);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // For debugging
    console.log("Fetching book with ID:", id);
    getBookById(id);

    // Cleanup function to clear current book when component unmounts
    return () => clearCurrentBook();
  }, [id]);

  useEffect(() => {
    if (currentBook) {
      // For debugging
      console.log("Current book data:", currentBook);

      // Get the image URL using our consistent approach
      const getImageUrl = () => {
        if (!currentBook) return null;

        // Check all possible image URL properties
        const possibleProps = [
          "coverImage",
          "ImageUrl",
          "imageUrl",
          "image",
          "Image",
          "cover",
        ];

        for (const prop of possibleProps) {
          if (
            currentBook[prop] &&
            typeof currentBook[prop] === "string" &&
            currentBook[prop].trim() !== ""
          ) {
            console.log(
              `Found image URL in property: ${prop}`,
              currentBook[prop]
            );
            return currentBook[prop];
          }
        }

        return null;
      };

      const coverImage =
        getImageUrl() || "https://placehold.co/400x600?text=Book+Cover";

      setBookImages([
        coverImage,
        "https://placehold.co/400x600/eee/999?text=Inside+View",
        "https://placehold.co/400x600/f5f5f5/777?text=Back+Cover",
        "https://placehold.co/400x600/f9f9f9/555?text=Sample+Page",
      ]);

      setSelectedImage(0);
    }
  }, [currentBook]);

  const handleImageSelect = (index) => {
    setSelectedImage(index);
  };

  const formatEnum = {
    1: "Hardcover",
    2: "Paperback",
    3: "Ebook",
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          onClick={() => navigate("/books")}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Back to Books
        </button>
      </div>
    );
  }

  if (!currentBook) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Book not found
        </div>
        <button
          onClick={() => navigate("/books")}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Back to Books
        </button>
      </div>
    );
  }

  return (
    <>
    <NavBar />

    <div className="container mx-auto px-4 py-8">
      
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-600 mb-6">
        <Link to="/" className="hover:text-red-600 transition">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link to="/books" className="hover:text-red-600 transition">
          Books
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{currentBook.title}</span>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="md:flex">
          {/* Left side - Image gallery */}
          <div className="md:w-2/5 p-6">
            {/* Main image - using our new error handling approach */}
            <div className="border rounded-lg overflow-hidden mb-4 bg-gray-50 h-96 flex items-center justify-center">
              <img
                src={bookImages[selectedImage]}
                alt={`${currentBook.title} - View ${selectedImage + 1}`}
                className="max-w-full max-h-full object-contain"
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  console.error("Failed to load image:", e);
                  // Try to set a fallback or show error state
                  e.target.src =
                    "https://placehold.co/400x600?text=Image+Not+Available";
                }}
              />
            </div>

            {/* Thumbnail images */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {bookImages.map((img, index) => (
                <div
                  key={index}
                  className={`border cursor-pointer h-24 w-20 flex-shrink-0 overflow-hidden ${
                    selectedImage === index
                      ? "border-red-500"
                      : "border-gray-200"
                  }`}
                  onClick={() => handleImageSelect(index)}
                >
                  <img
                    src={img}
                    alt={`${currentBook.title} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://placehold.co/160x240?text=Thumbnail";
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Book details */}
          <div className="md:w-3/5 p-6 border-t md:border-t-0 md:border-l border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {currentBook.title}
            </h1>

            <div className="flex items-center mb-4">
              <span className="text-gray-600 mr-2">By</span>
              <span className="font-medium text-red-600">
                {currentBook.author}
              </span>
            </div>

            <div className="mb-6">
              <div className="flex items-center mb-2">
                <span className="text-yellow-400">★★★★</span>
                <span className="text-gray-400">★</span>
                <span className="text-gray-600 ml-2">(4.0 - 24 reviews)</span>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <span className="mr-4">
                  {formatEnum[currentBook.format] || "Unknown format"}
                </span>
                <span className="mr-4">{currentBook.language}</span>
                <span className="mr-4">{currentBook.pageCount} pages</span>
                <span>ISBN: {currentBook.isbn}</span>
              </div>
            </div>

            {/* Rest of the component remains the same */}
            {/* Price information */}
            <div className="mb-6">
              <div className="text-3xl font-bold text-red-600 mb-2">
                ${parseFloat(currentBook.price).toFixed(2)}
              </div>

              {currentBook.discount > 0 && (
                <div className="flex items-center">
                  <span className="text-gray-500 line-through mr-2">
                    $
                    {parseFloat(
                      currentBook.price * (1 + currentBook.discount / 100)
                    ).toFixed(2)}
                  </span>
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-sm font-medium">
                    Save {currentBook.discount}%
                  </span>
                </div>
              )}
            </div>

            {/* Book description */}
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Description
              </h2>
              <div className="text-gray-700 mb-4">
                {currentBook.description}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-900">Publisher:</span>{" "}
                  {currentBook.publisher}
                </div>
                <div>
                  <span className="font-medium text-gray-900">
                    Publication Date:
                  </span>{" "}
                  {new Date(currentBook.publicationDate).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium text-gray-900">Genre:</span>{" "}
                  {currentBook.genre}
                </div>
                <div>
                  <span className="font-medium text-gray-900">Language:</span>{" "}
                  {currentBook.language}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
                </svg>
                Add to Cart
              </button>

              <button className="border border-red-600 text-red-600 px-6 py-3 rounded-lg hover:bg-red-50 transition flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
                Add to Wishlist
              </button>
            </div>
          </div>
        </div>

        {/* Additional book details tabs */}
        <div className="border-t border-gray-200">
          <div className="flex border-b border-gray-200">
            <button className="px-6 py-3 border-b-2 border-red-600 text-red-600 font-medium">
              Details
            </button>
            <button className="px-6 py-3 text-gray-600 hover:text-red-600 transition">
              Reviews
            </button>
            <button className="px-6 py-3 text-gray-600 hover:text-red-600 transition">
              Related Books
            </button>
          </div>

          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Book Details
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-lg mb-2">Synopsis</h4>
                <p className="text-gray-700">{currentBook.description}</p>
              </div>

              <div>
                <h4 className="font-bold text-lg mb-2">About the Author</h4>
                <p className="text-gray-700">
                  {currentBook.authorBio ||
                    `${currentBook.author} is a renowned author known for creating captivating stories that engage readers from all walks of life.`}
                </p>
              </div>
            </div>

            {/* Book specifications */}
            <div className="mt-8">
              <h4 className="font-bold text-lg mb-4">Specifications</h4>

              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <tbody className="divide-y divide-gray-200">
                    <tr className="bg-white">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-1/3">
                        Title
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {currentBook.title}
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Author
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {currentBook.author}
                      </td>
                    </tr>
                    <tr className="bg-white">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ISBN
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {currentBook.isbn}
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Format
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatEnum[currentBook.format] || "Unknown format"}
                      </td>
                    </tr>
                    <tr className="bg-white">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Language
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {currentBook.language}
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Publication Date
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {new Date(
                          currentBook.publicationDate
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                    <tr className="bg-white">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Publisher
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {currentBook.publisher}
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Page Count
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {currentBook.pageCount}
                      </td>
                    </tr>
                    <tr className="bg-white">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Genre
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {currentBook.genre}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Book recommendations */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">You might also like</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {/* This would be populated with real related books data */}
          {[1, 2, 3, 4, 5].map((num) => (
            <div
              key={num}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition group"
            >
              <div className="h-64 bg-gray-200 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                  Related Book {num}
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-lg mb-1 text-gray-800">
                  Similar Book Title
                </h3>
                <p className="text-gray-600 mb-2">Author Name</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-red-600">$19.99</span>
                  <span className="text-sm text-gray-500">Hardcover</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default BookDetailPage;
