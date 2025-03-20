using Microsoft.EntityFrameworkCore;

namespace ChemistryCafeAPI.Models;

[Index(nameof(Name), IsUnique = true)]
public class Family
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public Guid OwnerId { get; set; }
    public DateTime CreatedDate { get; set; }
    public bool IsPublic { get; set; } = false;

    // family has the unordered collection of mechanisms (everything else uses references to this)
    public List<Mechanism> Mechanisms { get; set; } = new List<Mechanism>();

    // family has the unordered collection of species and reactions (everything else uses references to this)
    public List<Species> Species { get; set; } = new List<Species>();
    public List<Reaction> Reactions { get; set; } = new List<Reaction>();
}
