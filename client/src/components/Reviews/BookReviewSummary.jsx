// src/components/reviews/BookReviewSummary.jsx
import StarRating from "./StarRating";

const BookReviewSummary = ({ book, onWriteReviewClick }) => {
  const { averageRating, reviewCount } = book;

  const renderRatingDistribution = () => {
    const distribution = [
      { rating: 5, percentage: 65 },
      { rating: 4, percentage: 20 },
      { rating: 3, percentage: 10 },
      { rating: 2, percentage: 3 },
      { rating: 1, percentage: 2 },
    ];

    return (
      <div className="space-y-3">
        {distribution.map(({ rating, percentage }) => (
          <div key={rating} className="flex items-center">
            <span className="text-sm text-gray-600 w-12">{rating} star</span>
            <div className="flex-1 mx-3">
              <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-yellow-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
            <span className="text-sm text-gray-600 w-12 text-right">
              {percentage}%
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-light text-gray-900 mb-2">
            Customer Reviews
          </h3>
          <div className="flex items-center gap-3">
            <StarRating rating={averageRating || 0} size="medium" />
            <span className="text-sm text-gray-600">
              {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
            </span>
          </div>
        </div>

        {onWriteReviewClick && (
          <button
            onClick={onWriteReviewClick}
            className="px-5 py-2.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Write a Review
          </button>
        )}
      </div>

      {reviewCount > 0 && (
        <div className="pt-6 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-4">
            Rating Distribution
          </h4>
          {renderRatingDistribution()}
        </div>
      )}
    </div>
  );
};

export default BookReviewSummary;
