import React, { useState } from 'react';

const BookImage = ({ 
  book, 
  className = '', 
  imgClassName = '', 
  altText = '',
  placeholderText = 'Book Cover'
}) => {
  const [imageError, setImageError] = useState(false);
  
  // Get image URL from various possible property names
  const getImageUrl = () => {
    if (!book) return null;
    
    // Check all possible image URL properties
    const possibleProps = ['coverImage', 'ImageUrl', 'imageUrl', 'image', 'Image', 'cover'];
    
    for (const prop of possibleProps) {
      if (book[prop] && typeof book[prop] === 'string' && book[prop].trim() !== '') {
        return book[prop];
      }
    }
    
    return null;
  };
  
  const imageUrl = getImageUrl();
  const title = book?.title || placeholderText;
  const alt = altText || `Cover of ${title}`;
  
  // If image fails to load or no valid URL, show placeholder
  if (imageError || !imageUrl) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}>
        {typeof title === 'string' ? encodeURIComponent(title) : placeholderText}
      </div>
    );
  }
  
  return (
    <img
      src={imageUrl}
      alt={alt}
      className={imgClassName}
      loading="lazy"
      onError={() => setImageError(true)}
    />
  );
};

export default BookImage;