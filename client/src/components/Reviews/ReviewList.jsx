// src/components/reviews/ReviewList.jsx
import { format } from "date-fns";
import StarRating from "./StarRating";

const ReviewList = ({
  reviews,
  bookTitle,
  onEdit,
  onDelete,
  isUserReviews = false,
}) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
        <p className="text-gray-500">
          {isUserReviews
            ? "You haven't written any reviews yet."
            : `No reviews yet for "${bookTitle}".`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-light text-gray-900">
        {isUserReviews ? "Your Reviews" : `Reviews for "${bookTitle}"`}
      </h3>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white rounded-lg border border-gray-100 p-6 hover:border-gray-200 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <p className="font-medium text-gray-900">{review.userName}</p>
                  <span className="text-gray-300">•</span>
                  <p className="text-sm text-gray-500">
                    {format(new Date(review.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
                <StarRating rating={review.rating} size="small" />
              </div>

              {(onEdit || onDelete) && (
                <div className="flex gap-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(review)}
                      className="px-3 py-1.5 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(review.id)}
                      className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>

            <p className="text-gray-700 leading-relaxed">{review.comment}</p>

            {isUserReviews && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
                <div className="w-12 h-16 flex-shrink-0">
                  <img
                    src={review.bookImageUrl || "/placeholder-book.jpg"}
                    alt={review.bookTitle}
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {review.bookTitle}
                  </p>
                  <p className="text-sm text-gray-500">
                    by {review.bookAuthor}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
