using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Chemistry_Cafe_API.Models;

[Table("properties")]
public partial class Property
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("species_id")]
    public Guid SpeciesId { get; set; }

    [Column("mechanism_id")]
    public Guid MechanismId { get; set; }

    [Column("tolerance")]
    public double? Tolerance { get; set; }

    [Column("weight")]
    public double? Weight { get; set; }

    [Column("concentration")]
    public double? Concentration { get; set; }

    [Column("diffusion")]
    public double? Diffusion { get; set; }

    [ForeignKey(nameof(SpeciesId))]
    [InverseProperty("Properties")] // Assuming you have a `Species` model with a collection of `Property`\
    public virtual Species? Species { get; set; } = null!;


    [ForeignKey(nameof(MechanismId))]
    [InverseProperty("Properties")] // Assuming you have a `Species` model with a collection of `Property`
    public virtual Mechanism? Mechanism { get; set; } = null!;
}
