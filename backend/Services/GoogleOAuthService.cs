
using System.Security.Claims;
using ChemistryCafeAPI.Models;
using System.Diagnostics.CodeAnalysis;
using Microsoft.AspNetCore.Authentication;

namespace ChemistryCafeAPI.Services
{
    /// <summary>
    /// Adapted from: https://blog.rashik.com.np/adding-google-authentication-in-net-core-application-without-identity/
    /// </summary>
    public class GoogleOAuthService(UserService userService)
    {

        public readonly UserService UserService = userService;

        [ExcludeFromCodeCoverage]
        private static bool IsGoogleIdentity(ClaimsIdentity identity)
        {
            return identity.AuthenticationType != null && 
                   identity.AuthenticationType.Equals("google", StringComparison.OrdinalIgnoreCase);
        }

        /// <summary>
        /// Parses an OAuth challenge result and turns them into a user's claims
        /// </summary>
        /// <param name="authenticateResult">Result of Google OAuth Challenge</param>
        /// <param name="prev">current user</param>
        /// <returns>ClaimsPrincipal object which holds the user's auth informations</returns>
        [ExcludeFromCodeCoverage]
        public async Task<ClaimsPrincipal?> GetUserClaimsAsync(AuthenticateResult authenticateResult,User? prev)
        {
            if (authenticateResult.Principal == null)
            {
                return null;
            }
            var identity = authenticateResult.Principal.Identities.FirstOrDefault(IsGoogleIdentity);
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
            
            User user = prev!=null?await UserService.LinkGoogle(prev,googleId.Value, emailClaim.Value) :await UserService.SignInGoogle(googleId.Value, emailClaim.Value);

            Claim nameIdClaim = new Claim(ClaimTypes.NameIdentifier, user.Id.ToString());

            claimsIdentity.AddClaim(nameIdClaim);
            claimsIdentity.AddClaim(emailClaim);
            claimsIdentity.AddClaim(new Claim(ClaimTypes.Role, user.Role));
            return new ClaimsPrincipal(claimsIdentity);
        }
    }
}
