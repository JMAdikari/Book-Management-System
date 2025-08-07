import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

function BookCatalog() {
  const [books, setBooks] = useState([]);
  const [editBookId, setEditBookId] = useState(null);
  const [editForm, setEditForm] = useState({ 
    title: '', 
    author: '', 
    isbn: '', 
    thumbnailUrl: '', 
    readingStatus: 'Want to Read',
    isFavorite: false
  });
  const [error, setError] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [showBookDetails, setShowBookDetails] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await api.get('/books');
        setBooks(response.data);
        setError('');
      } catch (err) {
        setError('Failed to load catalog');
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };
    fetchBooks();
  }, [navigate]);

  const handleEdit = (book) => {
    setEditBookId(book.id);
    setEditForm({ 
      title: book.title, 
      author: book.author, 
      isbn: book.isbn || '', 
      thumbnailUrl: book.thumbnailUrl || '',
      readingStatus: book.readingStatus || 'Want to Read',
      isFavorite: book.isFavorite || false
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/books/${editBookId}`, editForm);
      setBooks(books.map(b => b.id === editBookId ? { ...b, ...editForm } : b));
      setEditBookId(null);
      setError('');
    } catch (err) {
      setError('Failed to update book');
    }
  };

  const handleUpdateReadingStatus = async (bookId, newStatus) => {
    try {
      await api.patch(`/books/${bookId}/reading-status`, { readingStatus: newStatus });
      setBooks(books.map(b => b.id === bookId ? { ...b, readingStatus: newStatus } : b));
      setError('');
    } catch (err) {
      setError('Failed to update reading status');
      console.error('Error updating reading status:', err);
    }
  };

  const handleToggleFavorite = async (bookId, currentFavoriteStatus) => {
    try {
      const newFavoriteStatus = !currentFavoriteStatus;
      await api.patch(`/books/${bookId}/favorite`, { isFavorite: newFavoriteStatus });
      setBooks(books.map(b => b.id === bookId ? { ...b, isFavorite: newFavoriteStatus } : b));
      setError('');
    } catch (err) {
      setError('Failed to update favorite status');
      console.error('Error updating favorite status:', err);
    }
  };

  const handleDelete = async (bookId) => {
    if (window.confirm('Are you sure you want to remove this book from your catalog?')) {
      try {
        await api.delete(`/books/${bookId}`);
        setBooks(books.filter(b => b.id !== bookId));
        setError('');
      } catch (err) {
        setError('Failed to delete book');
      }
    }
  };

  const handleViewDetails = (book) => {
    setSelectedBook(book);
    setShowBookDetails(true);
  };

  const handlePreviewBook = (book) => {
    // Try to find the book on Google Books for preview
    const searchQuery = encodeURIComponent(`${book.title} ${book.author}`);
    const googleBooksUrl = `https://www.google.com/books/edition/_/${book.isbn || ''}?hl=en`;
    const googleSearchUrl = `https://books.google.com/books?q=${searchQuery}`;
    
    // If we have an ISBN, try the direct link, otherwise search
    window.open(book.isbn ? googleBooksUrl : googleSearchUrl, '_blank');
  };

  const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getReadingStatusBadge = (status) => {
    const statusConfig = {
      'Want to Read': { emoji: '📚', color: 'bg-blue-500/90', text: 'Want to Read' },
      'Reading': { emoji: '📖', color: 'bg-orange-500/90', text: 'Reading' },
      'Finished': { emoji: '✅', color: 'bg-green-500/90', text: 'Finished' }
    };
    
    const config = statusConfig[status] || statusConfig['Want to Read'];
    return (
      <div className={`absolute top-2 left-2 ${config.color} text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm border border-white/30 flex items-center gap-1`}>
        <span>{config.emoji}</span>
        <span className="hidden sm:inline">{config.text}</span>
      </div>
    );
  };

  const ReadingStatusDropdown = ({ bookId, currentStatus, onUpdate }) => {
    const statuses = ['Want to Read', 'Reading', 'Finished'];
    
    return (
      <select
        value={currentStatus || 'Want to Read'}
        onChange={(e) => onUpdate(bookId, e.target.value)}
        className="bg-white/20 border border-white/30 text-white text-xs px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        onClick={(e) => e.stopPropagation()}
      >
        {statuses.map(status => (
          <option key={status} value={status} className="bg-gray-800 text-white">
            {status}
          </option>
        ))}
      </select>
    );
  };

  const BookDetailsModal = ({ book, onClose }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-white">{book.title}</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <img
              src={book.thumbnailUrl || 'https://via.placeholder.com/200x300/4a5568/ffffff?text=No+Image'}
              alt={book.title}
              className="w-48 h-64 object-cover rounded-lg shadow-lg"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/200x300/4a5568/ffffff?text=No+Image';
              }}
            />
          </div>
          
          <div className="flex-grow text-white">
            <div className="space-y-3">
              <div>
                <span className="font-semibold text-blue-300">Author:</span>
                <p className="text-gray-200">{book.author}</p>
              </div>
              
              {book.isbn && (
                <div>
                  <span className="font-semibold text-blue-300">ISBN:</span>
                  <p className="text-gray-200">{book.isbn}</p>
                </div>
              )}
              
              <div>
                <span className="font-semibold text-blue-300">Reading Status:</span>
                <p className="text-gray-200 flex items-center gap-2">
                  {book.readingStatus === 'Want to Read' && '📚 Want to Read'}
                  {book.readingStatus === 'Reading' && '📖 Currently Reading'}
                  {book.readingStatus === 'Finished' && '✅ Finished'}
                </p>
              </div>

              <div>
                <span className="font-semibold text-blue-300">Favorite:</span>
                <p className="text-gray-200 flex items-center gap-2">
                  {book.isFavorite ? '❤️ Yes' : '🤍 No'}
                </p>
              </div>
              
              <div>
                <span className="font-semibold text-blue-300">Added to Catalog:</span>
                <p className="text-gray-200">
                  {book.dateAdded ? new Date(book.dateAdded).toLocaleDateString() : 'Recently added'}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handlePreviewBook(book)}
                className="bg-purple-500/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-all duration-300 flex items-center gap-2 border border-purple-400/30"
              >
                📚 Preview Book
              </button>
              <button
                onClick={() => handleEdit(book)}
                className="bg-blue-500/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-300 flex items-center gap-2 border border-blue-400/30"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => handleToggleFavorite(book.id, book.isFavorite)}
                className="bg-pink-500/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-all duration-300 flex items-center gap-2 border border-pink-400/30"
              >
                {book.isFavorite ? '💔 Remove Favorite' : '❤️ Add Favorite'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-gradient-primary)' }}>
      <Navbar />
      <div className="container mx-auto p-4 pt-24">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-4">📚 My Book Catalog</h2>
          <p className="text-gray-200 text-lg">Your personal digital library</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg border bg-red-500/20 border-red-500/30 text-red-200 text-center">
            {error}
          </div>
        )}

        <div className="flex justify-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500/80 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-all duration-300 flex items-center gap-2 border border-blue-400/30 font-medium"
          >
            🔍 Search & Add More Books
          </button>
        </div>

        {books.length === 0 ? (
          <div className="text-center text-gray-300 py-16">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-2xl font-semibold mb-2">Your catalog is empty</h3>
            <p className="text-lg mb-6">Start building your digital library by adding some books!</p>
            <button
              onClick={() => navigate('/')}
              className="bg-green-500/80 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-all duration-300 border border-green-400/30 font-medium"
            >
              Browse Books
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <div key={book.id} className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 border border-white/20 flex flex-col h-full">
                {editBookId === book.id ? (
                  <form onSubmit={handleUpdate} className="flex flex-col h-full">
                    <div className="space-y-4 flex-grow">
                      <div>
                        <label className="block text-white font-medium mb-2">Title</label>
                        <input
                          type="text"
                          name="title"
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-white font-medium mb-2">Author</label>
                        <input
                          type="text"
                          name="author"
                          value={editForm.author}
                          onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
                          className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-white font-medium mb-2">ISBN</label>
                        <input
                          type="text"
                          name="isbn"
                          value={editForm.isbn}
                          onChange={(e) => setEditForm({ ...editForm, isbn: e.target.value })}
                          className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                      <div>
                        <label className="block text-white font-medium mb-2">Cover Image URL</label>
                        <input
                          type="text"
                          name="thumbnailUrl"
                          value={editForm.thumbnailUrl}
                          onChange={(e) => setEditForm({ ...editForm, thumbnailUrl: e.target.value })}
                          className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                      <div>
                        <label className="block text-white font-medium mb-2">Reading Status</label>
                        <select
                          value={editForm.readingStatus}
                          onChange={(e) => setEditForm({ ...editForm, readingStatus: e.target.value })}
                          className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                          <option value="Want to Read" className="bg-gray-800">Want to Read</option>
                          <option value="Reading" className="bg-gray-800">Reading</option>
                          <option value="Finished" className="bg-gray-800">Finished</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="isFavorite"
                          checked={editForm.isFavorite}
                          onChange={(e) => setEditForm({ ...editForm, isFavorite: e.target.checked })}
                          className="w-4 h-4 rounded focus:ring-2 focus:ring-blue-400"
                        />
                        <label htmlFor="isFavorite" className="text-white font-medium flex items-center gap-2">
                          <span>❤️ Add to Favorites</span>
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button type="submit" className="flex-1 bg-green-500/80 text-white p-3 rounded-lg hover:bg-green-600 transition-colors border border-green-400/30 font-medium">
                        💾 Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditBookId(null)}
                        className="flex-1 bg-gray-500/80 text-white p-3 rounded-lg hover:bg-gray-600 transition-colors border border-gray-400/30 font-medium"
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    {/* Book Cover */}
                    <div className="flex-shrink-0 mb-4 relative">
                      <img
                        src={book.thumbnailUrl || 'https://via.placeholder.com/150x200/4a5568/ffffff?text=No+Image'}
                        alt={book.title}
                        className="w-full h-48 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150x200/4a5568/ffffff?text=No+Image';
                        }}
                      />
                      {/* Reading Status Badge */}
                      {getReadingStatusBadge(book.readingStatus)}
                      
                      {/* Favorite Heart */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(book.id, book.isFavorite);
                        }}
                        className="absolute top-2 right-2 text-2xl hover:scale-110 transition-transform duration-200"
                      >
                        {book.isFavorite ? '❤️' : '🤍'}
                      </button>
                    </div>

                    {/* Book Info */}
                    <div className="flex-grow flex flex-col">
                      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                        {truncateText(book.title, 50)}
                      </h3>
                      
                      <p className="text-gray-200 mb-2 text-sm">
                        <span className="font-medium">Author:</span> {truncateText(book.author, 30)}
                      </p>
                      
                      {book.isbn && (
                        <p className="text-gray-300 mb-2 text-sm">
                          <span className="font-medium">ISBN:</span> {book.isbn}
                        </p>
                      )}

                      {/* Reading Status Selector */}
                      <div className="mb-3">
                        <label className="block text-gray-300 text-xs mb-1">Reading Status:</label>
                        <ReadingStatusDropdown 
                          bookId={book.id}
                          currentStatus={book.readingStatus}
                          onUpdate={handleUpdateReadingStatus}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 mt-auto">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetails(book)}
                            className="bg-blue-500/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-all duration-300 flex-1 text-sm font-medium border border-blue-400/30 flex items-center justify-center gap-1"
                          >
                            📖 Details
                          </button>
                          
                          <button
                            onClick={() => handlePreviewBook(book)}
                            className="bg-purple-500/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg hover:bg-purple-600 transition-all duration-300 flex-1 text-sm font-medium border border-purple-400/30 flex items-center justify-center gap-1"
                          >
                            👁️ Preview
                          </button>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(book)}
                            className="bg-yellow-500/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg hover:bg-yellow-600 transition-all duration-300 flex-1 text-sm font-medium border border-yellow-400/30 flex items-center justify-center gap-1"
                          >
                            ✏️ Edit
                          </button>
                          
                          <button
                            onClick={() => handleDelete(book.id)}
                            className="bg-red-500/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 flex-1 text-sm font-medium border border-red-400/30 flex items-center justify-center gap-1"
                          >
                            🗑️ Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Book Details Modal */}
        {showBookDetails && selectedBook && (
          <BookDetailsModal 
            book={selectedBook} 
            onClose={() => {
              setShowBookDetails(false);
              setSelectedBook(null);
            }} 
          />
        )}
      </div>
    </div>
  );
}

export default BookCatalog;