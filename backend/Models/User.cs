using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

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

public partial class User
{
    [Key]
    public Guid Id { get; set; }
    public string Username { get; set; } = null!;
    public Role Role { get; set; } = Role.None;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public string? GoogleId { get; set; } 
    public string? OrcidId { get; set; }
}
