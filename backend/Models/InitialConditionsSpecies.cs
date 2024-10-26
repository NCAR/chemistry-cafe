using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chemistry_Cafe_API.Models;

[Table("initial_conditions_species")]
[Index("SpeciesId", Name = "species_id")]
[Index("MechanismId", "SpeciesId", Name = "unique_initial_conditions", IsUnique = true)]
public partial class InitialConditionsSpecies
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("mechanism_id")]
    public int MechanismId { get; set; }

    [Column("species_id")]
    public int SpeciesId { get; set; }

    [Column("concentration")]
    public double? Concentration { get; set; }

    [Column("temperature")]
    public double? Temperature { get; set; }

    [Column("pressure")]
    public double? Pressure { get; set; }

    [Column("additional_conditions", TypeName = "text")]
    public string? AdditionalConditions { get; set; } = string.Empty;

    [ForeignKey("MechanismId")]
    [InverseProperty("InitialConditionsSpecies")]
    public virtual Mechanism Mechanism { get; set; } = null!;

    [ForeignKey("SpeciesId")]
    [InverseProperty("InitialConditionsSpecies")]
    public virtual Species Species { get; set; } = null!;
}
