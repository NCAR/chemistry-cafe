using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace ChemistryCafeAPI.Models;

[Table("FamilyVersions")]
public class FamilyVersion
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    [ForeignKey("Family")]
    public Guid FamilyId { get; set; }
    [JsonIgnore]
    public Family Family { get; set; } = null!;

    // Collections of species, reactions, and phases that belong to this version snapshot
    public ICollection<Species> Species { get; set; } = new List<Species>();
    public ICollection<Reaction> Reactions { get; set; } = new List<Reaction>();
    public ICollection<Phase> Phases { get; set; } = new List<Phase>();

    /// <summary>
    /// Deep-copies all Species, Phases, and Reactions from this version into a new FamilyVersion snapshot.
    /// </summary>
    public (FamilyVersion NewVersion,
            Dictionary<Guid, Species> SpeciesMap,
            Dictionary<Guid, Phase> PhaseMap,
            Dictionary<Guid, Reaction> ReactionMap)
        CloneSnapshot(DateTime? timestamp = null)
    {
        var now = timestamp ?? DateTime.UtcNow;
        var newVersion = new FamilyVersion
        {
            Id = Guid.NewGuid(),
            FamilyId = FamilyId,
            CreatedDate = now,
        };

        var speciesMap = Species.ToDictionary(s => s.Id, s => s.Clone(newVersion, now));
        var phaseMap = Phases.ToDictionary(p => p.Id, p => p.Clone(newVersion, speciesMap));
        var reactionMap = Reactions.ToDictionary(r => r.Id, r => r.Clone(newVersion, now, speciesMap, phaseMap));

        newVersion.Species = speciesMap.Values.ToList();
        newVersion.Phases = phaseMap.Values.ToList();
        newVersion.Reactions = reactionMap.Values.ToList();

        return (newVersion, speciesMap, phaseMap, reactionMap);
    }
}
