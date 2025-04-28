using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Diagnostics.CodeAnalysis;
using ChemistryCafeAPI.Models;
using ChemistryCafeAPI.Services;

namespace ChemistryCafeAPI.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UsersController : ControllerBase
    {
        private readonly UserService _userService;

        [ExcludeFromCodeCoverage]
        protected virtual string? GetNameIdentifier()
        {
            ClaimsIdentity? claimsIdentity = this.User.Identity as ClaimsIdentity;
            return claimsIdentity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        public UsersController(UserService userService)
        {
            _userService = userService;
        }

        // GET: api/Users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            var users = await _userService.GetUsersAsync();
            return Ok(users);
        }

        [HttpGet("id/{id}")]
        public async Task<ActionResult<User>> GetUserById(Guid id)
        {
            var user = await _userService.GetUserByIdAsync(id);

            if (user == null)
            {
                return NotFound();
            }
            return Ok(user);
        }

        // GET: api/Users/5
        [HttpGet("email/{email}")]
        public async Task<ActionResult<User>> GetUser(string email)
        {
            var user = await _userService.GetUserByEmailAsync(email);

            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        // PUT: api/Users/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(Guid id, User user)
        {
            if (id != user.Id)
            {
                return BadRequest();
            }

            string? nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null)
            {
                return Unauthorized("User is not authenticated");
            }

            var result = await _userService.UpdateUserAsync(user, nameIdentifier);
            switch (result)
            {
                case QueryResult.NotFound:
                    return NotFound("Either the principal user or user being updated were not found");
                case QueryResult.NoAccess:
                    return StatusCode(StatusCodes.Status403Forbidden);
                case QueryResult.ParseError:
                    return BadRequest("Invalid UUID format for user's name identifier claim");
            }
            return NoContent();
        }

        // DELETE: api/Users/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            string? nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null)
            {
                return Unauthorized("User is not authenticated");
            }

            var result = await _userService.DeleteUserAsync(id, nameIdentifier);

            switch (result)
            {
                case QueryResult.NotFound:
                    return NotFound("Either the principal user or user being updated were not found");
                case QueryResult.NoAccess:
                    return StatusCode(StatusCodes.Status403Forbidden);
                case QueryResult.ParseError:
                    return BadRequest("Invalid UUID format for user's name identifier claim");
            }

            return NoContent();
        }
    }
}
