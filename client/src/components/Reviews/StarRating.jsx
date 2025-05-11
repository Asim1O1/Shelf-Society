const StarRating = ({
  rating,
  size = "medium",
  interactive = false,
  onChange,
}) => {
  const renderStar = (filled, index) => {
    const sizeClasses = {
      small: "w-4 h-4",
      medium: "w-5 h-5",
      large: "w-6 h-6",
    };

    return (
      <svg
        key={index}
        className={`${sizeClasses[size]} ${
          interactive ? "cursor-pointer" : ""
        } ${filled ? "text-yellow-400" : "text-gray-300"}`}
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
        onClick={interactive ? () => onChange(index + 1) : undefined}
        onMouseEnter={interactive ? () => onChange(index + 1) : undefined}
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    );
  };

  const stars = [];
  const ratingValue = Number(rating) || 0;

  for (let i = 0; i < 5; i++) {
    stars.push(renderStar(i < ratingValue, i));
  }

  return <div className="flex">{stars}</div>;
};

export default StarRating;
