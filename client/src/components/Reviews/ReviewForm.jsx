// src/components/reviews/ReviewForm.jsx
import { useEffect, useState } from "react";
import StarRating from "./StarRating";

const ReviewForm = ({
  bookId,
  bookTitle,
  initialData = null,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [comment, setComment] = useState(initialData?.comment || "");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setRating(initialData.rating);
      setComment(initialData.comment);
    }
  }, [initialData]);

  const validate = () => {
    const newErrors = {};

    if (!rating || rating < 1) {
      newErrors.rating = "Please select a rating";
    }

    if (!comment.trim()) {
      newErrors.comment = "Please enter a review comment";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    onSubmit({
      bookId,
      rating,
      comment,
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-6">
      <h3 className="text-xl font-light text-gray-900 mb-6">
        {initialData ? "Edit Review" : `Review "${bookTitle}"`}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating
          </label>
          <div className="flex items-center gap-3">
            <StarRating
              rating={rating}
              size="large"
              interactive={true}
              onChange={setRating}
            />
            <span className="text-sm text-gray-500">
              {rating > 0 ? `${rating} out of 5 stars` : "Select a rating"}
            </span>
          </div>
          {errors.rating && (
            <p className="mt-2 text-sm text-red-600">{errors.rating}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Your Review
          </label>
          <textarea
            id="comment"
            rows={5}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
              errors.comment
                ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                : "border-gray-200 focus:border-red-300 focus:ring-red-100"
            }`}
            placeholder="Share your thoughts on this book..."
          />
          {errors.comment && (
            <p className="mt-2 text-sm text-red-600">{errors.comment}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors font-medium"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {initialData ? "Updating..." : "Submitting..."}
              </span>
            ) : initialData ? (
              "Update Review"
            ) : (
              "Submit Review"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
