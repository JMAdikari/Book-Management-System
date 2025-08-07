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
            _apiKey = Environment.GetEnvironmentVariable("GOOGLE_BOOKS_API_KEY") ?? "";
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
            
            // Check if the response has items property
            if (!jsonDoc.RootElement.TryGetProperty("items", out var itemsProperty))
            {
                return new List<object>();
            }

            var results = new List<object>();
            foreach (var item in itemsProperty.EnumerateArray())
            {
                if (!item.TryGetProperty("volumeInfo", out var volumeInfo))
                {
                    continue; // Skip this item if no volumeInfo
                }

                // Extract book information with null checks
                var bookData = new
                {
                    Id = item.TryGetProperty("id", out var idProp) ? idProp.GetString() : null,
                    Title = volumeInfo.TryGetProperty("title", out var titleProp) ? titleProp.GetString() : "Unknown Title",
                    Authors = ExtractAuthors(volumeInfo),
                    Description = volumeInfo.TryGetProperty("description", out var descProp) ? descProp.GetString() : null,
                    PublishedDate = volumeInfo.TryGetProperty("publishedDate", out var dateProp) ? dateProp.GetString() : null,
                    PageCount = volumeInfo.TryGetProperty("pageCount", out var pagesProp) ? pagesProp.GetInt32() : 0,
                    Categories = ExtractCategories(volumeInfo),
                    Language = volumeInfo.TryGetProperty("language", out var langProp) ? langProp.GetString() : "en",
                    ISBN = ExtractISBN(volumeInfo),
                    Thumbnail = ExtractThumbnail(volumeInfo),
                    PreviewLink = volumeInfo.TryGetProperty("previewLink", out var previewProp) ? previewProp.GetString() : null,
                    InfoLink = volumeInfo.TryGetProperty("infoLink", out var infoProp) ? infoProp.GetString() : null,
                    AverageRating = volumeInfo.TryGetProperty("averageRating", out var ratingProp) ? ratingProp.GetDouble() : 0,
                    RatingsCount = volumeInfo.TryGetProperty("ratingsCount", out var countProp) ? countProp.GetInt32() : 0,
                    Publisher = volumeInfo.TryGetProperty("publisher", out var pubProp) ? pubProp.GetString() : null
                };

                if (!string.IsNullOrEmpty(bookData.Id) && !string.IsNullOrEmpty(bookData.Title))
                {
                    results.Add(bookData);
                }
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

        public async Task<Book?> UpdateBookAsync(int userId, int bookId, Book updatedBook)
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

        public async Task<Book?> UpdateReadingStatusAsync(int userId, int bookId, string readingStatus)
        {
            var book = await _context.Books.FirstOrDefaultAsync(b => b.Id == bookId && b.UserId == userId);
            if (book == null)
            {
                return null;
            }

            book.ReadingStatus = readingStatus;
            await _context.SaveChangesAsync();
            return book;
        }

        public async Task<Book?> UpdateFavoriteStatusAsync(int userId, int bookId, bool isFavorite)
        {
            var book = await _context.Books.FirstOrDefaultAsync(b => b.Id == bookId && b.UserId == userId);
            if (book == null)
            {
                return null;
            }

            book.IsFavorite = isFavorite;
            await _context.SaveChangesAsync();
            return book;
        }

        private List<string> ExtractAuthors(JsonElement volumeInfo)
        {
            if (volumeInfo.TryGetProperty("authors", out var authors))
            {
                return authors.EnumerateArray().Select(a => a.GetString() ?? "Unknown").ToList();
            }
            return new List<string> { "Unknown Author" };
        }

        private List<string> ExtractCategories(JsonElement volumeInfo)
        {
            if (volumeInfo.TryGetProperty("categories", out var categories))
            {
                return categories.EnumerateArray().Select(c => c.GetString() ?? "Unknown").ToList();
            }
            return new List<string>();
        }

        private string? ExtractISBN(JsonElement volumeInfo)
        {
            if (volumeInfo.TryGetProperty("industryIdentifiers", out var identifiers))
            {
                foreach (var identifier in identifiers.EnumerateArray())
                {
                    if (identifier.TryGetProperty("type", out var typeProp) && 
                        identifier.TryGetProperty("identifier", out var idProp))
                    {
                        var type = typeProp.GetString();
                        if (type == "ISBN_13" || type == "ISBN_10")
                        {
                            return idProp.GetString();
                        }
                    }
                }
            }
            return null;
        }

        private string? ExtractThumbnail(JsonElement volumeInfo)
        {
            if (volumeInfo.TryGetProperty("imageLinks", out var imageLinks))
            {
                // Try thumbnail first, then smallThumbnail
                if (imageLinks.TryGetProperty("thumbnail", out var thumbnail))
                {
                    return thumbnail.GetString();
                }
                if (imageLinks.TryGetProperty("smallThumbnail", out var smallThumbnail))
                {
                    return smallThumbnail.GetString();
                }
            }
            return null;
        }
    }
}