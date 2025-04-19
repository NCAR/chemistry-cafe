using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

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
    public ICollection<Species> Species { get; set; } = new List<Species>();
    public ICollection<Reaction> Reactions { get; set; } = new List<Reaction>();

    // Family relationship
    [ForeignKey("Family")]
    public Guid FamilyId { get; set; }
    [JsonIgnore]
    public Family? Family { get; set; }
}
