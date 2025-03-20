using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

namespace ChemistryCafeAPI.Models;

[Index(nameof(Username), IsUnique = true)]
public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Username { get; set; } = null!;
    public string Role { get; set; } = null!;
    public string? Email { get; set; }
    public DateTime? CreatedDate { get; set; } = DateTime.UtcNow;
    public string? GoogleId { get; set; }

    public virtual List<Family> OwnedFamilies { get; set; } = new List<Family>();
}

