
using System.Security.Claims;
using ChemistryCafeAPI.Models;
using System.Diagnostics.CodeAnalysis;
using Microsoft.AspNetCore.Authentication;

namespace ChemistryCafeAPI.Services
{
    /// <summary>
    /// Adapted from: https://blog.rashik.com.np/adding-google-authentication-in-net-core-application-without-identity/
    /// </summary>
    public class OrcidOAuthService(UserService userService)
    {

        public readonly UserService UserService=userService;

        [ExcludeFromCodeCoverage]
        private static bool IsOrcidIdentity(ClaimsIdentity identity)
        {
            return identity.AuthenticationType != null && 
                   identity.AuthenticationType.Equals("Orcid", StringComparison.OrdinalIgnoreCase);
        }

        /// <summary>
        /// Parses an OAuth challenge result and turns them into a user's claims
        /// </summary>
        /// <param name="authenticateResult">Result of ORCID OAuth Challenge</param>
        /// <param name="prev">current user</param>
        /// <returns>ClaimsPrincipal object which holds the user's auth informations</returns>
        [ExcludeFromCodeCoverage]
        public async Task<ClaimsPrincipal?> GetUserClaimsAsync(AuthenticateResult authenticateResult,User? prev)
        {
            if (authenticateResult.Principal == null)
            {
                return null;
            }
            var identity = authenticateResult.Principal.Identities.FirstOrDefault(IsOrcidIdentity);
            if (identity == null) 
            {
                return null;
            }
            ClaimsIdentity claimsIdentity = new ClaimsIdentity("Application");
            Claim? orcidId = authenticateResult.Principal.FindFirst(ClaimTypes.NameIdentifier); // Name Identifier of the **Orcid** account
            Claim? nameClaim = authenticateResult.Principal.FindFirst(ClaimTypes.Name);

            if (orcidId == null)
            {
                return null;
            }
            string displayName = nameClaim?.Value ?? "ORCID User";

            User user = prev!=null?await UserService.LinkOrcid(prev,orcidId.Value,displayName): await UserService.SignInOrcid(orcidId.Value, displayName);

            Claim nameIdClaim = new Claim(ClaimTypes.NameIdentifier, user.Id.ToString());

            claimsIdentity.AddClaim(nameIdClaim);
            claimsIdentity.AddClaim(new Claim(ClaimTypes.Name, user.Username ?? displayName));
            claimsIdentity.AddClaim(new Claim(ClaimTypes.Role, user.Role));
            return new ClaimsPrincipal(claimsIdentity);
        }
    }
}
