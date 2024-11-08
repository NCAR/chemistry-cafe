using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization; // Added
using Microsoft.EntityFrameworkCore;

namespace Chemistry_Cafe_API.Models;

[Table("user_mechanisms")]
[Index("MechanismId", Name = "mechanism_id")]
[Index("UserId", "MechanismId", "Role", Name = "unique_user_mechanism_role", IsUnique = true)]
public partial class UserMechanism
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    [JsonPropertyName("user_id")]
    public Guid UserId { get; set; }

    [Column("mechanism_id")]
    [JsonPropertyName("mechanism_id")]
    public Guid MechanismId { get; set; }

    [Column("role")]
    [StringLength(50)]
    [JsonPropertyName("role")]
    public string? Role { get; set; }

    [ForeignKey("MechanismId")]
    [InverseProperty("UserMechanisms")]
    public virtual Mechanism Mechanism { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("UserMechanisms")]
    public virtual User User { get; set; } = null!;
}
