namespace BookManagementSystem.Models
{
    public class Book
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string? ISBN { get; set; }
        public string? ThumbnailUrl { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        public bool IsFavorite { get; set; } = false;
        public string ReadingStatus { get; set; } = "Want to Read"; // "Want to Read", "Reading", "Finished"
        public DateTime DateAdded { get; set; } = DateTime.UtcNow;
    }
}