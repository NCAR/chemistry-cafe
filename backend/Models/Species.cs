using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;

namespace ChemistryCafeAPI.Models;

/// <summary>
/// Object which represents a chemical species
/// </summary>
[Table("Species")]
public class Species
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public bool? IsThirdBody { get; set; }
    public double? MolecularWeight { get; set; }
    public double? ConstantConcentration { get; set; }
    public double? ConstantMixingRatio { get; set; }
    [Column(TypeName = "json")]
    public Dictionary<string, JsonElement>? OtherProperties { get; set; }

    // Family relationship
    [ForeignKey("Families")]
    public Guid FamilyId { get; set; }
    [JsonIgnore]
    public Family? Family { get; set; }

    // Phase relationships
    [JsonIgnore]
    public ICollection<Phase> Phases { get; set; } = new List<Phase>();

    // Navigation properties for reactions
    [JsonIgnore]
    public ICollection<Reactant> AsReactant { get; set; } = new List<Reactant>();
    [JsonIgnore]
    public ICollection<Product> AsProduct { get; set; } = new List<Product>();
    [JsonIgnore]
    public ICollection<Reaction> AsGasPhaseSpecies { get; set; } = new List<Reaction>();
    [JsonIgnore]
    public ICollection<Reaction> AsAerosolPhaseSpecies { get; set; } = new List<Reaction>();
    [JsonIgnore]
    public ICollection<Reaction> AsAerosolPhaseWater { get; set; } = new List<Reaction>();

    // Mechanisms that reference this species
    [JsonIgnore]
    public ICollection<Mechanism> Mechanisms { get; set; } = new List<Mechanism>();
}