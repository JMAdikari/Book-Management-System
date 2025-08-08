import { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

function BookSearch() {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await api.get(`/books/search?query=${encodeURIComponent(query)}`);
      setBooks(response.data);
      setError('');
    } catch (err) {
      setError('Failed to search books');
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const handleAddBook = async (book) => {
    try {
      await api.post('/books', {
        title: book.title,
        author: book.authors?.join(', ') || 'Unknown',
        isbn: book.isbn || '',
        thumbnailUrl: book.thumbnail || ''
      });
      navigate('/catalog');
    } catch (err) {
      setError('Failed to add book');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Search Books</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for books..."
            className="w-full p-2 border rounded"
            required
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            Search
          </button>
        </div>
      </form>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {books.map((book) => (
          <div key={book.id} className="border p-4 rounded shadow">
            <img
              src={book.thumbnail || 'https://via.placeholder.com/150'}
              alt={book.title}
              className="w-full h-48 object-cover mb-2"
            />
            <h3 className="text-lg font-semibold">{book.title}</h3>
            <p className="text-gray-600">Author(s): {book.authors?.join(', ') || 'Unknown'}</p>
            <p className="text-gray-600">ISBN: {book.isbn || 'N/A'}</p>
            <button
              onClick={() => handleAddBook(book)}
              className="mt-2 bg-green-500 text-white p-2 rounded w-full"
            >
              Add to Catalog
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BookSearch;