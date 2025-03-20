using System.Text.Json.Serialization;
using System.ComponentModel.DataAnnotations.Schema;
namespace ChemistryCafeAPI.Models;

public class Reaction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    [JsonIgnore]
    public virtual Family Family { get; set; } = null!;
    public Guid FamilyId { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? CreatedDate { get; set; } = DateTime.UtcNow;

    // references to family species
    public List<ReactionComponent> Components { get; set; } = new List<ReactionComponent>();
}

public class ReactionComponent
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ReactionId { get; set; }
    // reference to species as it exists in the family
    public Guid SpeciesId { get; set; }
    public ComponentType Type { get; set; }
    public double? Coefficient { get; set; }
}

public enum ComponentType { Reactant, Product }