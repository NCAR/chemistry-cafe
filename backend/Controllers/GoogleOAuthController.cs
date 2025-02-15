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
        private readonly IConfiguration _configuration;
        public GoogleOAuthController(IConfiguration configuration, GoogleOAuthService googleOAuthService)
        {
            _googleOAuthService = googleOAuthService;
            _configuration = configuration;
        }

        /// <summary>
        /// Route which the user redirects to a google authentication page 
        /// </summary>
        [HttpGet("login")]
        public IActionResult LoginRedirect()
        {
            AuthenticationProperties authProperties = new AuthenticationProperties { RedirectUri = "/auth/google/authenticate" };
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
            string redirectUrl = (_configuration["FrontendHost"] ?? throw new InvalidConfigurationException("")) + "/LoggedIn";
            return Redirect(redirectUrl);
        }

        /// <summary>
        /// Removes all authentication cookies and signs a user out of the backend application
        /// </summary>
        [Authorize]
        [HttpGet("logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync("Application");

            var request = HttpContext.Request;
            var cookies = request.Cookies;
            if (cookies.Count > 0)
            {
                foreach (var cookie in cookies)
                {
                    if (cookie.Key.Contains(".AspNetCore.") || cookie.Key.Contains("Microsoft.Authentication"))
                    {
                        Response.Cookies.Delete(cookie.Key);
                    }
                }
            }

            string redirectUrl = _configuration["FrontendHost"] ?? throw new InvalidConfigurationException("'FrontendHost' key not set in appsettings");
            return Redirect(redirectUrl);
        }
        
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