import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import BookReviewSummary from "../../components/Reviews/BookReviewSummary";
import ConfirmDeleteModal from "../../components/Reviews/ConfirmDeleteModal";
import ReviewForm from "../../components/Reviews/ReviewForm";
import ReviewList from "../../components/Reviews/ReviewList";
import useAuthStore from "../../stores/useAuthStore";
import useReviewStore from "../../stores/useReviewStore";

const BookReviewsPage = () => {
  const { bookId } = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const {
    bookReviews,
    getBookReviews,
    createReview,
    updateReview,
    deleteReview,
    isLoading,
    error,
    clearError,
  } = useReviewStore();

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    reviewId: null,
  });

  useEffect(() => {
    // Fetch book reviews when component mounts
    getBookReviews(bookId);

    // Clear error state when component unmounts
    return () => clearError();
  }, [bookId]);

  // Show error messages
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleWriteReviewClick = () => {
    if (!isAuthenticated) {
      toast.info("Please sign in to write a review");
      return;
    }
    setShowReviewForm(true);
    setEditingReview(null);
  };

  const handleSubmitReview = async (reviewData) => {
    let result;

    if (editingReview) {
      result = await updateReview(editingReview.id, reviewData);
    } else {
      result = await createReview(reviewData);
    }

    if (result.success) {
      setShowReviewForm(false);
      setEditingReview(null);
      toast.success(
        editingReview
          ? "Review updated successfully"
          : "Review submitted successfully"
      );
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleDeleteClick = (reviewId) => {
    setDeleteModal({ isOpen: true, reviewId });
  };

  const confirmDelete = async () => {
    const result = await deleteReview(deleteModal.reviewId);
    if (result.success) {
      toast.success("Review deleted successfully");
    }
    setDeleteModal({ isOpen: false, reviewId: null });
  };

  // Check if the current user has already reviewed the book
  const hasUserReviewed = bookReviews?.reviews?.some(
    (review) => isAuthenticated && user?.id === review.userId
  );

  // Determine if user can review (authenticated, hasn't reviewed yet, and has purchased)
  const canReview = isAuthenticated && !hasUserReviewed;
  // In a real app, you'd check if user has purchased the book

  // Loading state
  if (isLoading && !bookReviews) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link
          to={`/books/${bookId}`}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-900"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Book
        </Link>
      </div>

      {bookReviews && (
        <div className="space-y-8">
          <BookReviewSummary
            book={bookReviews}
            onWriteReviewClick={
              canReview && !showReviewForm ? handleWriteReviewClick : undefined
            }
          />

          {showReviewForm && (
            <ReviewForm
              bookId={bookId}
              bookTitle={bookReviews.title}
              initialData={editingReview}
              onSubmit={handleSubmitReview}
              onCancel={() => {
                setShowReviewForm(false);
                setEditingReview(null);
              }}
              isLoading={isLoading}
            />
          )}

          <ReviewList
            reviews={bookReviews.reviews}
            bookTitle={bookReviews.title}
            onEdit={(review) =>
              isAuthenticated && user?.id === review.userId
                ? handleEditReview(review)
                : undefined
            }
            onDelete={(review) =>
              isAuthenticated && user?.id === review.userId
                ? handleDeleteClick(review.id)
                : undefined
            }
          />
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, reviewId: null })}
        onConfirm={confirmDelete}
        isLoading={isLoading}
      />
    </div>
  );
};

export default BookReviewsPage;
