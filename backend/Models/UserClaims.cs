namespace ChemistryCafeAPI.Models;

/// <summary>
/// Represents a user's authentication claims. 
/// These are set in the user's cookies when the user logs in.
/// </summary>
public class UserClaims
{
    public string? NameIdentifier { get; set; }
    public string? EmailClaim { get; set; }
}