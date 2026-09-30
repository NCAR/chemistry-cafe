using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Diagnostics.CodeAnalysis;
using ChemistryCafeAPI.Models;
using ChemistryCafeAPI.Services;
using Microsoft.AspNetCore.Http.HttpResults;

namespace ChemistryCafeAPI.Controllers
{
    public class BaseHelperController(UserService userService) : Controller
    {
        protected readonly UserService UserService = userService;
        
        protected readonly string FrontendHost = Environment.GetEnvironmentVariable("FRONTEND_HOST") ?? "";
        protected readonly string BaseUri = Environment.GetEnvironmentVariable("BACKEND_BASE_URL") ?? "";
        
        /// <summary>
        /// Gives the current sessions UserID or null if they don't have one
        /// </summary>
        [ExcludeFromCodeCoverage]
        protected virtual string? GetNameIdentifier()
        {
            ClaimsIdentity? claimsIdentity = this.User.Identity as ClaimsIdentity;
            return claimsIdentity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }
        
        /// <summary>
        /// Gives the user information on themselves
        /// </summary>
        protected async Task<ActionResult<User?>> GetCurrentUser()
        {
            var nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null) {
                return Unauthorized();
            }

            Guid guid;
            bool isValidId = Guid.TryParse(nameIdentifier, out guid);
            if (!isValidId)
            {
                return BadRequest("Name identifier is not parsable as a guid");
            }
            var user = await UserService.GetUserByIdAsync(guid);
            return Ok(user);
        }
    }
}
