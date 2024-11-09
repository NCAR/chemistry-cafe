using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization; // Added
using Microsoft.EntityFrameworkCore;

namespace Chemistry_Cafe_API.Models;

[Table("reaction_species")]
[Index("SpeciesId", Name = "species_id")]
[Index("ReactionId", "SpeciesId", "Role", Name = "unique_reaction_species_role", IsUnique = true)]
public partial class ReactionSpecies
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("reaction_id")]
    [JsonPropertyName("reaction_id")]
    public Guid ReactionId { get; set; }

    [Column("species_id")]
    [JsonPropertyName("species_id")]
    public Guid SpeciesId { get; set; }

    [Column("role", TypeName = "enum('reactant','product')")]
    [JsonPropertyName("role")]
    public string Role { get; set; } = null!;

    [Column("quantity")]
    [JsonPropertyName("quantity")]
    public decimal Quantity { get; set; }

    [ForeignKey("ReactionId")]
    [InverseProperty("ReactionSpecies")]
    public virtual Reaction Reaction { get; set; } = null!;

    [ForeignKey("SpeciesId")]
    [InverseProperty("ReactionSpecies")]
    public virtual Species Species { get; set; } = null!;
}
