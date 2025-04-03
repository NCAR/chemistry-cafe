using System.Security.Claims;
using ChemistryCafeAPI.Models;
using ChemistryCafeAPI.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Mvc;

namespace ChemistryCafeAPI.Controllers
{
    /// <summary>
    /// Controls routes related to Google OAuth 2.0 authentication
    /// </summary>
    [Route("/auth/google")]
    public class GoogleOAuthController : Controller
    {
        private readonly GoogleOAuthService _googleOAuthService;
        private readonly UserService _userService;

        private readonly string _baseUri = Environment.GetEnvironmentVariable("BACKEND_BASE_URL") ?? "";
        private readonly string _frontendHost = Environment.GetEnvironmentVariable("FRONTEND_HOST") ?? "";
        private readonly IConfiguration _configuration;
        public GoogleOAuthController(IConfiguration configuration, GoogleOAuthService googleOAuthService, UserService userService)
        {
            _googleOAuthService = googleOAuthService;
            _configuration = configuration;
            _userService = userService;
        }

        /// <summary>
        /// Route which the user redirects to a google authentication page 
        /// </summary>
        [HttpGet("login")]
        public IActionResult LoginRedirect()
        {
            string redirectUri = Path.Combine(_baseUri, "auth/google/authenticate").Replace('\\', '/');
            AuthenticationProperties authProperties = new AuthenticationProperties { RedirectUri = redirectUri };
            authProperties.SetParameter("prompt", "select_account");
            return new ChallengeResult(GoogleDefaults.AuthenticationScheme, authProperties);
        }

        /// <summary>
        /// Route that user will be redirected to after signing in with Google OAuth.
        /// This route essentially sets a user's information in a cookie.
        /// </summary>
        [HttpGet("authenticate")]
        public async Task<IActionResult> GoogleResponse()
        {
            AuthenticateResult result = await HttpContext.AuthenticateAsync("External");
            if (!result.Succeeded)
            {
                return BadRequest("Google OAuth Http Response did not succeed");
            }

            ClaimsPrincipal? claimsIdentity = await _googleOAuthService.GetUserClaimsAsync(result);
            if (claimsIdentity == null)
            {
                return BadRequest("Invalid Credentials Passed");
            }

            await HttpContext.SignInAsync("Application", claimsIdentity);
            string redirectUrl = Path.Combine(_frontendHost, "dashboard").Replace('\\', '/');
            RedirectResult ret = Redirect(redirectUrl);
            return ret;
        }

        /// <summary>
        /// Removes all authentication cookies and signs a user out of the backend application
        /// </summary>
        [HttpGet("logout")]
        public async Task<IActionResult> Logout(string? returnUrl)
        {
            // Ensure the redirect url is 
            if (returnUrl == null || returnUrl.Equals(""))
            {
                returnUrl = _frontendHost;
            }
            else if (!Url.IsLocalUrl(returnUrl) && !returnUrl.StartsWith(_frontendHost))
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

        /// <summary>
        /// Gives the user information on themselves
        /// </summary>
        [HttpGet("whoami")]
        public async Task<User> GetCurrentUser()
        {
            ClaimsIdentity? claimsIdentity = this.User.Identity as ClaimsIdentity;
            var nameIdentifier = claimsIdentity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var guid = Guid.Parse(nameIdentifier);
            return await _userService.GetUserByIdAsync(guid);
        }
    }
}
