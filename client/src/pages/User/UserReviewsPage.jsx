import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ConfirmDeleteModal from "../../components/Reviews/ConfirmDeleteModal";
import ReviewForm from "../../components/Reviews/ReviewForm";
import ReviewList from "../../components/Reviews/ReviewList";
import useReviewStore from "../../stores/useReviewStore";

const UserReviewsPage = () => {
  const {
    userReviews,
    getUserReviews,
    updateReview,
    deleteReview,
    isLoading,
    error,
    clearError,
  } = useReviewStore();

  const [editingReview, setEditingReview] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    reviewId: null,
  });

  useEffect(() => {
    // Fetch user reviews when component mounts
    getUserReviews();

    // Clear error state when component unmounts
    return () => clearError();
  }, []);

  // Show error messages
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleEditReview = (review) => {
    setEditingReview(review);
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
  };

  const handleUpdateReview = async (reviewData) => {
    const result = await updateReview(editingReview.id, reviewData);
    if (result.success) {
      setEditingReview(null);
      toast.success("Review updated successfully");
    }
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

  // Loading state
  if (isLoading && !userReviews) {
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
        <h1 className="text-2xl font-bold text-gray-900">Your Reviews</h1>
        <p className="text-gray-600 mt-1">Manage the reviews you've written</p>
      </div>

      {editingReview ? (
        <div className="mb-8">
          <div className="mb-4">
            <button
              onClick={handleCancelEdit}
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
              Back to Reviews
            </button>
          </div>

          <ReviewForm
            bookId={editingReview.bookId}
            bookTitle={editingReview.bookTitle}
            initialData={editingReview}
            onSubmit={handleUpdateReview}
            onCancel={handleCancelEdit}
            isLoading={isLoading}
          />
        </div>
      ) : (
        userReviews && (
          <ReviewList
            reviews={userReviews.reviews}
            onEdit={handleEditReview}
            onDelete={handleDeleteClick}
            isUserReviews={true}
          />
        )
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

export default UserReviewsPage;
