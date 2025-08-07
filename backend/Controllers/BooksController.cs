using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BookManagementSystem.Models;
using BookManagementSystem.Services;
using System.Security.Claims;

namespace BookManagementSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BooksController : ControllerBase
    {
        private readonly BookService _bookService;

        public BooksController(BookService bookService)
        {
            _bookService = bookService;
        }

        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<IActionResult> SearchBooks([FromQuery] string query)
        {
            if (string.IsNullOrEmpty(query))
            {
                return BadRequest(new { Message = "Query is required" });
            }

            var results = await _bookService.SearchBooksAsync(query);
            return Ok(results);
        }

        [HttpPost]
        public async Task<IActionResult> AddBook([FromBody] Book book)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { Message = "Invalid user authentication" });
            }

            var addedBook = await _bookService.AddBookAsync(userId, book);
            return Ok(new { Message = "Book added successfully", addedBook.Id });
        }

        [HttpGet]
        public async Task<IActionResult> GetUserBooks()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { Message = "Invalid user authentication" });
            }

            var books = await _bookService.GetUserBooksAsync(userId);
            return Ok(books);
        }

        [HttpPut("{bookId}")]
        public async Task<IActionResult> UpdateBook(int bookId, [FromBody] Book updatedBook)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { Message = "Invalid user authentication" });
            }

            var book = await _bookService.UpdateBookAsync(userId, bookId, updatedBook);
            if (book == null)
            {
                return NotFound(new { Message = "Book not found or not owned by user" });
            }

            return Ok(new { Message = "Book updated successfully", book });
        }

        [HttpDelete("{bookId}")]
        public async Task<IActionResult> DeleteBook(int bookId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { Message = "Invalid user authentication" });
            }

            var success = await _bookService.DeleteBookAsync(userId, bookId);
            if (!success)
            {
                return NotFound(new { Message = "Book not found or not owned by user" });
            }

            return Ok(new { Message = "Book deleted successfully" });
        }

        [HttpPatch("{bookId}/reading-status")]
        public async Task<IActionResult> UpdateReadingStatus(int bookId, [FromBody] UpdateReadingStatusRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { Message = "Invalid user authentication" });
            }

            var book = await _bookService.UpdateReadingStatusAsync(userId, bookId, request.ReadingStatus);
            if (book == null)
            {
                return NotFound(new { Message = "Book not found or not owned by user" });
            }

            return Ok(new { Message = "Reading status updated successfully", book });
        }

        [HttpPatch("{bookId}/favorite")]
        public async Task<IActionResult> UpdateFavoriteStatus(int bookId, [FromBody] UpdateFavoriteRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { Message = "Invalid user authentication" });
            }

            var book = await _bookService.UpdateFavoriteStatusAsync(userId, bookId, request.IsFavorite);
            if (book == null)
            {
                return NotFound(new { Message = "Book not found or not owned by user" });
            }

            return Ok(new { Message = "Favorite status updated successfully", book });
        }
    }

    public class UpdateReadingStatusRequest
    {
        public string ReadingStatus { get; set; } = string.Empty;
    }

    public class UpdateFavoriteRequest
    {
        public bool IsFavorite { get; set; }
    }
}