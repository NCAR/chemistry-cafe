namespace ChemistryCafeAPI.Models;

public class Reaction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; }
    public string? Description { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? CreatedDate { get; set; } = DateTime.UtcNow;

    // public ICollection<MechanismReaction> MechanismReactions { get; set; } = new List<MechanismReaction>();
    // public ICollection<ReactionSpecies> ReactionSpecies { get; set; } = new List<ReactionSpecies>();
}