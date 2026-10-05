using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace ChemistryCafeAPI.Models;

public partial class User
{
    public Guid Id { get; set; }
    public string Username { get; set; } = null!;
    public string Role { get; set; } = null!;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public string? GoogleId { get; set; } 
    public string? OrcidId { get; set; }
}
