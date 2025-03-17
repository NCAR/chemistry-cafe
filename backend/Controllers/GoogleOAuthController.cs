using System.Security.Claims;
using Chemistry_Cafe_API.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Protocols.Configuration;

namespace Chemistry_Cafe_API.Controllers
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
        public async Task<IActionResult> GoogleResponse()
        {
            AuthenticateResult result = await HttpContext.AuthenticateAsync("External");
            if (!result.Succeeded)
            {
                return BadRequest("Google OAuth Http Response did not succeed");
            }

            ClaimsPrincipal? claimsIdentity = _googleOAuthService.GetUserClaims(result);
            if (claimsIdentity == null)
            {
                return BadRequest("Invalid Credentials Passed");
            }

            await HttpContext.SignInAsync("Application", claimsIdentity);
            string redirectUrl = Path.Combine(_frontendHost, "dashboard").Replace('\\', '/');
            return Redirect(redirectUrl);
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
        public UserClaims GetUserClaims()
        {
            ClaimsIdentity? claimsIdentity = HttpContext.User.Identity as ClaimsIdentity;
            if (claimsIdentity == null)
            {
                return new UserClaims
                {
                    NameIdentifier = null,
                    EmailClaim = null,
                };
            }

            return new UserClaims
            {
                NameIdentifier = claimsIdentity.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                EmailClaim = claimsIdentity.FindFirst(ClaimTypes.Email)?.Value
            };
        }
    }
}