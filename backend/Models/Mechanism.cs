using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;

namespace ChemistryCafeAPI.Models;

[Table("Mechanisms")]
public class Mechanism
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;
    public string Name { get; set; } = null!;
    public string? Description { get; set; }

    // References to species, reactions, and phases from the parent family
    public ICollection<Phase> Phases { get; set; } = new List<Phase>();
    public ICollection<Species> Species { get; set; } = new List<Species>();
    public ICollection<Reaction> Reactions { get; set; } = new List<Reaction>();

    // Family relationship
    [ForeignKey("Family")]
    public Guid FamilyId { get; set; }
    [JsonIgnore]
    public Family? Family { get; set; }
}

// Junction table for Mechanism-Species many-to-many relationship
[PrimaryKey(nameof(MechanismId), nameof(SpeciesId))]
public class MechanismSpecies
{
    [ForeignKey("Mechanisms")]
    public Guid MechanismId { get; set; }

    [ForeignKey("Species")]
    public Guid SpeciesId { get; set; }
}

[PrimaryKey(nameof(MechanismId), nameof(ReactionId))]
public class MechanismReaction
{
    [ForeignKey("Mechanisms")]
    public Guid MechanismId { get; set; }
    
    [ForeignKey("Reactions")]
    public Guid ReactionId { get; set; }
}

[PrimaryKey(nameof(MechanismId), nameof(PhaseId))]
public class MechanismPhase
{
    [ForeignKey("Mechanisms")]
    public Guid MechanismId { get; set; }

    [ForeignKey("Phases")]
    public Guid PhaseId { get; set; }
}


