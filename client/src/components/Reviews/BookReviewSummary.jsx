// src/components/reviews/BookReviewSummary.jsx
import StarRating from "./StarRating";

const BookReviewSummary = ({ book, onWriteReviewClick }) => {
  const { averageRating, reviewCount } = book;

  const renderRatingDistribution = () => {
    // This is a placeholder - in a real app, you would get this data from the API
    // You might add this to your ReviewController and useReviewStore
    const distribution = [
      { rating: 5, percentage: 65 },
      { rating: 4, percentage: 20 },
      { rating: 3, percentage: 10 },
      { rating: 2, percentage: 3 },
      { rating: 1, percentage: 2 },
    ];

    return (
      <div className="space-y-2">
        {distribution.map(({ rating, percentage }) => (
          <div key={rating} className="flex items-center text-sm">
            <div className="w-10">{rating} star</div>
            <div className="w-full ml-2">
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
            <div className="ml-2 w-8 text-right">{percentage}%</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">Customer Reviews</h3>
          <div className="flex items-center mt-1">
            <StarRating rating={averageRating || 0} />
            <span className="ml-2 text-sm text-gray-600">
              Based on {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
            </span>
          </div>
        </div>

        {onWriteReviewClick && (
          <button
            onClick={onWriteReviewClick}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
          >
            Write a Review
          </button>
        )}
      </div>

      {reviewCount > 0 && (
        <div className="mt-6">{renderRatingDistribution()}</div>
      )}
    </div>
  );
};

export default BookReviewSummary;
