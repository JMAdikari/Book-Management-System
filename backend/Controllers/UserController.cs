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
    public class UserController : ControllerBase
    {
        private readonly AuthService _authService;

        public UserController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var user = await _authService.GetUserProfile(userId);
            if (user == null)
            {
                return NotFound(new { Message = "User not found" });
            }

            return Ok(new { user.Id, user.Username, user.Email });
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var updatedUser = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = request.Password
            };

            var result = await _authService.UpdateUserProfile(userId, updatedUser);
            if (result == null)
            {
                return NotFound(new { Message = "User not found" });
            }

            return Ok(new { Message = "Profile updated successfully", result.Id, result.Username, result.Email });
        }
    }

    public class UpdateProfileRequest
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }
}