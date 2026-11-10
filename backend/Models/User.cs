using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;

namespace ChemistryCafeAPI.Models;

/// <summary>
/// The role of a user. The database stores the number of each value, so do not change the numbers.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum Role
{
    None = 0,
    Verifier = 1,
    Admin = 2
}

[Index("Username", Name = "idx_users_username", IsUnique = true)]
public partial class User
{
    [Key]
    public Guid Id { get; set; }
    [MaxLength(255)]
    public string Username { get; set; } = null!;
    public Role Role { get; set; } = Role.None;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public string? GoogleId { get; set; } 
    public string? OrcidId { get; set; }

    /// <summary>
    /// Returns the user's full name if available, otherwise their username.
    /// </summary>
    public string GetDisplayName() =>
        !string.IsNullOrWhiteSpace(FirstName) || !string.IsNullOrWhiteSpace(LastName)
            ? $"{FirstName ?? ""} {LastName ?? ""}".Trim()
            : Username;
}
