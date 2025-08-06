using BookManagementSystem.Data;
using BookManagementSystem.Models;
using Microsoft.EntityFrameworkCore;
using System.Net.Http;
using System.Text.Json;

namespace BookManagementSystem.Services
{
    public class BookService
    {
        private readonly ApplicationDbContext _context;
        private readonly HttpClient _httpClient;
        private readonly string _googleBooksApiBaseUrl = "https://www.googleapis.com/books/v1/volumes";
        private readonly string _apiKey;

        public BookService(ApplicationDbContext context, HttpClient httpClient)
        {
            _context = context;
            _httpClient = httpClient;
            _apiKey = Environment.GetEnvironmentVariable("GOOGLE_BOOKS_API_KEY");
            if (string.IsNullOrEmpty(_apiKey))
            {
                throw new InvalidOperationException("Google Books API key is not configured.");
            }
        }

        public async Task<List<object>> SearchBooksAsync(string query)
        {
            var response = await _httpClient.GetAsync($"{_googleBooksApiBaseUrl}?q={Uri.EscapeDataString(query)}&key={_apiKey}");
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            var jsonDoc = JsonDocument.Parse(json);
            var items = jsonDoc.RootElement.GetProperty("items").EnumerateArray();

            var results = new List<object>();
            foreach (var item in items)
            {
                var volumeInfo = item.GetProperty("volumeInfo");
                results.Add(new
                {
                    Id = item.GetProperty("id").GetString(),
                    Title = volumeInfo.GetProperty("title").GetString(),
                    Authors = volumeInfo.TryGetProperty("authors", out var authors) ? authors.EnumerateArray().Select(a => a.GetString()).ToList() : new List<string>(),
                    ISBN = volumeInfo.TryGetProperty("industryIdentifiers", out var identifiers) 
                        ? identifiers.EnumerateArray().FirstOrDefault(i => i.GetProperty("type").GetString() == "ISBN_13").GetProperty("identifier").GetString() 
                        : null,
                    Thumbnail = volumeInfo.TryGetProperty("imageLinks", out var imageLinks) 
                        ? imageLinks.GetProperty("thumbnail").GetString() 
                        : null
                });
            }

            return results;
        }

        public async Task<Book> AddBookAsync(int userId, Book book)
        {
            book.UserId = userId;
            _context.Books.Add(book);
            await _context.SaveChangesAsync();
            return book;
        }

        public async Task<List<Book>> GetUserBooksAsync(int userId)
        {
            return await _context.Books.Where(b => b.UserId == userId).ToListAsync();
        }

        public async Task<Book> UpdateBookAsync(int userId, int bookId, Book updatedBook)
        {
            var book = await _context.Books.FirstOrDefaultAsync(b => b.Id == bookId && b.UserId == userId);
            if (book == null)
            {
                return null;
            }

            book.Title = updatedBook.Title ?? book.Title;
            book.Author = updatedBook.Author ?? book.Author;
            book.ISBN = updatedBook.ISBN ?? book.ISBN;
            book.ThumbnailUrl = updatedBook.ThumbnailUrl ?? book.ThumbnailUrl;

            await _context.SaveChangesAsync();
            return book;
        }

        public async Task<bool> DeleteBookAsync(int userId, int bookId)
        {
            var book = await _context.Books.FirstOrDefaultAsync(b => b.Id == bookId && b.UserId == userId);
            if (book == null)
            {
                return false;
            }

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}