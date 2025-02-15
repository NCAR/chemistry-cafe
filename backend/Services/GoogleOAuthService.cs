
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;

namespace Chemistry_Cafe_API.Controllers
{
    /// <summary>
    /// Adapted from: https://blog.rashik.com.np/adding-google-authentication-in-net-core-application-without-identity/
    /// </summary>
    public class GoogleOAuthService
    {
        /// <summary>
        /// Parses an OAuth challenge result and turns them into a user's claims
        /// </summary>
        /// <param name="authenticateResult">Result of Google OAuth Challenge</param>
        /// <returns>ClaimsPrincipal object which holds the user's auth informations</returns>
        public ClaimsPrincipal? GetUserClaims(AuthenticateResult authenticateResult)
        {
            if (authenticateResult == null || authenticateResult.Principal == null)
            {
                return null;
            }

            var identityList = authenticateResult.Principal.Identities.ToList();
            if (authenticateResult.Principal != null && identityList.Count > 0)
            {
                var identity = identityList[0];
                if (identity.AuthenticationType != null && identity.AuthenticationType.ToLower().Equals("google"))
                {
                    var claimsIdentity = new ClaimsIdentity("Application");
                    var googleUserId = authenticateResult.Principal.FindFirst(ClaimTypes.NameIdentifier);
                    var nameIdClaim = authenticateResult.Principal.FindFirst(ClaimTypes.NameIdentifier);
                    var emailClaim = authenticateResult.Principal.FindFirst(ClaimTypes.Email);

                    if (nameIdClaim != null && emailClaim != null && googleUserId != null)
                    {
                        claimsIdentity.AddClaim(nameIdClaim);
                        claimsIdentity.AddClaim(emailClaim);
                        claimsIdentity.AddClaim(googleUserId);
                    }
                    else
                    {
                        return null;
                    }
                    return new ClaimsPrincipal(claimsIdentity);
                }
                else
                {
                    return null;
                }
            }
            return null;
        }
    }
}