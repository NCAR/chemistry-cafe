using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

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

    // Specific attributes associated with this species
    public ICollection<SpeciesNumericalAttribute> NumericalAttributes { get; set; } = new List<SpeciesNumericalAttribute>();

    // Phase relationships
    [JsonIgnore]
    public ICollection<Phase> Phases { get; set; } = new List<Phase>();

    // Family relationship
    [ForeignKey("Families")]
    public Guid FamilyId { get; set; }
    [JsonIgnore]
    public Family? Family { get; set; }

    // Navigation properties for reactions/
    [JsonIgnore]
    public ICollection<Reactant> AsReactant { get; set; } = new List<Reactant>();
    [JsonIgnore]
    public ICollection<Product> AsProduct { get; set; } = new List<Product>();

    // Mechanisms that reference this species
    [JsonIgnore]
    public ICollection<MechanismSpecies> MechanismSpecies { get; set; } = new List<MechanismSpecies>();
}

/// <summary>
/// Represents different user defined numerical attributes like molecular weight, absolute tolerance, etc
/// Uses the SpeciesId and SerializationKey as the primary key to ensure uniqueness
/// </summary>
[Table("SpeciesNumericalAttributes")]
public class SpeciesNumericalAttribute
{
    public Guid SpeciesId { get; set; }
    [JsonIgnore]
    public Species? Species { get; set; }

    // Key which is used in JSON/YAML serialization
    public string SerializationKey { get; set; } = null!;
    public double Value { get; set; }
}
