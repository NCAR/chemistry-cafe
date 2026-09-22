using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Diagnostics.CodeAnalysis;
using ChemistryCafeAPI.Models;
using ChemistryCafeAPI.Services;
using Microsoft.AspNetCore.Authentication;

namespace ChemistryCafeAPI.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UsersController : ControllerBase
    {
        private readonly UserService _userService;
        
        private readonly string _frontendHost = Environment.GetEnvironmentVariable("FRONTEND_HOST") ?? "";


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
        /// <summary>
        /// Gives the user information on themselves
        /// </summary>
        [HttpGet("whoami")]
        public async Task<ActionResult<User?>> GetCurrentUser()
        {
            var nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null) {
                return Unauthorized();
            }
            var guid = Guid.Parse(nameIdentifier);
            var user = await _userService.GetUserByIdAsync(guid);
            return Ok(user);
        }
        /// <summary>
        /// Removes all authentication cookies and signs a user out of the backend application
        /// </summary>
        [HttpGet("logout")]
        [ExcludeFromCodeCoverage]
        public async Task<IActionResult> Logout(string? returnUrl)
        {
            // Ensure the redirect url is 
            if (returnUrl == null || returnUrl.Equals(""))
            {
                returnUrl = _frontendHost;
            }
            else if (!Url.IsLocalUrl(returnUrl) && !IsSameOriginAsFrontend(returnUrl))
            {
                return BadRequest("Invalid returnUrl argument. Must be within application scope.");
            }

            await HttpContext.SignOutAsync("Application");

            var request = HttpContext.Request;
            var cookies = request.Cookies;
            foreach (var cookie in cookies)
            {
                if (cookie.Key.Contains(".AspNetCore.") || cookie.Key.Contains("Microsoft.Authentication"))
                {
                    Response.Cookies.Delete(cookie.Key);
                }
            }

            return Redirect(returnUrl);
        }
    }
}
