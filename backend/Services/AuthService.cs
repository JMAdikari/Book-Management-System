using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BookManagementSystem.Models;
using BCrypt.Net;
using BookManagementSystem.Data;

namespace BookManagementSystem.Services
{
    public class AuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<User> Register(User user)
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<string> Login(string email, string password)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            {
                return null;
            }

            return GenerateJwtToken(user);
        }

        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

//   methods for user profile management
        public async Task<User> GetUserProfile(int userId)
        {
            return await _context.Users.FindAsync(userId);
        }

        public async Task<User> UpdateUserProfile(int userId, User updatedUser)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return null;
            }

            user.Username = updatedUser.Username ?? user.Username;
            user.Email = updatedUser.Email ?? user.Email;
            if (!string.IsNullOrEmpty(updatedUser.PasswordHash))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(updatedUser.PasswordHash);
            }

            await _context.SaveChangesAsync();
            return user;
        }
    }
}