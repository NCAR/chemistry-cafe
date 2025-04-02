
using System.Security.Claims;
using ChemistryCafeAPI.Models;
using ChemistryCafeAPI.Services;
using Microsoft.AspNetCore.Authentication;

namespace ChemistryCafeAPI.Controllers
{
    /// <summary>
    /// Adapted from: https://blog.rashik.com.np/adding-google-authentication-in-net-core-application-without-identity/
    /// </summary>
    public class GoogleOAuthService
    {

        private readonly UserService _userService;

        public GoogleOAuthService(UserService userService)
        {
            _userService = userService;
        }

        /// <summary>
        /// Parses an OAuth challenge result and turns them into a user's claims
        /// </summary>
        /// <param name="authenticateResult">Result of Google OAuth Challenge</param>
        /// <returns>ClaimsPrincipal object which holds the user's auth informations</returns>
        public async Task<ClaimsPrincipal?> GetUserClaimsAsync(AuthenticateResult authenticateResult)
        {
            if (authenticateResult.Principal == null)
            {
                return null;
            }
            var identity = authenticateResult.Principal.Identities.FirstOrDefault(
                identity => identity.AuthenticationType != null && 
                            identity.AuthenticationType.Equals("google", StringComparison.OrdinalIgnoreCase)
            );
            if (identity == null) 
            {
                return null;
            }
            ClaimsIdentity claimsIdentity = new ClaimsIdentity("Application");
            Claim? googleId = authenticateResult.Principal.FindFirst(ClaimTypes.NameIdentifier); // Name Identifier of the **Google** account
            Claim? emailClaim = authenticateResult.Principal.FindFirst(ClaimTypes.Email);

            if (googleId == null || emailClaim == null)
            {
                return null;
            }

            User user = await _userService.SignIn(googleId.Value, emailClaim.Value);

            Claim nameIdClaim = new Claim(ClaimTypes.NameIdentifier, user.Id.ToString());

            claimsIdentity.AddClaim(nameIdClaim);
            claimsIdentity.AddClaim(emailClaim);
            return new ClaimsPrincipal(claimsIdentity);
        }
    }
}
