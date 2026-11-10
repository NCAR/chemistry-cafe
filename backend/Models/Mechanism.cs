using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics.CodeAnalysis;
using System.Text.Json;
using ChemistryCafeAPI.Models.Dto;

namespace ChemistryCafeAPI.Models;

[Table("Mechanisms")]
public class Mechanism
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

    // References to species, reactions, and phases from the parent family
    public ICollection<Phase> Phases { get; set; } = new List<Phase>();
    public ICollection<Species> Species { get; set; } = new List<Species>();
    public ICollection<Reaction> Reactions { get; set; } = new List<Reaction>();

    [JsonIgnore]
    public ICollection<VerifiedMechanismVersion> VerifiedVersions { get; set; } = new List<VerifiedMechanismVersion>();

    [NotMapped]
    public bool IsVerified => (Family?.CurrentVersionId != null && FamilyVersionId != Family.CurrentVersionId)
        || (VerifiedVersions != null && VerifiedVersions.Count > 0)
        || Verified;

    [NotMapped]
    public bool IsArchived => VerifiedVersions != null && VerifiedVersions.Any(v => v.IsArchived);

    [NotMapped]
    public bool IsDeprecated => VerifiedVersions != null && VerifiedVersions.Any(v => v.IsDeprecated);

    public bool IsReadOnly => (Family?.CurrentVersionId != null && FamilyVersionId != Family.CurrentVersionId);

    [NotMapped]
    public bool Verified { get; set; } = false;

    [NotMapped]
    public DateTime? VerifiedDate { get; set; } = null;

    [NotMapped]
    public string? VerifiedBy { get; set; } = null;

    // Family relationship (Mechanism belongs to Family)
    [ForeignKey("Family")]
    public Guid FamilyId { get; set; }
    [JsonIgnore]
    public Family? Family { get; set; }

    // FamilyVersion relationship (Mechanism is using a FamilyVersion)
    [ForeignKey("FamilyVersion")]
    public Guid FamilyVersionId { get; set; }
    [JsonIgnore]
    public FamilyVersion? FamilyVersion { get; set; }

    /// <summary>
    /// Determines whether this mechanism directly differs from the given DTO.
    /// </summary>
    public bool IsDifferent(MechanismDto other)
    {
        return (Name ?? "") != (other.Name ?? "")
            || (Description ?? "") != (other.Description ?? "")
            || !Species.Select(s => s.Id).ToHashSet().SetEquals(other.SpeciesIds)
            || !Reactions.Select(r => r.Id).ToHashSet().SetEquals(other.ReactionIds)
            || !Phases.Select(p => p.Id).ToHashSet().SetEquals(other.PhaseIds)
            || OtherProperties.IsDifferentFrom(other.OtherProperties);
    }

    /// <summary>
    /// Determines whether any species, reaction, or phase referenced by this mechanism (or its incoming DTO) was modified.
    /// </summary>
    public bool HasDependencyChanges(
        MechanismDto other,
        IReadOnlySet<Guid> changedSpeciesIds,
        IReadOnlySet<Guid> changedReactionIds,
        IReadOnlySet<Guid> changedPhaseIds)
    {
        return Species.Any(s => changedSpeciesIds.Contains(s.Id))
            || other.SpeciesIds.Any(sid => changedSpeciesIds.Contains(sid))
            || Reactions.Any(r => changedReactionIds.Contains(r.Id))
            || other.ReactionIds.Any(rid => changedReactionIds.Contains(rid))
            || Phases.Any(p => changedPhaseIds.Contains(p.Id))
            || other.PhaseIds.Any(pid => changedPhaseIds.Contains(pid));
    }

    /// <summary>
    /// Updates this mechanism in place from the given DTO, updating UpdatedDate only when modified directly or via dependencies.
    /// </summary>
    public void UpdateFrom(MechanismDto other, Family parentFamily, bool markUpdated)
    {
        Name = other.Name;
        Description = other.Description;
        FamilyId = parentFamily.Id;
        Species = other.SpeciesIds.Select(sid => parentFamily.Species.Single(s => s.Id == sid)).ToList();
        Reactions = other.ReactionIds.Select(rid => parentFamily.Reactions.Single(r => r.Id == rid)).ToList();
        Phases = other.PhaseIds.Select(pid => parentFamily.Phases.Single(p => p.Id == pid)).ToList();
        OtherProperties = other.OtherProperties;

        if (markUpdated)
        {
            UpdatedDate = DateTime.UtcNow;
        }
    }

    /// <summary>
    /// Creates a frozen snapshot copy of this mechanism pointing to the cloned family version entities.
    /// </summary>
    public Mechanism CloneForSnapshot(
        FamilyVersion frozenVersion,
        string verifiedName,
        DateTime timestamp,
        string verifierDisplayName,
        IReadOnlyDictionary<Guid, Species> speciesMap,
        IReadOnlyDictionary<Guid, Phase> phaseMap,
        IReadOnlyDictionary<Guid, Reaction> reactionMap)
    {
        return new Mechanism
        {
            Id = Guid.NewGuid(),
            SourceObjectId = Id,
            FamilyId = FamilyId,
            FamilyVersionId = frozenVersion.Id,
            FamilyVersion = frozenVersion,
            Name = verifiedName,
            Description = Description,
            CreatedDate = timestamp,
            UpdatedDate = timestamp,
            Verified = true,
            VerifiedDate = timestamp,
            VerifiedBy = verifierDisplayName,
            OtherProperties = OtherProperties.CloneDictionary(),
            Species = Species.Where(s => speciesMap.ContainsKey(s.Id)).Select(s => speciesMap[s.Id]).ToList(),
            Phases = Phases.Where(p => phaseMap.ContainsKey(p.Id)).Select(p => phaseMap[p.Id]).ToList(),
            Reactions = Reactions.Where(r => reactionMap.ContainsKey(r.Id)).Select(r => reactionMap[r.Id]).ToList(),
        };
    }
}

// Junction table for Mechanism-Species many-to-many relationship
[PrimaryKey(nameof(MechanismId), nameof(SpeciesId))]
[ExcludeFromCodeCoverage]
public class MechanismSpecies
{
    [ForeignKey("Mechanisms")]
    public Guid MechanismId { get; set; }

    [ForeignKey("Species")]
    public Guid SpeciesId { get; set; }
}

[PrimaryKey(nameof(MechanismId), nameof(ReactionId))]
[ExcludeFromCodeCoverage]
public class MechanismReaction
{
    [ForeignKey("Mechanisms")]
    public Guid MechanismId { get; set; }
    
    [ForeignKey("Reactions")]
    public Guid ReactionId { get; set; }
}

[PrimaryKey(nameof(MechanismId), nameof(PhaseId))]
[ExcludeFromCodeCoverage]
public class MechanismPhase
{
    [ForeignKey("Mechanisms")]
    public Guid MechanismId { get; set; }

    [ForeignKey("Phases")]
    public Guid PhaseId { get; set; }
}


