namespace BookManagementSystem.Models
{
    public class Book
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Author { get; set; }
        public string ISBN { get; set; }
        public string ThumbnailUrl { get; set; }
        public int UserId { get; set; }
        public User User { get; set; }
    }
}