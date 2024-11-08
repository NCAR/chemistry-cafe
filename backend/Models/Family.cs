using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization; // Added for JsonPropertyName
using Microsoft.EntityFrameworkCore;

namespace Chemistry_Cafe_API.Models;

[Table("families")]
[Index("Name", Name = "name", IsUnique = true)]
public partial class Family
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("name")]
    [JsonPropertyName("name")]
    public string Name { get; set; } = null!;

    [Column("description", TypeName = "text")]
    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [Column("created_by")]
    [StringLength(255)]
    [JsonPropertyName("created_by")]
    public string? CreatedBy { get; set; }

    [Column("created_date", TypeName = "timestamp")]
    [JsonPropertyName("created_date")]
    public DateTime? CreatedDate { get; set; }

    [InverseProperty("Family")]
    public virtual ICollection<Mechanism> Mechanisms { get; set; } = new List<Mechanism>();
}
