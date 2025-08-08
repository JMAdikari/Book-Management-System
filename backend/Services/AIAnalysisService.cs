using BookManagementSystem.Models;

namespace BookManagementSystem.Services
{
    public class AIAnalysisService
    {
        public ReadingAnalysis AnalyzeReadingPatterns(List<Book> userBooks)
        {
            var analysis = new ReadingAnalysis();
            
            if (!userBooks.Any())
            {
                return GetDefaultAnalysis();
            }

            // Analyze reading completion rate
            analysis.CompletionRate = CalculateCompletionRate(userBooks);
            
            // Analyze reading patterns
            analysis.ReadingPattern = AnalyzeReadingPattern(userBooks);
            
            // Generate recommendations
            analysis.Recommendations = GenerateRecommendations(userBooks);
            
            // Calculate reading speed insights
            analysis.ReadingSpeed = CalculateReadingSpeed(userBooks);
            
            // Analyze favorite genres (if we had genre data)
            analysis.FavoriteGenres = AnalyzeFavoriteGenres(userBooks);
            
            // Generate reading streak info
            analysis.ReadingStreak = CalculateReadingStreak(userBooks);
            
            // Provide motivation and insights
            analysis.MotivationalInsight = GenerateMotivationalInsight(userBooks);

            return analysis;
        }

        private double CalculateCompletionRate(List<Book> books)
        {
            if (books.Count == 0) return 0;
            var finishedBooks = books.Count(b => b.ReadingStatus == "Finished");
            return Math.Round((double)finishedBooks / books.Count * 100, 1);
        }

        private string AnalyzeReadingPattern(List<Book> books)
        {
            var finishedBooks = books.Where(b => b.ReadingStatus == "Finished").ToList();
            
            if (finishedBooks.Count < 2)
                return "Building your reading foundation - keep adding books!";

            // Analyze by day of week (simplified simulation)
            var recentBooks = finishedBooks.TakeLast(10).ToList();
            var patterns = new List<string>();

            // Simulate pattern analysis based on book count and timing
            var avgBooksPerMonth = finishedBooks.Count / Math.Max(1, GetMonthsSinceFirstBook(books));
            
            if (avgBooksPerMonth >= 3)
                patterns.Add("highly consistent reader");
            else if (avgBooksPerMonth >= 1.5)
                patterns.Add("steady reading pace");
            else
                patterns.Add("casual reading style");

            // Analyze favorites pattern
            var favoriteRate = (double)books.Count(b => b.IsFavorite) / books.Count;
            if (favoriteRate > 0.3)
                patterns.Add("enthusiastic about most reads");
            else if (favoriteRate > 0.15)
                patterns.Add("selective with favorites");
            else
                patterns.Add("highly discerning reader");

            return string.Join(", ", patterns);
        }

        private List<string> GenerateRecommendations(List<Book> books)
        {
            var recommendations = new List<string>();
            var finishedCount = books.Count(b => b.ReadingStatus == "Finished");
            var readingCount = books.Count(b => b.ReadingStatus == "Reading");
            var wantToReadCount = books.Count(b => b.ReadingStatus == "Want to Read");

            // Reading pace recommendations
            if (readingCount > 5)
                recommendations.Add("Consider focusing on fewer books at once for better retention");
            else if (readingCount == 0 && wantToReadCount > 0)
                recommendations.Add("Pick up one of your 'Want to Read' books and start today!");
            else if (readingCount < 2 && wantToReadCount > 10)
                recommendations.Add("You have a great reading list - start with the one that excites you most");

            // Completion recommendations
            var completionRate = CalculateCompletionRate(books);
            if (completionRate < 30)
                recommendations.Add("Try shorter books or audiobooks to build momentum");
            else if (completionRate > 80)
                recommendations.Add("Excellent completion rate! Consider challenging yourself with longer classics");

            // Diversity recommendations
            var authors = books.Select(b => b.Author).Distinct().ToList();
            if (authors.Count < books.Count * 0.7)
                recommendations.Add("Explore books by new authors to diversify your reading experience");

            // Default motivational recommendation
            if (!recommendations.Any())
                recommendations.Add("Keep up the great reading habit! Consider joining a book club for social motivation");

            return recommendations.Take(3).ToList(); // Limit to top 3 recommendations
        }

