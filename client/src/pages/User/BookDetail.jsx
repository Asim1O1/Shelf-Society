// src/pages/BookDetailPage.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import AnnouncementBanner from "../../components/common/AnnouncementBanner";
import Navbar from "../../components/common/NavBar";
import StarRating from "../../components/Reviews/StarRating";
import useAuthStore from "../../stores/useAuthStore";
import useCartStore from "../../stores/useCartStore";
import useReviewStore from "../../stores/useReviewStore";
import useWhitelist from "../../stores/useWhitelist";
import axiosInstance from "../../utils/axiosInstance";

import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  Shield,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import ReviewForm from "../../components/Reviews/ReviewForm";
import ToastUtility from "../../utils/ToastUtility";

// Generic Confirmation Modal Component
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  confirmClass = "bg-red-600 hover:bg-red-700",
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex space-x-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg border border-gray-300 hover:border-gray-400 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-white font-medium rounded-lg transition-colors disabled:opacity-50 ${confirmClass}`}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [activeTab, setActiveTab] = useState("description");
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const { checkBookInWhitelist, addToWhitelist, removeFromWhitelist } =
    useWhitelist();
  const [isInWhitelist, setIsInWhitelist] = useState(false);
  const { addToCart } = useCartStore();

  // Review state and hooks
  const {
    bookReviews,
    getBookReviews,
    createReview,
    updateReview,
    deleteReview,
    isLoading: reviewsLoading,
  } = useReviewStore();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    reviewId: null,
  });
  const [reviewsToShow, setReviewsToShow] = useState(2);

  // Confirmation Modals State
  const [wishlistModal, setWishlistModal] = useState({
    isOpen: false,
    action: null, // 'add' or 'remove'
  });
  const [reviewDeleteModal, setReviewDeleteModal] = useState({
    isOpen: false,
    reviewId: null,
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchBookDetails();
    getBookReviews(id);
  }, [id]);

  useEffect(() => {
    const checkWhitelistStatus = async () => {
      if (isAuthenticated && book) {
        try {
          const isBookmarked = await checkBookInWhitelist(book.id);
          setIsInWhitelist(isBookmarked);
        } catch (err) {
          console.error("Error checking whitelist status:", err);
        }
      }
    };
    checkWhitelistStatus();
  }, [book, isAuthenticated, checkBookInWhitelist]);

  const fetchBookDetails = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/books/${id}`);
      if (response.data.success) {
        setBook(response.data.data);
        setCurrentImageIndex(0);
        fetchRelatedBooks(response.data.data);
        ToastUtility.success("Book details loaded successfully");
      }
    } catch (err) {
      console.error("Error fetching book details:", err);
      setError("Failed to load book details. Please try again later.");
      ToastUtility.error("Failed to load book details");
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
          .filter((book) => book.id !== parseInt(id))
          .slice(0, 4);
        setRelatedBooks(filtered);
      }
    } catch (err) {
      console.error("Error fetching related books:", err);
      ToastUtility.error("Failed to load related books");
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

    setIsAddingToCart(true);
    try {
      const result = await addToCart(book.id, quantity);
      console.log("thE RESULT IS", result);
      if (result) {
        ToastUtility.success(
          `Added ${quantity} copy(s) of "${book.title}" to cart`
        );
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      ToastUtility.error(err.message || "Failed to add book to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleWhitelistClick = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/books/${id}` } });
      return;
    }
    setWishlistModal({
      isOpen: true,
      action: isInWhitelist ? "remove" : "add",
    });
  };

  const confirmToggleWhitelist = async () => {
    setActionLoading(true);
    try {
      if (isInWhitelist) {
        const whitelistData = await getWhitelistItemId(book.id);
        if (whitelistData) {
          await removeFromWhitelist(whitelistData.id);
          setIsInWhitelist(false);
          ToastUtility.success("Removed from wishlist");
        }
      } else {
        await addToWhitelist(book.id);
        setIsInWhitelist(true);
        ToastUtility.success("Added to wishlist");
      }
      setWishlistModal({ isOpen: false, action: null });
    } catch (err) {
      console.error("Error updating wishlist:", err);
      ToastUtility.error(err.message || "Failed to update wishlist");
    } finally {
      setActionLoading(false);
    }
  };

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
      throw new Error("Failed to fetch wishlist data");
    }
  };

  const getAllImages = () => {
    if (!book) return [];
    const images = [{ imageUrl: book.imageUrl, caption: book.title }];
    if (book.additionalImages && book.additionalImages.length > 0) {
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

  // Review functions
  const handleWriteReviewClick = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/books/${id}` } });
      return;
    }
    setShowReviewForm(true);
    setEditingReview(null);
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      let result;
      if (editingReview) {
        result = await updateReview(editingReview.id, reviewData);
        console.log("The result is", result);
      } else {
        result = await createReview(reviewData);
      }

      if (result.success) {
        setShowReviewForm(false);
        setEditingReview(null);
        ToastUtility.success(
          editingReview
            ? "Review updated successfully"
            : "Review submitted successfully"
        );
      } else {
        ToastUtility.error("Failed to submit review");
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      ToastUtility.error(err.message || "Failed to submit review");
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleDeleteClick = (reviewId) => {
    setReviewDeleteModal({ isOpen: true, reviewId });
  };

  const confirmDeleteReview = async () => {
    try {
      const result = await deleteReview(reviewDeleteModal.reviewId);
      if (result.success) {
        ToastUtility.success("Review deleted successfully");
      } else {
        ToastUtility.error("Failed to delete review");
      }
    } catch (err) {
      console.error("Error deleting review:", err);
      ToastUtility.error(err.message || "Failed to delete review");
    } finally {
      setReviewDeleteModal({ isOpen: false, reviewId: null });
    }
  };

  const hasUserReviewed = bookReviews?.reviews?.some(
    (review) => isAuthenticated && user?.id === review.userId
  );
  const canReview = isAuthenticated && !hasUserReviewed;

  // Helper function to check if current user owns a review
  const isUserReview = (review) => {
    if (!isAuthenticated || !user || !user.id || !review.userId) {
      return false;
    }
    // Convert both to strings for comparison to avoid type mismatch
    return String(user.id) === String(review.userId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AnnouncementBanner />
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3">
                <div className="aspect-[2/3] bg-gray-200 rounded-lg"></div>
              </div>
              <div className="md:w-2/3 space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-10 bg-gray-200 rounded w-1/4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
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
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
              <BookOpen className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {error || "Book not found"}
            </h2>
            <p className="text-gray-600 mb-6">
              The book you're looking for might have been removed or is
              unavailable.
            </p>
            <Link
              to="/books"
              className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Back to Books
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
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link
                to="/"
                className="text-gray-600 hover:text-red-600 transition-colors"
              >
                Home
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="w-5 h-5 text-gray-400" />
                <Link
                  to="/books"
                  className="ml-1 text-gray-600 hover:text-red-600 md:ml-2 transition-colors"
                >
                  Books
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRight className="w-5 h-5 text-gray-400" />
                <span className="ml-1 text-gray-800 font-medium md:ml-2 line-clamp-1">
                  {book.title}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Image Gallery - FIXED SIZE */}
              <div className="flex justify-center md:justify-start">
                <div className="w-64 md:w-72 lg:w-80">
                  <div className="relative group">
                    {/* Main Image */}
                    <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-gray-100">
                      {book.onSale && (
                        <div className="absolute top-3 left-3 z-10">
                          <span className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full shadow-md">
                            ON SALE
                          </span>
                        </div>
                      )}

                      <img
                        src={
                          currentImage?.imageUrl ||
                          "https://via.placeholder.com/320x480?text=No+Image"
                        }
                        alt={currentImage?.caption || book.title}
                        className="w-full h-full object-cover"
                      />

                      {/* Navigation arrows */}
                      {allImages.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                            aria-label="Previous image"
                          >
                            <ChevronLeft className="w-5 h-5 text-gray-800" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                            aria-label="Next image"
                          >
                            <ChevronRight className="w-5 h-5 text-gray-800" />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Thumbnail navigation */}
                    {allImages.length > 1 && (
                      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                        {allImages.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`relative flex-shrink-0 w-16 h-24 rounded-lg overflow-hidden transition-all ${
                              index === currentImageIndex
                                ? "ring-2 ring-red-600 shadow-md"
                                : "ring-1 ring-gray-200 hover:ring-gray-300"
                            }`}
                          >
                            <img
                              src={
                                image.imageUrl ||
                                "https://via.placeholder.com/80x120?text=No+Image"
                              }
                              alt={image.caption || `Book image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Book Details */}
              <div>
                <div className="space-y-6">
                  {/* Title & Author */}
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                      {book.title}
                    </h1>
                    <p className="text-xl text-gray-700">by {book.author}</p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <StarRating
                        rating={book.averageRating || 0}
                        size="large"
                      />
                      <span className="ml-3 text-lg font-medium text-gray-700">
                        {bookReviews?.averageRating
                          ? bookReviews.averageRating.toFixed(1)
                          : "No rating"}
                      </span>
                    </div>
                    <span className="text-gray-500">|</span>
                    <span className="text-gray-600">
                      {bookReviews?.reviewCount || 0}{" "}
                      {bookReviews?.reviewCount === 1 ? "review" : "reviews"}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    {hasDiscount ? (
                      <div>
                        <div className="flex items-baseline gap-3">
                          <span className="text-3xl font-bold text-red-600">
                            ${discountedPrice}
                          </span>
                          <span className="text-xl text-gray-500 line-through">
                            ${book.price.toFixed(2)}
                          </span>
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                            Save {book.discountPercentage}%
                          </span>
                        </div>
                        {book.discountEndDate && (
                          <p className="text-sm text-orange-600 mt-2">
                            <Clock className="w-4 h-4 inline mr-1" />
                            Offer ends{" "}
                            {new Date(
                              book.discountEndDate
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-3xl font-bold text-gray-900">
                        ${book.price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <label
                        htmlFor="quantity"
                        className="text-gray-700 font-medium"
                      >
                        Quantity:
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id="quantity"
                          value={quantity}
                          onChange={handleQuantityChange}
                          min="1"
                          max={book.stockQuantity}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-center"
                        />
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          book.stockQuantity > 0
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {book.stockQuantity > 0
                          ? `${book.stockQuantity} in stock`
                          : "Out of stock"}
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleAddToCart}
                        disabled={book.stockQuantity <= 0 || isAddingToCart}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                          book.stockQuantity > 0 && !isAddingToCart
                            ? "bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl"
                            : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        <ShoppingCart className="w-5 h-5" />
                        {isAddingToCart
                          ? "Adding to Cart..."
                          : book.stockQuantity > 0
                          ? "Add to Cart"
                          : "Out of Stock"}
                      </button>

                      <button
                        onClick={handleToggleWhitelistClick}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                          isInWhitelist
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-white text-gray-700 border-2 border-gray-300 hover:border-red-300 hover:text-red-600"
                        }`}
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            isInWhitelist ? "fill-current" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {/* Total */}
                    {book.stockQuantity > 0 && quantity > 0 && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 font-medium">
                            Total ({quantity} items):
                          </span>
                          <span className="text-2xl font-bold text-blue-900">
                            ${totalPrice}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                    <div className="text-center">
                      <Truck className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Free Shipping</p>
                    </div>
                    <div className="text-center">
                      <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Secure Payment</p>
                    </div>
                    <div className="text-center">
                      <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Fast Delivery</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-12">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex gap-8">
                  {["description", "details", "reviews"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                        activeTab === tab
                          ? "border-red-500 text-red-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="mt-8">
                {activeTab === "description" && (
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      {book.description}
                    </p>
                  </div>
                )}

                {activeTab === "details" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium text-gray-600">
                          Publisher
                        </span>
                        <span className="text-gray-800">{book.publisher}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium text-gray-600">
                          Publication Date
                        </span>
                        <span className="text-gray-800">
                          {new Date(book.publicationDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium text-gray-600">ISBN</span>
                        <span className="text-gray-800">{book.isbn}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium text-gray-600">
                          Language
                        </span>
                        <span className="text-gray-800">{book.language}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium text-gray-600">
                          Format
                        </span>
                        <span className="text-gray-800">{book.format}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium text-gray-600">Genre</span>
                        <span className="text-gray-800">{book.genre}</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div>
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900">
                        Customer Reviews
                      </h3>
                      <div className="flex gap-3">
                        {!showReviewForm && (
                          <>
                            {canReview ? (
                              <button
                                onClick={handleWriteReviewClick}
                                className="inline-flex items-center px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                              >
                                <Star className="w-5 h-5 mr-2" />
                                Write a Review
                              </button>
                            ) : (
                              <>
                                {!isAuthenticated ? (
                                  <button
                                    onClick={handleWriteReviewClick}
                                    className="inline-flex items-center px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                  >
                                    <Star className="w-5 h-5 mr-2" />
                                    Sign in to Review
                                  </button>
                                ) : (
                                  hasUserReviewed && (
                                    <span className="text-gray-600 italic">
                                      You've already reviewed this book
                                    </span>
                                  )
                                )}
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Review Summary */}
                    {bookReviews && bookReviews.reviewCount > 0 && (
                      <div className="bg-gray-50 rounded-xl p-6 mb-8">
                        <div className="flex items-start gap-8">
                          <div className="text-center">
                            <div className="text-5xl font-bold text-gray-900">
                              {bookReviews.averageRating.toFixed(1)}
                            </div>
                            <StarRating
                              rating={bookReviews.averageRating}
                              size="large"
                            />
                            <p className="text-gray-600 mt-2">
                              {bookReviews.reviewCount}{" "}
                              {bookReviews.reviewCount === 1
                                ? "review"
                                : "reviews"}
                            </p>
                          </div>

                          <div className="flex-1">
                            {[5, 4, 3, 2, 1].map((star) => {
                              const reviewsWithThisRating =
                                bookReviews.reviews.filter(
                                  (r) => Math.round(r.rating) === star
                                ).length;
                              const percentage =
                                bookReviews.reviewCount > 0
                                  ? Math.round(
                                      (reviewsWithThisRating /
                                        bookReviews.reviewCount) *
                                        100
                                    )
                                  : 0;

                              return (
                                <div
                                  key={star}
                                  className="flex items-center gap-2 mb-2"
                                >
                                  <div className="w-12 text-sm text-gray-600">
                                    {star} star
                                  </div>
                                  <div className="flex-1">
                                    <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                                      <div
                                        className="bg-yellow-400 h-full transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                  <div className="w-10 text-sm text-gray-600 text-right">
                                    {percentage}%
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Review Form */}
                    {showReviewForm && (
                      <div className="mb-8 bg-gray-50 p-6 rounded-xl">
                        <ReviewForm
                          bookId={book.id}
                          bookTitle={book.title}
                          initialData={editingReview}
                          onSubmit={handleSubmitReview}
                          onCancel={() => {
                            setShowReviewForm(false);
                            setEditingReview(null);
                          }}
                          isLoading={reviewsLoading}
                        />
                      </div>
                    )}

                    {/* Review List */}
                    {bookReviews?.reviews?.length > 0 ? (
                      <div className="space-y-6">
                        {bookReviews.reviews
                          .slice(0, reviewsToShow)
                          .map((review) => (
                            <div
                              key={review.id}
                              className="bg-white rounded-lg p-6 border border-gray-200"
                            >
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h4 className="font-semibold text-gray-900">
                                    {review.userName}
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    {new Date(
                                      review.createdAt
                                    ).toLocaleDateString()}
                                  </p>
                                  <StarRating
                                    rating={review.rating}
                                    size="small"
                                  />
                                </div>

                                {isUserReview(review) && (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleEditReview(review)}
                                      className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                      <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                        />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteClick(review.id)
                                      }
                                      className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                    >
                                      <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                      </svg>
                                    </button>
                                  </div>
                                )}
                              </div>

                              <p className="text-gray-700 leading-relaxed">
                                {review.comment}
                              </p>
                            </div>
                          ))}

                        {bookReviews.reviews.length > reviewsToShow && (
                          <div className="text-center">
                            <button
                              onClick={() =>
                                setReviewsToShow((prev) => prev + 5)
                              }
                              className="text-red-600 hover:text-red-700 font-medium"
                            >
                              Show More Reviews
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                          <Star className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-lg mb-4">
                          No reviews yet for this book
                        </p>
                        {!showReviewForm && (
                          <>
                            {canReview ? (
                              <button
                                onClick={handleWriteReviewClick}
                                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                              >
                                Be the First to Review
                              </button>
                            ) : (
                              <>
                                {!isAuthenticated ? (
                                  <button
                                    onClick={handleWriteReviewClick}
                                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                  >
                                    Sign in to Write First Review
                                  </button>
                                ) : (
                                  hasUserReviewed && (
                                    <p className="text-gray-600 italic">
                                      You've already reviewed this book
                                    </p>
                                  )
                                )}
                              </>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Books */}
        {relatedBooks.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              More Books by {book.author}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedBooks.map((relatedBook) => (
                <Link to={`/books/${relatedBook.id}`} key={relatedBook.id}>
                  <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
                    <div className="relative aspect-[2/3] overflow-hidden">
                      {relatedBook.onSale && (
                        <div className="absolute top-3 left-3 z-10">
                          <span className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full shadow-lg">
                            ON SALE
                          </span>
                        </div>
                      )}
                      <img
                        src={
                          relatedBook.imageUrl ||
                          "https://via.placeholder.com/300x450?text=No+Image"
                        }
                        alt={relatedBook.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-red-600 transition-colors">
                        {relatedBook.title}
                      </h3>
                      <div className="mt-auto">
                        {relatedBook.discountPercentage ? (
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-red-600">
                              $
                              {(
                                relatedBook.price -
                                (relatedBook.price *
                                  relatedBook.discountPercentage) /
                                  100
                              ).toFixed(2)}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              ${relatedBook.price.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xl font-bold text-gray-900">
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

      {/* Wishlist Confirmation Modal */}
      <ConfirmationModal
        isOpen={wishlistModal.isOpen}
        onClose={() => setWishlistModal({ isOpen: false, action: null })}
        onConfirm={confirmToggleWhitelist}
        title={
          wishlistModal.action === "add"
            ? "Add to Wishlist"
            : "Remove from Wishlist"
        }
        message={
          wishlistModal.action === "add"
            ? `Add "${book.title}" to your wishlist?`
            : `Remove "${book.title}" from your wishlist?`
        }
        confirmText={
          wishlistModal.action === "add"
            ? "Add to Wishlist"
            : "Remove from Wishlist"
        }
        confirmClass="bg-red-600 hover:bg-red-700"
        isLoading={actionLoading}
      />

      {/* Delete Review Confirmation Modal */}
      <ConfirmationModal
        isOpen={reviewDeleteModal.isOpen}
        onClose={() => setReviewDeleteModal({ isOpen: false, reviewId: null })}
        onConfirm={confirmDeleteReview}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmText="Delete Review"
        confirmClass="bg-red-600 hover:bg-red-700"
        isLoading={reviewsLoading}
      />
    </div>
  );
};

export default BookDetailPage;
