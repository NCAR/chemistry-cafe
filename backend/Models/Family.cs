using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChemistryCafeAPI.Models;

[Table("Families")]
public partial class Family
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public string Name { get; set; } = null!;
    public string? Description { get; set; }

    public bool IsPublic { get; set; } = false;

    [ForeignKey("Owner")]
    public Guid OwnerId { get; set; }
    public User Owner { get; set; } = null!;

    // Pointer to active/editable draft version
    [ForeignKey("CurrentVersion")]
    public Guid? CurrentVersionId { get; set; }
    public FamilyVersion CurrentVersion { get; set; } = null!;

    // Collection of all versions belonging to this family
    public ICollection<FamilyVersion> Versions { get; set; } = new List<FamilyVersion>();

    // Convenience accessors delegating to CurrentVersion (not mapped to DB columns on Families table)
    [NotMapped]
    public ICollection<Species> Species
    {
        get => CurrentVersion?.Species ?? [];
        set => CurrentVersion.Species = value;
    }

    [NotMapped]
    public ICollection<Reaction> Reactions
    {
        get => CurrentVersion?.Reactions ?? [];
        set => CurrentVersion.Reactions = value;
    }

    [NotMapped]
    public ICollection<Phase> Phases
    {
        get => CurrentVersion?.Phases ?? [];
        set => CurrentVersion.Phases = value;
    }

    // Collection of mechanisms belonging to this family
    public ICollection<Mechanism> Mechanisms { get; set; } = new List<Mechanism>();

    // Collection of contributors to this family
    public ICollection<FamilyContributor> Contributors { get; set; } = new List<FamilyContributor>();
}