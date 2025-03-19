namespace ChemistryCafeAPI.Models;

public class Species
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; }
    public string? Description { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? CreatedDate { get; set; } = DateTime.UtcNow;

    // public ICollection<InitialConditionsSpecies> InitialConditionsSpecies { get; set; } = new List<InitialConditionsSpecies>();
    // public ICollection<MechanismSpecies> MechanismSpecies { get; set; } = new List<MechanismSpecies>();
    // public ICollection<ReactionSpecies> ReactionSpecies { get; set; } = new List<ReactionSpecies>();
}

