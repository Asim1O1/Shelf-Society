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
      <div className="text-center py-8 bg-white rounded-lg shadow">
        <p className="text-gray-500">
          {isUserReviews
            ? "You haven't written any reviews yet."
            : `No reviews yet for "${bookTitle}".`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold">
        {isUserReviews ? "Your Reviews" : `Reviews for "${bookTitle}"`}
      </h3>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-gray-800">{review.userName}</p>
                  <span className="text-gray-400">•</span>
                  <p className="text-sm text-gray-500">
                    {format(new Date(review.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="mt-1">
                  <StarRating rating={review.rating} size="small" />
                </div>
              </div>

              {(onEdit || onDelete) && (
                <div className="flex space-x-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(review)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(review.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="mt-2">
              <p className="text-gray-600">{review.comment}</p>
            </div>

            {isUserReviews && (
              <div className="mt-2 flex items-center">
                <div className="h-8 w-8 flex-shrink-0">
                  <img
                    src={review.bookImageUrl || "/placeholder-book.jpg"}
                    alt={review.bookTitle}
                    className="h-full w-full object-cover rounded"
                  />
                </div>
                <div className="ml-2">
                  <p className="text-sm font-medium text-gray-700">
                    {review.bookTitle}
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
