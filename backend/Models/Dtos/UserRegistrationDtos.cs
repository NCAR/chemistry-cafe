namespace ChemistryCafeAPI.Models.Dtos;

public class PendingRegistrationDto
{
    public string Provider { get; set; } = null!;
    public string? Email { get; set; }
    public string? SuggestedUsername { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
}

public class UsernameAvailabilityDto
{
    public bool Available { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class RegisterUserDto
{
    public string Username { get; set; } = null!;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
}

