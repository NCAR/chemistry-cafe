using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chemistry_Cafe_API.Models;

[Table("mechanism_species")]
[Index("SpeciesId", Name = "species_id")]
[Index("MechanismId", "SpeciesId", Name = "unique_mechanism_species", IsUnique = true)]
public partial class MechanismSpecy
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("mechanism_id")]
    public int MechanismId { get; set; }

    [Column("species_id")]
    public int SpeciesId { get; set; }

    [ForeignKey("MechanismId")]
    [InverseProperty("MechanismSpecies")]
    public virtual Mechanism Mechanism { get; set; } = null!;

    [ForeignKey("SpeciesId")]
    [InverseProperty("MechanismSpecies")]
    public virtual Species Species { get; set; } = null!;
}
