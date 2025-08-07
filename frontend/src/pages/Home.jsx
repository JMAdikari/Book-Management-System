import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BookDetailsModal from '../components/BookDetailsModal';
import api from '../services/api';
import backgroundImage from '../assets/bd.png.png';

function Home() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setError(''); // Clear previous errors
    setSearchResults([]); // Clear previous results

    try {
      const response = await api.get(`/books/search?query=${encodeURIComponent(query)}`);
      setSearchResults(response.data);
      if (response.data.length === 0) {
        setError('No books found for your search query.');
      }
    } catch (err) {
      console.error('Search error:', err);
      if (err.response?.status === 500) {
        setError('Search service is temporarily unavailable. Please check if the Google Books API key is configured.');
      } else if (err.response?.status === 404) {
        setError('Search service not found. Please try again later.');
      } else {
        setError('Failed to search books. Please try again.');
      }
    }
  };

  const handleAddBook = async (book) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Please log in to add books to your catalog.');
      navigate('/login');
      return;
    }

    try {
      await api.post('/books', {
        title: book.title,
        author: book.authors?.join(', ') || 'Unknown',
        isbn: book.isbn || null,
        thumbnailUrl: book.thumbnail || null
      });
      setError('');
      alert('Book added to catalog!');
    } catch (err) {
      console.error('Failed to add book:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('authToken');
        alert('Session expired. Please log in again.');
        navigate('/login');
      } else {
        setError('Failed to add book. Please try again.');
      }
    }
  };

  const handleViewDetails = (book) => {
    setSelectedBook(book);
  };

  const closeModal = () => {
    setSelectedBook(null);
  };

  return (
    <div className="min-h-screen relative">
      {/* Fixed Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: `url(${backgroundImage})`
        }}
      ></div>
      
      {/* Content Overlay */}
      <div className="relative z-10">
        <Navbar />
      
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-black/40 to-black/60 text-white relative overflow-hidden backdrop-blur-sm">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-40 h-40 bg-white/20 rounded-full"></div>
            <div className="absolute top-60 right-40 w-24 h-24 bg-white/20 rounded-full"></div>
            <div className="absolute bottom-40 left-1/3 w-20 h-20 bg-white/20 rounded-full"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-6 py-24 relative z-10">
            <div className="text-center">
              <h1 className="text-4xl sm:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200">
                Welcome to SmartBooks
              </h1>
              <p className="text-lg sm:text-xl mb-10 text-gray-200 max-w-2xl mx-auto">
                Where every page leads to progress
              </p>
              <p className="text-lg sm:text-xl mb-10 text-gray-200 max-w-2xl mx-auto">
                Organize, manage, and discover your favorite books with our intuitive platform
              </p>
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="mb-6 max-w-2xl mx-auto">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for books..."
                    className="w-full p-3 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <button
                    type="submit"
                    className="bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-all duration-300"
                  >
                    🔍 Search
                  </button>
                </div>
                {error && <p className="text-red-400 mt-2">{error}</p>}
              </form>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link 
                  to="/login" 
                  className="bg-white/20 backdrop-blur-md text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white/30 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl min-w-[180px] border border-white/30"
                >
                  🚀 Login
                </Link>
                <Link 
                  to="/register" 
                  className="border-2 border-white/50 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white/20 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl min-w-[180px] backdrop-blur-md"
                >
                  ✨ Sign Up Free
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="max-w-7xl mx-auto px-6 py-12 bg-black/20 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-6">Search Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {searchResults.map((book) => (
                <div
                  key={book.id}
                  className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 border border-white/20"
                >
                  <img
                    src={book.thumbnail || 'https://via.placeholder.com/150'}
                    alt={book.title}
                    className="w-full h-48 object-cover mb-4 rounded"
                  />
                  <h3 className="text-lg font-semibold text-white mb-2">{book.title}</h3>
                  <p className="text-gray-200 mb-2">Author(s): {book.authors?.join(', ') || 'Unknown'}</p>
                  <p className="text-gray-200 mb-4">ISBN: {book.isbn || 'N/A'}</p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleViewDetails(book)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-300 flex-1"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleAddBook(book)}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all duration-300 flex-1"
                    >
                      Add to Catalog
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-6 py-20 bg-black/20 backdrop-blur-sm">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-12 text-white">
            Amazing Features
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 border border-white/20">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-3 text-white">Organize Books</h3>
              <p className="text-gray-200 leading-relaxed">
                Keep track of all your books in a beautifully organized digital library
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 border border-white/20">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-3 text-white">Smart Search</h3>
              <p className="text-gray-200 leading-relaxed">
                Find books instantly with AI-powered search and recommendations
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 border border-white/20">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-3 text-white">Track Progress</h3>
              <p className="text-gray-200 leading-relaxed">
                Monitor your reading journey with analytics and insights
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-black/50 to-black/70 backdrop-blur-sm text-white py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-6">
                <div className="text-3xl font-bold mb-2">10K+</div>
                <div className="text-gray-300">Happy Users</div>
              </div>
              <div className="p-6">
                <div className="text-3xl font-bold mb-2">50K+</div>
                <div className="text-gray-300">Books Managed</div>
              </div>
              <div className="p-6">
                <div className="text-3xl font-bold mb-2">99%</div>
                <div className="text-gray-300">Satisfaction Rate</div>
              </div>
              <div className="p-6">
                <div className="text-3xl font-bold mb-2">24/7</div>
                <div className="text-gray-300">Support Available</div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-black/30 backdrop-blur-sm py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="bg-white/10 backdrop-blur-md p-10 rounded-xl shadow-md border border-white/20">
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 text-white">
                Transform Your Reading Experience
              </h2>
              <p className="text-lg text-gray-200 mb-8 leading-relaxed">
                Join thousands of book lovers in organizing their reading journey
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link 
                  to="/login" 
                  className="bg-white/20 backdrop-blur-md text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white/30 hover:scale-105 transition-all duration-300 shadow-lg min-w-[180px] border border-white/30"
                >
                  🎯 Login Now
                </Link>
                <Link 
                  to="/register" 
                  className="bg-white/10 backdrop-blur-md text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white/20 hover:scale-105 transition-all duration-300 shadow-lg min-w-[180px] border border-white/20"
                >
                  🌟 Join Free Today
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-black/40 backdrop-blur-sm text-white py-12 border-t border-white/20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <h3 className="text-xl font-semibold mb-4 text-white">
                  📚 Book Management System
                </h3>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  The ultimate platform for book lovers to organize and track their reading.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors backdrop-blur-sm">
                    <span className="text-lg">📧</span>
                  </a>
                  <a href="#" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors backdrop-blur-sm">
                    <span className="text-lg">🐦</span>
                  </a>
                  <a href="#" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors backdrop-blur-sm">
                    <span className="text-lg">📱</span>
                  </a>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
                <ul className="space-y-2 text-gray-300">
                  <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                  <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
                  <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4 text-white">Support</h4>
                <ul className="space-y-2 text-gray-300">
                  <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/20 mt-8 pt-8 text-center">
              <p className="text-gray-400">
                &copy; 2025 Book Management System. All rights reserved.
              </p>
            </div>
          </div>
        </footer>

        {/* Book Details Modal */}
        {selectedBook && (
          <BookDetailsModal book={selectedBook} onClose={closeModal} />
        )}
      </div>
    </div>
  );
}

export default Home;