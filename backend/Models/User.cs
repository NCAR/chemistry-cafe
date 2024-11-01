using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chemistry_Cafe_API.Models;

[Table("users")]
[Index("Username", Name = "idx_users_username", IsUnique = true)]
public partial class User
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("username")]
    public string Username { get; set; } = null!;

    [Column("role")]
    [StringLength(50)]
    public string Role { get; set; } = null!;

    [Column("email")]
    [StringLength(255)]
    public string? Email { get; set; }

    [Column("created_date", TypeName = "timestamp")]
    public DateTime? CreatedDate { get; set; }

    [InverseProperty("User")]
    public virtual ICollection<UserMechanism> UserMechanisms { get; set; } = new List<UserMechanism>();
}
