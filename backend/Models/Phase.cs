using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace ChemistryCafeAPI.Models;

[Table("Phases")]
public class Phase
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;
    public string Name { get; set; } = null!;
    public string? Description { get; set; }

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
    [JsonIgnore]
    public ICollection<Reaction> AsAerosolPhase { get; set; } = new List<Reaction>();

    // Navigation property for mechanisms referencing this phase
    [JsonIgnore]
    public ICollection<Mechanism> Mechanisms { get; set; } = new List<Mechanism>();
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
