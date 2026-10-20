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

    [ForeignKey("Owner")]
    public Guid OwnerId { get; set; }
    public User Owner { get; set; } = null!;

    // Pointer to active/editable draft version
    [ForeignKey("CurrentVersion")]
    public Guid? CurrentVersionId { get; set; }
    public FamilyVersion? CurrentVersion { get; set; }

    // Collection of all versions belonging to this family
    public ICollection<FamilyVersion> Versions { get; set; } = new List<FamilyVersion>();

    public FamilyVersion EnsureCurrentVersion()
    {
        if (CurrentVersion == null)
        {
            CurrentVersion = new FamilyVersion
            {
                Id = Guid.NewGuid(),
                FamilyId = Id,
                Family = this
            };
            CurrentVersionId = CurrentVersion.Id;
            Versions.Add(CurrentVersion);
        }
        return CurrentVersion;
    }

    // Convenience accessors delegating to CurrentVersion (not mapped to DB columns on Families table)
    [NotMapped]
    public ICollection<Species> Species
    {
        get => CurrentVersion?.Species ?? EnsureCurrentVersion().Species;
        set => EnsureCurrentVersion().Species = value;
    }

    [NotMapped]
    public ICollection<Reaction> Reactions
    {
        get => CurrentVersion?.Reactions ?? EnsureCurrentVersion().Reactions;
        set => EnsureCurrentVersion().Reactions = value;
    }

    [NotMapped]
    public ICollection<Phase> Phases
    {
        get => CurrentVersion?.Phases ?? EnsureCurrentVersion().Phases;
        set => EnsureCurrentVersion().Phases = value;
    }

    [NotMapped]
    public ICollection<Mechanism> Mechanisms
    {
        get => CurrentVersion?.Mechanisms ?? EnsureCurrentVersion().Mechanisms;
        set => EnsureCurrentVersion().Mechanisms = value;
    }
}