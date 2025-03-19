using Microsoft.EntityFrameworkCore;

namespace ChemistryCafeAPI.Models;

[Index(nameof(Username), IsUnique = true)]
public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Username { get; set; }
    public string Role { get; set; }
    public string? Email { get; set; }
    public DateTime? CreatedDate { get; set; } = DateTime.UtcNow;
    public string? GoogleId { get; set; }

    // public ICollection<UserMechanism> UserMechanisms { get; set; } = new List<UserMechanism>();
}