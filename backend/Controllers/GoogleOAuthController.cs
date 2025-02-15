using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Mvc;

namespace Chemistry_Cafe_API.Controllers
{
    /// <summary>
    /// Controls routes related to Google OAuth 2.0 authentication
    /// </summary>
    [Route("/auth/google")]
    public class GoogleOAuthController : Controller
    {
        private readonly GoogleOAuthService _googleOAuthService;
        public GoogleOAuthController(GoogleOAuthService googleOAuthService)
        {
            _googleOAuthService = googleOAuthService;
        }

        [HttpGet("login")]
        public IActionResult LoginRedirect()
        {
            AuthenticationProperties authProperties = new AuthenticationProperties { RedirectUri = "/auth/google/authenticate" };
            return new ChallengeResult(GoogleDefaults.AuthenticationScheme, authProperties);
        }

        [HttpGet("authenticate")]
        public async Task<IActionResult> GoogleResponse()
        {
            AuthenticateResult result = await HttpContext.AuthenticateAsync("External");
            if (!result.Succeeded)
            {
                return BadRequest("Google OAuth Http Response did not succeed");
            }

            var claimsIdentity = _googleOAuthService.GetUserClaims(result);
            if (claimsIdentity == null)
            {
                return BadRequest("Invalid Credentials Passed");
            }

            await HttpContext.SignInAsync("Application", claimsIdentity);
            return Redirect("/swagger");
        }
    }
}