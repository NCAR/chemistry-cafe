
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;

namespace ChemistryCafeAPI.Services;

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
        var claimsIdentity = new ClaimsIdentity("Application");
        var nameIdClaim = authenticateResult.Principal.FindFirst(ClaimTypes.NameIdentifier); // GUID specified by Google
        var emailClaim = authenticateResult.Principal.FindFirst(ClaimTypes.Email);
        if (nameIdClaim == null || emailClaim == null)
        {
            return null;
        }
        claimsIdentity.AddClaim(nameIdClaim);
        claimsIdentity.AddClaim(emailClaim);
        return new ClaimsPrincipal(claimsIdentity);
    }
}
