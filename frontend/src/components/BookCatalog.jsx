import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

function BookCatalog() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [favoriteFilter, setFavoriteFilter] = useState('All');
  const [sortBy, setSortBy] = useState('dateAdded');
  const [error, setError] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [showBookDetails, setShowBookDetails] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await api.get('/books');
        setBooks(response.data);
        setFilteredBooks(response.data);
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

  // Filter and sort books whenever filters change
  useEffect(() => {
    let filtered = [...books];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book.isbn && book.isbn.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(book => book.readingStatus === statusFilter);
    }

    // Favorite filter
    if (favoriteFilter === 'Favorites') {
      filtered = filtered.filter(book => book.isFavorite);
    } else if (favoriteFilter === 'Non-Favorites') {
      filtered = filtered.filter(book => !book.isFavorite);
    }

    // Sort books
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'dateAdded':
          return new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0);
        case 'readingStatus':
          const statusOrder = { 'Reading': 0, 'Want to Read': 1, 'Finished': 2 };
          return statusOrder[a.readingStatus] - statusOrder[b.readingStatus];
        default:
          return 0;
      }
    });

    setFilteredBooks(filtered);
  }, [books, searchTerm, statusFilter, favoriteFilter, sortBy]);

  const handleUpdateReadingStatus = async (bookId, newStatus) => {
    try {
      await api.patch(`/books/${bookId}/reading-status`, { readingStatus: newStatus });
      const updatedBooks = books.map(b => b.id === bookId ? { ...b, readingStatus: newStatus } : b);
      setBooks(updatedBooks);
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
      const updatedBooks = books.map(b => b.id === bookId ? { ...b, isFavorite: newFavoriteStatus } : b);
      setBooks(updatedBooks);
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
        const updatedBooks = books.filter(b => b.id !== bookId);
        setBooks(updatedBooks);
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
      'Want to Read': { emoji: '', color: 'bg-blue-600/80', text: 'Want to Read' },
      'Reading': { emoji: '', color: 'bg-amber-500/80', text: 'Reading' },
      'Finished': { emoji: '', color: 'bg-emerald-500/80', text: 'Finished' }
    };
    
    const config = statusConfig[status] || statusConfig['Want to Read'];
    return (
      <div className={`absolute top-2 left-2 ${config.color} text-white text-xs px-2 py-1 rounded-full backdrop-blur-md border border-white/20 flex items-center gap-1 shadow-lg`}>
        <span>{config.emoji}</span>
        <span className="hidden sm:inline font-medium">{config.text}</span>
      </div>
    );
  };

  const ReadingStatusDropdown = ({ bookId, currentStatus, onUpdate }) => {
    const statuses = ['Want to Read', 'Reading', 'Finished'];
    
    return (
      <select
        value={currentStatus || 'Want to Read'}
        onChange={(e) => onUpdate(bookId, e.target.value)}
        className="glass-input w-full text-sm font-medium cursor-pointer focus:border-blue-400/60 transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {statuses.map(status => (
          <option key={status} value={status} className="bg-gray-800 text-white font-medium">
            {status}
          </option>
        ))}
      </select>
    );
  };

  const BookDetailsModal = ({ book, onClose }) => (
    <div className="fixed inset-0 glass-overlay flex items-center justify-center p-4 z-50">
      <div className="glass-modal max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-3xl font-bold text-glass-primary pr-4">{book.title}</h2>
            <button
              onClick={onClose}
              className="text-glass-secondary hover:text-glass-primary text-3xl leading-none transition-colors duration-200 flex-shrink-0"
            >
              ×
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <img
                src={book.thumbnailUrl || 'https://via.placeholder.com/200x300/4a5568/ffffff?text=No+Image'}
                alt={book.title}
                className="w-48 h-64 object-cover rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/200x300/4a5568/ffffff?text=No+Image';
                }}
              />
            </div>
            
            <div className="flex-grow text-glass-primary">
              <div className="space-y-4">
                <div>
                  <span className="font-semibold text-blue-300 text-sm uppercase tracking-wide">Author:</span>
                  <p className="text-glass-secondary mt-1 text-lg">{book.author}</p>
                </div>
                
                {book.isbn && (
                  <div>
                    <span className="font-semibold text-blue-300 text-sm uppercase tracking-wide">ISBN:</span>
                    <p className="text-glass-secondary mt-1">{book.isbn}</p>
                  </div>
                )}
                
                <div>
                  <span className="font-semibold text-blue-300 text-sm uppercase tracking-wide">Reading Status:</span>
                  <p className="text-glass-secondary mt-1 flex items-center gap-2 text-lg">
                    {book.readingStatus === 'Want to Read' && ' Want to Read'}
                    {book.readingStatus === 'Reading' && ' Currently Reading'}
                    {book.readingStatus === 'Finished' && ' Finished'}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-blue-300 text-sm uppercase tracking-wide">Favorite:</span>
                  <p className="text-glass-secondary mt-1 flex items-center gap-2 text-lg">
                    {book.isFavorite ? '❤️ Yes' : '🤍 No'}
                  </p>
                </div>
                
                <div>
                  <span className="font-semibold text-blue-300 text-sm uppercase tracking-wide">Added to Catalog:</span>
                  <p className="text-glass-secondary mt-1">
                    {book.dateAdded ? new Date(book.dateAdded).toLocaleDateString() : 'Recently added'}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 mt-8">
                <button
                  onClick={() => handlePreviewBook(book)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 text-sm font-medium"
                >
                   Preview Book
                </button>
                <button
                  onClick={() => handleToggleFavorite(book.id, book.isFavorite)}
                  className={`${book.isFavorite 
                    ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700' 
                    : 'bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700'
                  } text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 text-sm font-medium`}
                >
                  {book.isFavorite ? '💔 Remove Favorite' : '❤️ Add Favorite'}
                </button>
              </div>
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
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-glass-primary mb-4 tracking-tight"> My Book Catalog</h2>
          <p className="text-glass-secondary text-xl max-w-2xl mx-auto">Your personal digital library - track, organize, and discover your favorite books</p>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-xl border glass-modal text-red-300 text-center shadow-lg">
            <span className="font-medium"> {error}</span>
          </div>
        )}

        <div className="flex justify-center mb-10">
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-lg px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3 font-semibold"
          >
            
            Search & Add More Books
          </button>
        </div>

        {books.length > 0 && (
          <div className="mb-8">
            {/* Search and Filter Controls */}
            <div className="card mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-grow">
                  <label className="block text-glass-secondary text-sm font-medium mb-2"> Search Books</label>
                  <input
                    type="text"
                    placeholder="Search by title, author, or ISBN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="glass-input w-full"
                  />
                </div>

                {/* Status Filter */}
                <div className="min-w-[180px]">
                  <label className="block text-glass-secondary text-sm font-medium mb-2"> Reading Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="glass-input w-full"
                  >
                    <option value="All" className="bg-gray-800">All Books</option>
                    <option value="Want to Read" className="bg-gray-800">Want to Read</option>
                    <option value="Reading" className="bg-gray-800">Currently Reading</option>
                    <option value="Finished" className="bg-gray-800">Finished</option>
                  </select>
                </div>

                {/* Favorite Filter */}
                <div className="min-w-[160px]">
                  <label className="block text-glass-secondary text-sm font-medium mb-2">❤️ Favorites</label>
                  <select
                    value={favoriteFilter}
                    onChange={(e) => setFavoriteFilter(e.target.value)}
                    className="glass-input w-full"
                  >
                    <option value="All" className="bg-gray-800">All Books</option>
                    <option value="Favorites" className="bg-gray-800">Favorites Only</option>
                    <option value="Non-Favorites" className="bg-gray-800">Non-Favorites</option>
                  </select>
                </div>

                {/* Sort By */}
                <div className="min-w-[160px]">
                  <label className="block text-glass-secondary text-sm font-medium mb-2"> Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="glass-input w-full"
                  >
                    <option value="dateAdded" className="bg-gray-800">Date Added</option>
                    <option value="title" className="bg-gray-800">Title A-Z</option>
                    <option value="author" className="bg-gray-800">Author A-Z</option>
                    <option value="readingStatus" className="bg-gray-800">Reading Status</option>
                  </select>
                </div>
              </div>

              {/* Results Summary */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-glass-secondary text-sm">
                  Showing <span className="font-bold text-glass-primary">{filteredBooks.length}</span> of <span className="font-bold text-glass-primary">{books.length}</span> books
                  {searchTerm && (
                    <span> matching "<span className="font-bold text-blue-300">{searchTerm}</span>"</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {filteredBooks.length === 0 && books.length > 0 ? (
          <div className="text-center text-glass-secondary py-16">
            <div className="card max-w-md mx-auto">
              
              <h3 className="text-2xl font-bold mb-2 text-glass-primary">No books found</h3>
              <p className="text-lg mb-6">Try adjusting your search or filters</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('All');
                  setFavoriteFilter('All');
                }}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center text-glass-secondary py-20">
            <div className="card max-w-md mx-auto">
              
              <h3 className="text-3xl font-bold mb-4 text-glass-primary">Your catalog is empty</h3>
              <p className="text-lg mb-8 text-glass-secondary">Start building your digital library by adding some books!</p>
              <button
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-medium"
              >
                
                Browse Books
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredBooks.map((book) => (
              <div key={book.id} className="card flex flex-col h-full group relative overflow-hidden">
                {/* Book Cover */}
                <div className="flex-shrink-0 mb-4 relative">
                      <img
                        src={book.thumbnailUrl || 'https://via.placeholder.com/150x200/4a5568/ffffff?text=No+Image'}
                        alt={book.title}
                        className="w-full h-52 object-cover rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-300"
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
                        className="absolute top-2 right-2 text-2xl hover:scale-110 transition-transform duration-200 drop-shadow-lg"
                      >
                        {book.isFavorite ? '❤️' : '🤍'}
                      </button>
                    </div>

                    {/* Book Info */}
                    <div className="flex-grow flex flex-col">
                      <h3 className="text-lg font-bold text-glass-primary mb-2 line-clamp-2 leading-tight">
                        {truncateText(book.title, 50)}
                      </h3>
                      
                      <p className="text-glass-secondary mb-3 text-sm">
                        <span className="font-medium text-blue-300">Author:</span> {truncateText(book.author, 30)}
                      </p>
                      
                      {book.isbn && (
                        <p className="text-glass-muted mb-3 text-xs">
                          <span className="font-medium">ISBN:</span> {book.isbn}
                        </p>
                      )}

                      {/* Reading Status Selector */}
                      <div className="mb-4">
                        <label className="block text-glass-muted text-xs mb-2 uppercase tracking-wide">Reading Status:</label>
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
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white flex-1 text-xs py-2 px-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-1 font-medium"
                          >
                             Details
                          </button>
                          
                          <button
                            onClick={() => handlePreviewBook(book)}
                            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white flex-1 text-xs py-2 px-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-1 font-medium"
                          >
                             Preview
                          </button>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(book.id)}
                            className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white flex-1 text-xs py-2 px-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-1 font-medium"
                          >
                             Remove
                          </button>
                        </div>
                      </div>
                    </div>
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