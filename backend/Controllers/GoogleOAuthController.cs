using System.Security.Claims;
using System.Diagnostics.CodeAnalysis;
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

        private readonly string _baseUri = Environment.GetEnvironmentVariable("BACKEND_BASE_URL") ?? "";
        private readonly string _frontendHost = Environment.GetEnvironmentVariable("FRONTEND_HOST") ?? "";
        public GoogleOAuthController(GoogleOAuthService googleOAuthService)
        {
            _googleOAuthService = googleOAuthService;
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
        [ExcludeFromCodeCoverage]
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
    }
}
