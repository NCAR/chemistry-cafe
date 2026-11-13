using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text.Json.Serialization;
using System.Text.Json;
using ChemistryCafeAPI.Models.Dto;
using ChemistryCafeAPI.Models.Mappers;

namespace ChemistryCafeAPI.Models;

[Table("Phases")]
public class Phase
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? SourceObjectId { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    [Column(TypeName = "json")]
    public Dictionary<string, JsonElement>? OtherProperties { get; set; }

    // FamilyVersion this phase is a part of
    [ForeignKey("FamilyVersion")]
    public Guid FamilyVersionId { get; set; }
    [JsonIgnore]
    public FamilyVersion FamilyVersion { get; set; } = null!;

    // Navigation property for species in this phase
    public ICollection<Species> Species { get; set; } = new List<Species>();

    // The join rows for the species in this phase. Each row holds the values
    // that belong to one species in this phase, for example the diffusion
    // coefficient.
    [JsonIgnore]
    public ICollection<PhaseSpecies> PhaseSpecies { get; set; } = new List<PhaseSpecies>();

    // Navigation properties for reactions with this phase
    [JsonIgnore]
    public ICollection<Reaction> AsGasPhase { get; set; } = new List<Reaction>();

    // Navigation property for mechanisms referencing this phase
    [JsonIgnore]
    public ICollection<Mechanism> Mechanisms { get; set; } = new List<Mechanism>();

    /// <summary>
    /// Determines whether this phase differs from the given DTO.
    /// </summary>
    public bool IsDifferent(PhaseDto other)
    {
        if ((Name ?? "") != (other.Name ?? "")
            || (Description ?? "") != (other.Description ?? "")
            || OtherProperties.IsDifferentFrom(other.OtherProperties))
        {
            return true;
        }

        if (PhaseSpecies.Count != other.SpeciesIds.Count) return true;
        if (!PhaseSpecies.Select(ps => ps.SpeciesId).ToHashSet().SetEquals(other.SpeciesIds)) return true;

        foreach (var ps in PhaseSpecies)
        {
            if (ps.DiffusionCoefficient != other.DiffusionCoefficientOf(ps.SpeciesId)) return true;
        }

        return false;
    }

    /// <summary>
    /// Updates this phase in place from the given DTO, updating join rows cleanly.
    /// </summary>
    public void UpdateFrom(PhaseDto other, ICollection<Species> familySpecies, Action<PhaseSpecies> removeOrphan)
    {
        Name = other.Name;
        Description = other.Description;
        OtherProperties = other.OtherProperties;

        var toRemove = PhaseSpecies
            .Where(ps => !other.SpeciesIds.Contains(ps.SpeciesId))
            .ToList();
        foreach (var ps in toRemove)
        {
            PhaseSpecies.Remove(ps);
            removeOrphan(ps);
        }

        foreach (Guid sid in other.SpeciesIds)
        {
            PhaseSpecies? member = PhaseSpecies.SingleOrDefault(ps => ps.SpeciesId == sid);
            if (member == null)
            {
                var species = familySpecies.Single(s => s.Id == sid);
                member = new PhaseSpecies { SpeciesId = sid, Species = species };
                PhaseSpecies.Add(member);
            }
            member.DiffusionCoefficient = other.DiffusionCoefficientOf(sid);
        }
    }

    /// <summary>
    /// Creates a deep copy of this phase for a new family version snapshot.
    /// </summary>
    public Phase Clone(FamilyVersion targetVersion, IReadOnlyDictionary<Guid, Species> speciesMap)
    {
        var clonedPhase = new Phase
        {
            Id = Guid.NewGuid(),
            SourceObjectId = Id,
            FamilyVersionId = targetVersion.Id,
            FamilyVersion = targetVersion,
            Name = Name,
            Description = Description,
            OtherProperties = OtherProperties.CloneDictionary(),
        };

        if (PhaseSpecies != null)
        {
            clonedPhase.PhaseSpecies = PhaseSpecies
                .Where(ps => speciesMap.ContainsKey(ps.SpeciesId))
                .Select(ps => new PhaseSpecies
                {
                    PhasesId = clonedPhase.Id,
                    Phase = clonedPhase,
                    SpeciesId = speciesMap[ps.SpeciesId].Id,
                    Species = speciesMap[ps.SpeciesId],
                    DiffusionCoefficient = ps.DiffusionCoefficient,
                })
                .ToList();
        }

        return clonedPhase;
    }
}

/// <summary>
/// Joins a phase and a species. The diffusion coefficient is on this join,
/// because one species can have a different value in each phase.
/// </summary>
public class PhaseSpecies
{
    public Guid PhasesId { get; set; }
    [JsonIgnore]
    public Phase Phase { get; set; } = null!;

    public Guid SpeciesId { get; set; }
    [JsonIgnore]
    public Species Species { get; set; } = null!;

    // Diffusion coefficient [m2 s-1]
    public double? DiffusionCoefficient { get; set; }
}
