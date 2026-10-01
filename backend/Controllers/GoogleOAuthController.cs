using System.Security.Claims;
using System.Diagnostics.CodeAnalysis;
using ChemistryCafeAPI.Models;
using ChemistryCafeAPI.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
using ChemistryCafeAPI.Options;

namespace ChemistryCafeAPI.Controllers
{
    /// <summary>
    /// Controls routes related to Google OAuth 2.0 authentication
    /// </summary>
    [AllowAnonymous]
    [Route("/auth/google")]
    public class GoogleOAuthController(
        GoogleOAuthService googleOAuthService, 
        UserService userService, 
        IOptions<UrlOptions>? urlOptions = null) 
        : Controller
    {
        private readonly UrlOptions _urls = urlOptions?.Value ?? new UrlOptions();

        /// <summary>
        /// Route which the user redirects to a google authentication page 
        /// </summary>
        [HttpGet("login")]
        public IActionResult LoginRedirect()
        {
            string redirectUri = Path.Combine(_urls.BackendBaseUrl, "auth/google/authenticate").Replace('\\', '/');
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
            
            var (_, user) = await userService.GetCurrentUserAsync();
            
            ClaimsPrincipal? claimsIdentity = await googleOAuthService.GetUserClaimsAsync(result, user);
            if (claimsIdentity == null)
            {
                return BadRequest("The account you are trying to link already exists or the credentials passed were invalid. Contact musica-support@ucar.edu for further help.");
            }

            await HttpContext.SignInAsync("Application", claimsIdentity);
            string basePath = Path.Combine(_urls.FrontendHost, user == null ? "dashboard" : "settings").Replace('\\', '/');
            string redirectUrl = user == null ? basePath : QueryHelpers.AddQueryString(basePath, "selectedMenu", "profile");
            RedirectResult ret = Redirect(redirectUrl);
            return ret;
        }
    }
}
