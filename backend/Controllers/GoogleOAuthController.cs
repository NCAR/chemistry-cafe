using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Mvc;

namespace Chemistry_Cafe_API.Controllers
{
    /// <summary>
    /// Adapted from: https://blog.rashik.com.np/adding-google-authentication-in-net-core-application-without-identity/
    /// 
    /// Redirects user to a google login page
    /// </summary>
    [Route("/auth/google")]
    public class GoogleOAuthController : Controller
    {
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

            var identityList = result.Principal.Identities.ToList();
            if (result.Principal != null && identityList.Count > 0)
            {
                var identity = identityList[0];
                if (identity.AuthenticationType != null && identity.AuthenticationType.ToLower().Equals("google"))
                {
                    var googleUserId = result.Principal.FindFirst(ClaimTypes.NameIdentifier);
                    var claimsIdentity = new ClaimsIdentity("Application");
                    var nameIdClaim = result.Principal.FindFirst(ClaimTypes.NameIdentifier);
                    var emailClaim = result.Principal.FindFirst(ClaimTypes.Email);

                    if (nameIdClaim != null && emailClaim != null && googleUserId != null)
                    {
                        claimsIdentity.AddClaim(nameIdClaim);
                        claimsIdentity.AddClaim(emailClaim);
                        claimsIdentity.AddClaim(googleUserId);
                    }
                    else
                    {
                        return BadRequest("Invalid Claims");
                    }
                    await HttpContext.SignInAsync("Application", new ClaimsPrincipal(claimsIdentity));
                    return Redirect("/swagger");
                }
                else
                {
                    return BadRequest("Principal or Identity is null");
                }
            }

            return Redirect("/swagger");
        }
    }
}