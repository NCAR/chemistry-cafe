using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
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

    // Specific attributes associated with this species
    public ICollection<SpeciesNumericalAttribute> NumericalAttributes { get; set; } = new List<SpeciesNumericalAttribute>();
    public ICollection<SpeciesStringAttribute> StringAttributes { get; set; } = new List<SpeciesStringAttribute>();

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

/// <summary>
/// Represents different user defined numerical attributes like molecular weight, absolute tolerance, etc
/// Uses the SpeciesId and SerializationKey as the primary key to ensure uniqueness
/// </summary>
[Table("SpeciesNumericalAttributes")]
[PrimaryKey(nameof(SpeciesId), nameof(SerializationKey))]
public class SpeciesNumericalAttribute
{
    [ForeignKey("Species")]
    public Guid SpeciesId { get; set; }
    [JsonIgnore]
    public Species? Species { get; set; }

    // Key which is used in JSON/YAML serialization
    public string SerializationKey { get; set; } = null!;
    public double Value { get; set; }
}

[Table("SpeciesStringAttributes")]
[PrimaryKey(nameof(SpeciesId), nameof(SerializationKey))]
public class SpeciesStringAttribute
{
    [ForeignKey("Species")]
    public Guid SpeciesId { get; set; }
    [JsonIgnore]
    public Species? Species { get; set; }

    // Key which is used in JSON/YAML serialization
    public string SerializationKey { get; set; } = null!;
    public string Value { get; set; } = null!;
}
