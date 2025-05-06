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

/**
 * Custom hook for managing book details and related functionality
 */
const useBookDetails = (bookId) => {
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);

  useEffect(() => {
    fetchBookDetails();
  }, [bookId]);

  const fetchBookDetails = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/books/${bookId}`);
      if (response.data.success) {
        setBook(response.data.data);
        fetchRelatedBooks(response.data.data);
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
      const response = await axiosInstance.get(
        `/books?author=${encodeURIComponent(currentBook.author)}&pageSize=4`
      );
      if (response.data.success) {
        const filtered = response.data.data.items
          .filter((book) => book.id !== parseInt(bookId))
          .slice(0, 4);
        setRelatedBooks(filtered);
      }
    } catch (err) {
      console.error("Error fetching related books:", err);
    }
  };

  return { book, isLoading, error, relatedBooks };
};

/**
 * Custom hook for managing whitelist functionality
 */
const useWhitelistManagement = (bookId, isAuthenticated) => {
  const [isInWhitelist, setIsInWhitelist] = useState(false);
  const { checkBookInWhitelist, addToWhitelist, removeFromWhitelist } = useWhitelist();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      checkWhitelistStatus();
    }
  }, [isAuthenticated, bookId]);

  const checkWhitelistStatus = async () => {
    try {
      const response = await axiosInstance.get(`/whitelist/check/${bookId}`);
      if (response.data.success) {
        setIsInWhitelist(response.data.data);
      }
    } catch (err) {
      console.error("Error checking whitelist status:", err);
    }
  };

  const handleToggleWhitelist = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/books/${bookId}` } });
      return;
    }

    try {
      if (isInWhitelist) {
        const whitelistData = await getWhitelistItemId(bookId);
        if (whitelistData) {
          await removeFromWhitelist(whitelistData.id);
          setIsInWhitelist(false);
        }
      } else {
        await addToWhitelist(bookId);
        toast.success("Book added to whitelist");
        setIsInWhitelist(true);
      }
    } catch (err) {
      console.error("Error updating whitelist:", err);
    }
  };

  const getWhitelistItemId = async (bookId) => {
    try {
      const response = await axiosInstance.get("/whitelist");
      if (response.data.success) {
        return response.data.data.items.find((item) => item.bookId === bookId);
      }
      return null;
    } catch (err) {
      console.error("Error fetching whitelist:", err);
      return null;
    }
  };

  return { isInWhitelist, handleToggleWhitelist };
};

/**
 * Component for displaying loading state
 */
const LoadingState = () => (
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

/**
 * Component for displaying error state
 */
const ErrorState = ({ error }) => (
  <div className="min-h-screen bg-gray-50">
    <AnnouncementBanner />
    <Navbar />
    <div className="container mx-auto px-4 py-8">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {error || "Book not found"}
      </div>
      <div className="mt-4">
        <Link to="/books" className="text-red-500 hover:text-red-700 font-medium">
          &larr; Back to Books
        </Link>
      </div>
    </div>
  </div>
);

/**
 * Component for book image gallery
 */
const BookGallery = ({ images, currentIndex, onNext, onPrev }) => {
  const currentImage = images[currentIndex];

  return (
    <div className="relative">
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg">
        <img
          src={currentImage.imageUrl}
          alt={currentImage.caption}
          className="w-full h-full object-cover"
        />
      </div>
      {images.length > 1 && (
        <>
          <button
            onClick={onPrev}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full"
          >
            &larr;
          </button>
          <button
            onClick={onNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full"
          >
            &rarr;
          </button>
        </>
      )}
    </div>
  );
};

/**
 * Component for book details section
 */
const BookDetails = ({ book, quantity, onQuantityChange, onAddToCart, onToggleWhitelist, isInWhitelist }) => {
  const hasDiscount = book?.discountPercentage !== null && book?.discountPercentage > 0;
  const discountedPrice = hasDiscount
    ? (book.price - (book.price * book.discountPercentage) / 100).toFixed(2)
    : null;
  const totalPrice = hasDiscount
    ? (discountedPrice * quantity).toFixed(2)
    : (book.price * quantity).toFixed(2);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
      <p className="text-gray-600">by {book.author}</p>
      
      <div className="flex items-center space-x-4">
        <div className="text-2xl font-bold text-gray-900">
          {hasDiscount ? (
            <>
              <span className="text-red-600">${discountedPrice}</span>
              <span className="text-gray-400 line-through ml-2">${book.price}</span>
            </>
          ) : (
            `$${book.price}`
          )}
        </div>
        {hasDiscount && (
          <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
            {book.discountPercentage}% OFF
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Quantity</label>
          <input
            type="number"
            min="1"
            max={book.stockQuantity}
            value={quantity}
            onChange={onQuantityChange}
            className="mt-1 block w-20 rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
          />
        </div>

        <div className="flex space-x-4">
          <button
            onClick={onAddToCart}
            className="flex-1 bg-red-500 text-white px-6 py-3 rounded-md hover:bg-red-600"
          >
            Add to Cart
          </button>
          <button
            onClick={onToggleWhitelist}
            className={`px-4 py-3 rounded-md ${
              isInWhitelist
                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {isInWhitelist ? "Remove from Wishlist" : "Add to Wishlist"}
          </button>
        </div>
      </div>

      <div className="border-t pt-6">
        <h2 className="text-xl font-semibold mb-4">Description</h2>
        <p className="text-gray-600 whitespace-pre-line">{book.description}</p>
      </div>
    </div>
  );
};

/**
 * Main BookDetailPage component
 */
const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { addToCart } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { book, isLoading, error, relatedBooks } = useBookDetails(id);
  const { isInWhitelist, handleToggleWhitelist } = useWhitelistManagement(id, isAuthenticated);

  if (isLoading) return <LoadingState />;
  if (error || !book) return <ErrorState error={error} />;

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= book.stockQuantity) {
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

  const getAllImages = () => {
    const images = [{ imageUrl: book.imageUrl, caption: book.title }];
    if (book.additionalImages?.length > 0) {
      const sortedAdditionalImages = [...book.additionalImages].sort(
        (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
      );
      images.push(...sortedAdditionalImages);
    }
    return images;
  };

  const allImages = getAllImages();

  return (
    <div className="min-h-screen bg-gray-50">
      <AnnouncementBanner />
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <BookGallery
            images={allImages}
            currentIndex={currentImageIndex}
            onNext={() => setCurrentImageIndex((prev) => (prev + 1) % allImages.length)}
            onPrev={() => setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
          />
          
          <BookDetails
            book={book}
            quantity={quantity}
            onQuantityChange={handleQuantityChange}
            onAddToCart={handleAddToCart}
            onToggleWhitelist={handleToggleWhitelist}
            isInWhitelist={isInWhitelist}
          />
        </div>

        {relatedBooks.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Books</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedBooks.map((book) => (
                <Link
                  key={book.id}
                  to={`/books/${book.id}`}
                  className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <img
                    src={book.imageUrl}
                    alt={book.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900">{book.title}</h3>
                    <p className="text-gray-600 text-sm">{book.author}</p>
                    <p className="text-red-600 font-semibold mt-2">
                      ${book.price.toFixed(2)}
                    </p>
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
