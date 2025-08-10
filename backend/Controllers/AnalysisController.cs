using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BookManagementSystem.Services;
using System.Security.Claims;

namespace BookManagementSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AnalysisController : ControllerBase
    {
        private readonly BookService _bookService;
        private readonly AIAnalysisService _aiAnalysisService;

        public AnalysisController(BookService bookService, AIAnalysisService aiAnalysisService)
        {
            _bookService = bookService;
            _aiAnalysisService = aiAnalysisService;
        }

        [HttpGet("reading-analysis")]
        public async Task<IActionResult> GetReadingAnalysis()
        {
            Console.WriteLine("AI Analysis endpoint hit!");
            
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                Console.WriteLine("Authorization failed in AI Analysis");
                return Unauthorized(new { Message = "Invalid user authentication" });
            }

            try
            {
                Console.WriteLine($"Getting books for user {userId}");
                // Get user's books
                var userBooks = await _bookService.GetUserBooksAsync(userId);
                
                Console.WriteLine($"Found {userBooks.Count} books, generating analysis");
                // Generate AI analysis
                var analysis = _aiAnalysisService.AnalyzeReadingPatterns(userBooks);
                
                Console.WriteLine("Analysis generated successfully");
                return Ok(analysis);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"AI Analysis error: {ex.Message}");
                return StatusCode(500, new { Message = "Failed to generate reading analysis", Error = ex.Message });
            }
        }

        [HttpGet("detailed-insights")]
        public async Task<IActionResult> GetDetailedInsights()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { Message = "Invalid user authentication" });
            }

            try
            {
                var userBooks = await _bookService.GetUserBooksAsync(userId);
                var analysis = _aiAnalysisService.AnalyzeReadingPatterns(userBooks);
                
                // Generate additional detailed insights
                var detailedInsights = new
                {
                    BasicAnalysis = analysis,
                    DetailedStats = new
                    {
                        TotalBooks = userBooks.Count,
                        BooksThisYear = userBooks.Count(b => b.DateAdded.Year == DateTime.Now.Year),
                        BooksThisMonth = userBooks.Count(b => b.DateAdded.Month == DateTime.Now.Month && b.DateAdded.Year == DateTime.Now.Year),
                        AverageReadingPace = userBooks.Count > 0 ? Math.Round((double)userBooks.Count(b => b.ReadingStatus == "Finished") / Math.Max(GetMonthsSinceFirstBook(userBooks), 1), 1) : 0,
                        FavoritePercentage = userBooks.Count > 0 ? Math.Round((double)userBooks.Count(b => b.IsFavorite) / userBooks.Count * 100, 1) : 0
                    },
                    ReadingGoalProgress = new
                    {
                        MonthlyProgress = Math.Min(userBooks.Count(b => b.ReadingStatus == "Finished" && b.DateAdded.Month == DateTime.Now.Month), 10),
                        YearlyProgress = userBooks.Count(b => b.ReadingStatus == "Finished" && b.DateAdded.Year == DateTime.Now.Year),
                        Suggestions = GenerateGoalSuggestions(userBooks)
                    }
                };
                
                return Ok(detailedInsights);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Failed to generate detailed insights", Error = ex.Message });
            }
        }

        private int GetMonthsSinceFirstBook(List<Models.Book> books)
        {
            if (!books.Any()) return 1;
            
            var firstBookDate = books.Min(b => b.DateAdded);
            var monthsDiff = (DateTime.UtcNow.Year - firstBookDate.Year) * 12 + DateTime.UtcNow.Month - firstBookDate.Month;
            return Math.Max(monthsDiff, 1);
        }

        private List<string> GenerateGoalSuggestions(List<Models.Book> books)
        {
            var suggestions = new List<string>();
            var finishedThisMonth = books.Count(b => b.ReadingStatus == "Finished" && b.DateAdded.Month == DateTime.Now.Month);
            var readingCount = books.Count(b => b.ReadingStatus == "Reading");

            if (finishedThisMonth == 0)
                suggestions.Add("Aim to finish at least 1 book this month");
            else if (finishedThisMonth >= 3)
                suggestions.Add("You're exceeding expectations! Consider a slightly higher monthly goal");

            if (readingCount == 0)
                suggestions.Add("Start reading a book from your 'Want to Read' list");
            else if (readingCount > 3)
                suggestions.Add("Focus on finishing current books before starting new ones");

            return suggestions;
        }
    }
}