        private string CalculateReadingSpeed(List<Book> books)
        {
            var finishedBooks = books.Where(b => b.ReadingStatus == "Finished").ToList();
            
            if (finishedBooks.Count == 0)
                return "Start finishing books to track your reading speed";

            var monthsSinceFirst = GetMonthsSinceFirstBook(books);
            var booksPerMonth = Math.Round((double)finishedBooks.Count / Math.Max(monthsSinceFirst, 1), 1);

            if (booksPerMonth >= 4)
                return $"Excellent: {booksPerMonth} books/month - You're a reading machine!";
            else if (booksPerMonth >= 2)
                return $"Great: {booksPerMonth} books/month - Above average pace";
            else if (booksPerMonth >= 1)
                return $"Good: {booksPerMonth} books/month - Steady reading habit";
            else
                return $"Developing: {booksPerMonth} books/month - Room for growth";
        }

        private List<string> AnalyzeFavoriteGenres(List<Book> books)
        {
            // Since we don't have genre data, we'll simulate based on author/title patterns
            var genres = new List<string>();
            
            var favoriteBooks = books.Where(b => b.IsFavorite).ToList();
            
            if (favoriteBooks.Any())
            {
                // Simulate genre detection (in a real app, you'd have genre data)
                genres.Add("Fiction");
                if (favoriteBooks.Count > 2) genres.Add("Mystery");
                if (favoriteBooks.Count > 4) genres.Add("Science Fiction");
            }
            else
            {
                genres.Add("Still discovering preferences");
            }

            return genres;
        }

        private int CalculateReadingStreak(List<Book> books)
        {
            // Simplified streak calculation - in reality, you'd track daily reading activity
            var finishedBooks = books.Where(b => b.ReadingStatus == "Finished")
                                   .OrderByDescending(b => b.DateAdded)
                                   .ToList();

            if (!finishedBooks.Any()) return 0;

            // Simulate streak based on recent activity
            var recentBooks = finishedBooks.Take(5).ToList();
            return Math.Min(recentBooks.Count * 2, 14); // Max 14 day streak simulation
        }

        private string GenerateMotivationalInsight(List<Book> books)
        {
            var finishedCount = books.Count(b => b.ReadingStatus == "Finished");
            var totalBooks = books.Count;

            var insights = new List<string>
            {
                $"You've built a library of {totalBooks} books - that's impressive dedication!",
                $"With {finishedCount} completed reads, you're expanding your knowledge daily",
                "Every book you read makes you a more interesting person",
                "Reading is the fastest way to live multiple lives and gain diverse perspectives",
                "Your future self will thank you for every book you read today"
            };

            if (finishedCount >= 10)
                insights.Add("You're officially a bibliophile - wear that badge with pride!");
            else if (finishedCount >= 5)
                insights.Add("You're developing an excellent reading habit - keep it up!");

            return insights[new Random().Next(insights.Count)];
        }

        private int GetMonthsSinceFirstBook(List<Book> books)
        {
            if (!books.Any()) return 1;
            
            var firstBookDate = books.Min(b => b.DateAdded);
            var monthsDiff = (DateTime.UtcNow.Year - firstBookDate.Year) * 12 + DateTime.UtcNow.Month - firstBookDate.Month;
            return Math.Max(monthsDiff, 1);
        }

        private ReadingAnalysis GetDefaultAnalysis()
        {
            return new ReadingAnalysis
            {
                CompletionRate = 0,
                ReadingPattern = "Just getting started - add some books to begin your reading journey!",
                Recommendations = new List<string> { "Start by adding a few books you're interested in", "Set a small goal like reading 1 book per month", "Choose a mix of fiction and non-fiction to explore different styles" },
                ReadingSpeed = "Add and finish books to track your reading pace",
                FavoriteGenres = new List<string> { "Discovering preferences" },
                ReadingStreak = 0,
                MotivationalInsight = "Every reading journey begins with a single page - start yours today!"
            };
        }
    }

    public class ReadingAnalysis
    {
        public double CompletionRate { get; set; }
        public string ReadingPattern { get; set; } = string.Empty;
        public List<string> Recommendations { get; set; } = new();
        public string ReadingSpeed { get; set; } = string.Empty;
        public List<string> FavoriteGenres { get; set; } = new();
        public int ReadingStreak { get; set; }
        public string MotivationalInsight { get; set; } = string.Empty;
    }
}
