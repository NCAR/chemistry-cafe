using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chemistry_Cafe_API.Models;

[Table("reaction_species")]
[Index("SpeciesId", Name = "species_id")]
[Index("ReactionId", "SpeciesId", "Role", Name = "unique_reaction_species_role", IsUnique = true)]
public partial class ReactionSpecy
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("reaction_id")]
    public int ReactionId { get; set; }

    [Column("species_id")]
    public int SpeciesId { get; set; }

    [Column("role", TypeName = "enum('reactant','product')")]
    public string Role { get; set; } = null!;

    [ForeignKey("ReactionId")]
    [InverseProperty("ReactionSpecies")]
    public virtual Reaction Reaction { get; set; } = null!;

    [ForeignKey("SpeciesId")]
    [InverseProperty("ReactionSpecies")]
    public virtual Species Species { get; set; } = null!;
}
