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
        IOptions<UrlOptions>? urlOptions = null,
        OAuthRegistrationService? registrationService = null) 
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
            if( HttpContext != null && HttpContext.Request.Query.TryGetValue("merge", out var merge) && merge=="true")
            {
                authProperties.SetString("merge","true");
            }
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

            bool merge = false;
            if (result.Properties.Items.TryGetValue("merge", out var mergeValue) && mergeValue == "true")
            {
                merge = true;
            }

            var (_, user) = await userService.GetCurrentUserAsync();

            if (user != null || merge)
            {
                ClaimsPrincipal? claimsIdentity = await googleOAuthService.GetUserClaimsAsync(result, merge, user);
                if (claimsIdentity == null)
                {
                    return BadRequest("The account you are trying to link already exists or the credentials passed were invalid. Contact musica-support@ucar.edu for further help.");
                }

                await HttpContext.SignInAsync("Application", claimsIdentity);
                string basePath = Path.Combine(_urls.FrontendHost, "settings").Replace('\\', '/');
                string redirectUrl = QueryHelpers.AddQueryString(basePath, "selectedMenu", "profile");
                return Redirect(redirectUrl);
            }

            Claim? googleId = result.Principal?.FindFirst(ClaimTypes.NameIdentifier);
            Claim? emailClaim = result.Principal?.FindFirst(ClaimTypes.Email);

            if (googleId == null || emailClaim == null)
            {
                return BadRequest("Google OAuth response missing required claims.");
            }

            var existingUser = await userService.GetUserByGoogleIdAsync(googleId.Value);
            if (existingUser != null)
            {
                if (existingUser.Email != emailClaim.Value)
                {
                    await userService.UpdateUserEmailAsync(existingUser.Id, emailClaim.Value);
                }
                ClaimsPrincipal claimsIdentity = googleOAuthService.BuildClaimsPrincipal(existingUser);
                await HttpContext.SignInAsync("Application", claimsIdentity);
                string redirectUrl = Path.Combine(_urls.FrontendHost, "dashboard").Replace('\\', '/');
                return Redirect(redirectUrl);
            }

            if (registrationService != null)
            {
                var pending = new PendingRegistration
                {
                    Provider = "Google",
                    ProviderId = googleId.Value,
                    Email = emailClaim.Value,
                    SuggestedUsername = OAuthRegistrationService.GenerateSuggestedUsername(emailClaim.Value),
                    FirstName = result.Principal?.FindFirst(ClaimTypes.GivenName)?.Value,
                    LastName = result.Principal?.FindFirst(ClaimTypes.Surname)?.Value
                };
                registrationService.SetPendingRegistration(HttpContext, pending);
                string registerUrl = Path.Combine(_urls.FrontendHost, "register").Replace('\\', '/');
                return Redirect(registerUrl);
            }

            ClaimsPrincipal? fallbackIdentity = await googleOAuthService.GetUserClaimsAsync(result, merge, user);
            if (fallbackIdentity == null)
            {
                return BadRequest("The account you are trying to link already exists or the credentials passed were invalid. Contact musica-support@ucar.edu for further help.");
            }

            await HttpContext.SignInAsync("Application", fallbackIdentity);
            return Redirect(Path.Combine(_urls.FrontendHost, "dashboard").Replace('\\', '/'));
        }
    }
}
