using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;
using System.Text.Json.Serialization;
using ChemistryCafeAPI.Models.Dto;
using Microsoft.EntityFrameworkCore;

namespace ChemistryCafeAPI.Models;

/// <summary>
/// Object which represents a chemical species
/// </summary>
[Table("Species")]
public class Species
{
    public double? AbsoluteTolerance { get; set; }
    public double? ConstantConcentration { get; set; }
    public double? ConstantMixingRatio { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public string? Description { get; set; }
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? SourceObjectId { get; set; }
    public bool? IsThirdBody { get; set; }
    public double? MolecularWeight { get; set; }
    public string Name { get; set; } = null!;
    [Column(TypeName = "json")]
    public Dictionary<string, JsonElement>? OtherProperties { get; set; }
    public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;

    // FamilyVersion relationship
    [ForeignKey("FamilyVersion")]
    public Guid FamilyVersionId { get; set; }

    [JsonIgnore]
    public FamilyVersion FamilyVersion { get; set; } = null!;

    // Phase relationships
    [JsonIgnore]
    public ICollection<Phase> Phases { get; set; } = new List<Phase>();
    [JsonIgnore]
    public ICollection<PhaseSpecies> PhaseSpecies { get; set; } = new List<PhaseSpecies>();

    // Navigation properties for reactions
    [JsonIgnore]
    public ICollection<Reactant> AsReactant { get; set; } = new List<Reactant>();
    [JsonIgnore]
    public ICollection<Product> AsProduct { get; set; } = new List<Product>();
    [JsonIgnore]
    public ICollection<Reaction> AsGasPhaseSpecies { get; set; } = new List<Reaction>();

    // Mechanisms that reference this species
    [JsonIgnore]
    public ICollection<Mechanism> Mechanisms { get; set; } = new List<Mechanism>();

    /// <summary>
    /// Determines whether this species differs from the given DTO.
    /// </summary>
    public bool IsDifferent(SpeciesDto other)
    {
        return (Name ?? "") != (other.Name ?? "")
            || (Description ?? "") != (other.Description ?? "")
            || MolecularWeight != other.MolecularWeight
            || IsThirdBody != other.IsThirdBody
            || ConstantConcentration != other.ConstantConcentration
            || ConstantMixingRatio != other.ConstantMixingRatio
            || AbsoluteTolerance != other.AbsoluteTolerance
            || OtherProperties.IsDifferentFrom(other.OtherProperties);
    }

    /// <summary>
    /// Updates this species in place from the given DTO.
    /// </summary>
    public void UpdateFrom(SpeciesDto other)
    {
        Name = other.Name;
        Description = other.Description;
        MolecularWeight = other.MolecularWeight;
        IsThirdBody = other.IsThirdBody;
        ConstantConcentration = other.ConstantConcentration;
        ConstantMixingRatio = other.ConstantMixingRatio;
        AbsoluteTolerance = other.AbsoluteTolerance;
        OtherProperties = other.OtherProperties;
    }

    /// <summary>
    /// Creates a deep copy of this species for a new family version snapshot.
    /// </summary>
    public Species Clone(FamilyVersion targetVersion, DateTime timestamp)
    {
        return new Species
        {
            Id = Guid.NewGuid(),
            SourceObjectId = Id,
            FamilyVersionId = targetVersion.Id,
            FamilyVersion = targetVersion,
            Name = Name,
            Description = Description,
            MolecularWeight = MolecularWeight,
            IsThirdBody = IsThirdBody,
            ConstantConcentration = ConstantConcentration,
            ConstantMixingRatio = ConstantMixingRatio,
            AbsoluteTolerance = AbsoluteTolerance,
            CreatedDate = timestamp,
            UpdatedDate = timestamp,
            OtherProperties = OtherProperties.CloneDictionary(),
        };
    }
}
