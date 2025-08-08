import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function BookDetailsModal({ book, onClose }) {
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
      setTimeout(() => {
        setIsAdded(false);
        onClose();
      }, 1500);
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

  const cleanDescription = (description) => {
    if (!description) return 'No description available.';
    return description.replace(/<[^>]*>/g, '').substring(0, 500) + (description.length > 500 ? '...' : '');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-3xl font-bold text-white pr-4 leading-tight">{book.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white text-2xl font-bold bg-white/10 rounded-full w-8 h-8 flex items-center justify-center hover:bg-white/20 transition-all duration-300"
          >
            ×
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Book Cover */}
          <div className="md:col-span-1">
            <img
              src={book.thumbnail}
              alt={book.title}
              className="w-full h-auto max-h-80 object-cover rounded-lg shadow-lg"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/200x300/4a5568/ffffff?text=No+Image';
              }}
            />
          </div>

          {/* Book Details */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2"> Book Information</h3>
              <div className="space-y-2">
                <p className="text-gray-200">
                  <span className="font-medium text-white">Author(s):</span> {book.authors?.join(', ') || 'Unknown Author'}
                </p>
                {book.publisher && (
                  <p className="text-gray-200">
                    <span className="font-medium text-white">Publisher:</span> {book.publisher}
                  </p>
                )}
                {book.publishedDate && (
                  <p className="text-gray-200">
                    <span className="font-medium text-white">Published:</span> {book.publishedDate}
                  </p>
                )}
                {book.pageCount && book.pageCount > 0 && (
                  <p className="text-gray-200">
                    <span className="font-medium text-white">Pages:</span> {book.pageCount}
                  </p>
                )}
                {book.language && (
                  <p className="text-gray-200">
                    <span className="font-medium text-white">Language:</span> {book.language.toUpperCase()}
                  </p>
                )}
                {book.isbn && (
                  <p className="text-gray-200">
                    <span className="font-medium text-white">ISBN:</span> {book.isbn}
                  </p>
                )}
              </div>
            </div>

            {book.categories && book.categories.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">🏷️ Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {book.categories.map((category, index) => (
                    <span
                      key={index}
                      className="bg-blue-500/30 text-blue-200 px-3 py-1 rounded-full text-sm border border-blue-400/30"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {book.averageRating && book.averageRating > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">⭐ Rating</h3>
                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-400 text-lg">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>
                        {i < Math.floor(book.averageRating) ? '★' : '☆'}
                      </span>
                    ))}
                  </div>
                  <span className="text-gray-200">
                    {book.averageRating}/5 ({book.ratingsCount || 0} reviews)
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {book.description && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-white mb-3"> Description</h3>
            <p className="text-gray-200 leading-relaxed">
              {cleanDescription(book.description)}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={onClose}
            className="bg-gray-500/80 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all duration-300 flex-1 font-medium border border-gray-400/30"
          >
            Close
          </button>
          
          {book.previewLink && (
            <a
              href={book.previewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500/80 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-all duration-300 flex-1 font-medium text-center border border-blue-400/30"
            >
               Preview Book
            </a>
          )}
          
          <button
            onClick={handleAddToProfile}
            disabled={isAdding || isAdded}
            className={`px-6 py-3 rounded-lg transition-all duration-300 flex-1 font-medium border ${
              isAdded
                ? 'bg-green-500/80 text-white border-green-400/30 cursor-default'
                : isAdding
                ? 'bg-gray-500/80 text-gray-300 border-gray-400/30 cursor-not-allowed'
                : 'bg-green-500/80 backdrop-blur-sm text-white border-green-400/30 hover:bg-green-600'
            }`}
          >
            {isAdding ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Adding to Profile...
              </>
            ) : isAdded ? (
              <>
                 Added to Profile!
              </>
            ) : (
              <>
                 Add to Profile
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookDetailsModal;