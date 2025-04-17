using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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

    // Collection of phases specific to this mechanism
    public ICollection<Phase> Phases { get; set; } = new List<Phase>();

    // References to species and reactions from the parent family
    public ICollection<MechanismSpecies> MechanismSpecies { get; set; } = new List<MechanismSpecies>();
    public ICollection<MechanismReaction> MechanismReactions { get; set; } = new List<MechanismReaction>();

    // Family relationship
    [ForeignKey("Family")]
    public Guid FamilyId { get; set; }
    public Family Family { get; set; } = null!;
}

// Junction table for Mechanism-Species many-to-many relationship
[Table("MechanismSpecies")]
public class MechanismSpecies
{
    public Guid MechanismId { get; set; }
    public Mechanism Mechanism { get; set; } = null!;

    public Guid SpeciesId { get; set; }
    public Species Species { get; set; } = null!;
}

// Junction table for Mechanism-Reaction many-to-many relationship
[Table("MechanismReactions")]
public class MechanismReaction
{
    public Guid MechanismId { get; set; }
    public Mechanism Mechanism { get; set; } = null!;

    public Guid ReactionId { get; set; }
    public Reaction Reaction { get; set; } = null!;
}