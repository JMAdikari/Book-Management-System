import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function BookCard({ book, onViewDetails, showAddButton = true }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const navigate = useNavigate();

  const handleAddToProfile = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    setIsAdding(true);
    try {
      await api.post('/books', {
        title: book.title,
        author: book.authors?.join(', ') || 'Unknown Author',
        isbn: book.isbn || '',
        thumbnailUrl: book.thumbnail || ''
      });
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000); // Reset after 2 seconds
    } catch (error) {
      console.error('Error adding book:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
        navigate('/login');
      }
    } finally {
      setIsAdding(false);
    }
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 border border-white/20 flex flex-col h-full">
      {/* Book Cover */}
      <div className="flex-shrink-0 mb-4 relative">
        <img
          src={book.thumbnail}
          alt={book.title}
          className="w-full h-48 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/150x200/4a5568/ffffff?text=No+Image';
          }}
        />
        {/* Online Reading Indicator */}
        {book.previewLink && (
          <div className="absolute top-2 right-2 bg-purple-500/90 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm border border-purple-400/30">
             Online
          </div>
        )}
      </div>

      {/* Book Info */}
      <div className="flex-grow flex flex-col">
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
          {truncateText(book.title, 60)}
        </h3>
        
        <p className="text-gray-200 mb-2 text-sm">
          <span className="font-medium">Author(s):</span> {truncateText(book.authors?.join(', ') || 'Unknown Author', 40)}
        </p>
        
        {book.publishedDate && (
          <p className="text-gray-300 mb-2 text-sm">
            <span className="font-medium">Published:</span> {new Date(book.publishedDate).getFullYear()}
          </p>
        )}

        {book.pageCount && book.pageCount > 0 && (
          <p className="text-gray-300 mb-2 text-sm">
            <span className="font-medium">Pages:</span> {book.pageCount}
          </p>
        )}

        {book.publisher && (
          <p className="text-gray-300 mb-2 text-sm">
            <span className="font-medium">Publisher:</span> {truncateText(book.publisher, 30)}
          </p>
        )}

        {book.categories && book.categories.length > 0 && (
          <p className="text-gray-300 mb-2 text-sm">
            <span className="font-medium">Genre:</span> {truncateText(book.categories[0], 30)}
          </p>
        )}

        {book.averageRating && book.averageRating > 0 && (
          <div className="flex items-center mb-2">
            <div className="flex text-yellow-400 text-sm mr-2">
              {[...Array(5)].map((_, i) => (
                <span key={i}>
                  {i < Math.floor(book.averageRating) ? '★' : '☆'}
                </span>
              ))}
            </div>
            <span className="text-gray-300 text-xs">
              ({book.ratingsCount || 0} reviews)
            </span>
          </div>
        )}

        {book.description && (
          <p className="text-gray-300 text-sm mb-4 flex-grow">
            {truncateText(book.description.replace(/<[^>]*>/g, ''), 100)}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mt-auto">
          <div className="flex gap-2">
            <button
              onClick={() => onViewDetails(book)}
              className="bg-blue-500/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-300 flex-1 text-sm font-medium border border-blue-400/30"
            >
               View Details
            </button>
            
            {book.previewLink && (
              <a
                href={book.previewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-purple-500/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-all duration-300 flex-1 text-sm font-medium border border-purple-400/30 text-center"
              >
               Read Online
              </a>
            )}
          </div>
          
          {showAddButton && (
            <button
              onClick={handleAddToProfile}
              disabled={isAdding || isAdded}
              className={`px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium border ${
                isAdded
                  ? 'bg-green-500/80 text-white border-green-400/30 cursor-default'
                  : isAdding
                  ? 'bg-gray-500/80 text-gray-300 border-gray-400/30 cursor-not-allowed'
                  : 'bg-green-500/80 backdrop-blur-sm text-white border-green-400/30 hover:bg-green-600'
              }`}
            >
              {isAdding ? (
                <>
                  <span className="inline-block animate-spin mr-1">⏳</span>
                  Adding...
                </>
              ) : isAdded ? (
                <>
                   Added!
                </>
              ) : (
                <>
                  Add to Profile
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookCard;
