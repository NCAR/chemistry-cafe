using System.Text.Json.Serialization;

namespace Chemistry_Cafe_API.Models
{
    /// <summary>
    /// Represents a user's authentication claims. 
    /// These are set in the user's cookies when the user logs in.
    /// </summary>
    public partial class UserClaims
    {
        [JsonPropertyName("nameId")]
        public string? NameIdentifier { get; set; }

        [JsonPropertyName("email")]
        public string? EmailClaim { get; set; }
    }
}