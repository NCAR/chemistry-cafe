using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization; // Added
using Microsoft.EntityFrameworkCore;

namespace Chemistry_Cafe_API.Models;

[Table("reactions")]
[Index(nameof(Name), Name = "name_idx", IsUnique = true)]
public partial class Reaction
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("name")]
    [StringLength(512)]
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

    [InverseProperty("Reaction")]
    public virtual ICollection<MechanismReaction> MechanismReactions { get; set; } = new List<MechanismReaction>();

    [InverseProperty("Reaction")]
    public virtual ICollection<ReactionSpecies> ReactionSpecies { get; set; } = new List<ReactionSpecies>();
}
