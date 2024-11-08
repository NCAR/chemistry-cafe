using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

namespace Chemistry_Cafe_API.Models;

[Table("mechanism_species")]
[Index("SpeciesId", Name = "species_id")]
[Index("MechanismId", "SpeciesId", Name = "unique_mechanism_species", IsUnique = true)]
public partial class MechanismSpecies
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("mechanism_id")]
    [JsonPropertyName("mechanism_id")]
    public Guid MechanismId { get; set; }

    [Column("species_id")]
    [JsonPropertyName("species_id")]
    public Guid SpeciesId { get; set; }

    [ForeignKey("MechanismId")]
    [InverseProperty("MechanismSpecies")]
    public virtual Mechanism? Mechanism { get; set; } = null!;

    [ForeignKey("SpeciesId")]
    [InverseProperty("MechanismSpecies")]
    public virtual Species? Species { get; set; } = null!;
}
