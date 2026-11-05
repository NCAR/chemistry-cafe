namespace ChemistryCafeAPI.Models;

public class PendingRegistration
{
    public string Provider { get; set; } = null!;
    public string ProviderId { get; set; } = null!;
    public string? Email { get; set; }
    public string? SuggestedUsername { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

