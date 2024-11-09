using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization; // Added
using Microsoft.EntityFrameworkCore;

namespace Chemistry_Cafe_API.Models;

[Table("mechanism_versions")]
[Index("MechanismId", "VersionNumber", Name = "unique_mechanism_version", IsUnique = true)]
public partial class MechanismVersion
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("mechanism_id")]
    [JsonPropertyName("mechanism_id")]
    public Guid MechanismId { get; set; }

    [Column("version_number")]
    [JsonPropertyName("version_number")]
    public int VersionNumber { get; set; }

    [Column("tag")]
    [StringLength(50)]
    [JsonPropertyName("tag")]
    public string? Tag { get; set; }

    [Column("created_by")]
    [StringLength(255)]
    [JsonPropertyName("created_by")]
    public string? CreatedBy { get; set; }

    [Column("published_date", TypeName = "timestamp")]
    [JsonPropertyName("published_date")]
    public DateTime? PublishedDate { get; set; }

    [ForeignKey("MechanismId")]
    [InverseProperty("MechanismVersions")]
    public virtual Mechanism? Mechanism { get; set; } = null!;
}
