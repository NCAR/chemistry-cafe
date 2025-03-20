using System.Text.Json.Serialization;

namespace ChemistryCafeAPI.Models;

public class Mechanism
{
    public Guid Id { get; set; } = Guid.NewGuid();
    [JsonIgnore]
    public virtual Family Family { get; set; } = null!;
    public Guid FamilyId { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string? CreatedBy { get; set; }
    public DateTime? CreatedDate { get; set; } = DateTime.UtcNow;

    // references to family species and reactions
    public List<Guid> SpeciesIds { get; set; } = new List<Guid>();
    public List<Guid> ReactionIds { get; set; } = new List<Guid>();
}
