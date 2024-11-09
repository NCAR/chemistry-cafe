using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization; // Added
using Microsoft.EntityFrameworkCore;

namespace Chemistry_Cafe_API.Models;

[Table("initial_conditions_species")]
[Index("SpeciesId", Name = "species_id")]
[Index("MechanismId", "SpeciesId", Name = "unique_initial_conditions", IsUnique = true)]
public partial class InitialConditionsSpecies
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

    [Column("concentration")]
    [JsonPropertyName("concentration")]
    public double? Concentration { get; set; }

    [Column("temperature")]
    [JsonPropertyName("temperature")]
    public double? Temperature { get; set; }

    [Column("pressure")]
    [JsonPropertyName("pressure")]
    public double? Pressure { get; set; }

    [Column("additional_conditions", TypeName = "text")]
    [JsonPropertyName("additional_conditions")]
    public string? AdditionalConditions { get; set; } = string.Empty;

    [ForeignKey("MechanismId")]
    [InverseProperty("InitialConditionsSpecies")]
    public virtual Mechanism Mechanism { get; set; } = null!;

    [ForeignKey("SpeciesId")]
    [InverseProperty("InitialConditionsSpecies")]
    public virtual Species Species { get; set; } = null!;
}
