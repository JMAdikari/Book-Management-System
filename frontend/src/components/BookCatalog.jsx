import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

function BookCatalog() {
  const [books, setBooks] = useState([]);
  const [editBookId, setEditBookId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', author: '', isbn: '', thumbnailUrl: '' });
  const [error, setError] = useState('');
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
    setEditForm({ title: book.title, author: book.author, isbn: book.isbn, thumbnailUrl: book.thumbnailUrl });
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

  const handleDelete = async (bookId) => {
    try {
      await api.delete(`/books/${bookId}`);
      setBooks(books.filter(b => b.id !== bookId));
      setError('');
    } catch (err) {
      setError('Failed to delete book');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">My Book Catalog</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <button
        onClick={() => navigate('/search')}
        className="mb-4 bg-blue-500 text-white p-2 rounded"
      >
        Search Books
      </button>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {books.map((book) => (
          <div key={book.id} className="border p-4 rounded shadow">
            {editBookId === book.id ? (
              <form onSubmit={handleUpdate}>
                <div className="mb-2">
                  <label className="block text-gray-700">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-gray-700">Author</label>
                  <input
                    type="text"
                    name="author"
                    value={editForm.author}
                    onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-gray-700">ISBN</label>
                  <input
                    type="text"
                    name="isbn"
                    value={editForm.isbn}
                    onChange={(e) => setEditForm({ ...editForm, isbn: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-gray-700">Thumbnail URL</label>
                  <input
                    type="text"
                    name="thumbnailUrl"
                    value={editForm.thumbnailUrl}
                    onChange={(e) => setEditForm({ ...editForm, thumbnailUrl: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded mb-2">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditBookId(null)}
                  className="w-full bg-gray-500 text-white p-2 rounded"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <img
                  src={book.thumbnailUrl || 'https://via.placeholder.com/150'}
                  alt={book.title}
                  className="w-full h-48 object-cover mb-2"
                />
                <h3 className="text-lg font-semibold">{book.title}</h3>
                <p className="text-gray-600">Author: {book.author}</p>
                <p className="text-gray-600">ISBN: {book.isbn || 'N/A'}</p>
                <button
                  onClick={() => handleEdit(book)}
                  className="mt-2 bg-yellow-500 text-white p-2 rounded w-full"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(book.id)}
                  className="mt-2 bg-red-500 text-white p-2 rounded w-full"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default BookCatalog;