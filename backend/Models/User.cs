using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chemistry_Cafe_API.Models;

[Index("Username", Name = "idx_users_username", IsUnique = true)]
public partial class User
{
    public Guid Id { get; set; }
    public string Username { get; set; } = null!;
    public string Role { get; set; } = null!;
    public string? Email { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public string? GoogleId { get; set; } 
}
