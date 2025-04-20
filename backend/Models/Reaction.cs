using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;

namespace ChemistryCafeAPI.Models;

[Table("Reactions")]
public class Reaction
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;
    public string Name { get; set; } = null!;
    public string ReactionType { get; set; } = null!;
    public string? Description { get; set; }

    // Attributes depending on the reaction type
    public ICollection<ReactionNumericalAttribute> NumericalAttributes { get; set; } = new List<ReactionNumericalAttribute>();
    public ICollection<ReactionStringAttribute> StringAttributes { get; set; } = new List<ReactionStringAttribute>();


    // Collections of reactants and products (must be species from the same family)
    public ICollection<Reactant> Reactants { get; set; } = new List<Reactant>();
    public ICollection<Product> Products { get; set; } = new List<Product>();

    // Mechanisms that reference this reaction
    [JsonIgnore]
    public ICollection<Mechanism> Mechanisms { get; set; } = new List<Mechanism>();

    // Family relationship
    [ForeignKey("Family")]
    public Guid FamilyId { get; set; }

    [JsonIgnore]
    public Family? Family { get; set; }
}

[Table("Reactants")]
[PrimaryKey(nameof(ReactionId), nameof(SpeciesId))]
public class Reactant
{
    // Reaction relationship
    public Guid ReactionId { get; set; }

    [JsonIgnore]
    public Reaction? Reaction { get; set; }

    // Species relationship (must be from same family as reaction)
    public Guid SpeciesId { get; set; }

    [JsonIgnore]
    public Species? Species { get; set; }

    public double Coefficient { get; set; }
}

[Table("Products")]
[PrimaryKey(nameof(ReactionId), nameof(SpeciesId))]
public class Product
{
    // Reaction relationship
    public Guid ReactionId { get; set; }
    
    [JsonIgnore]
    public Reaction? Reaction { get; set; }

    // Species relationship (must be from same family as reaction)
    public Guid SpeciesId { get; set; }
    
    [JsonIgnore]
    public Species? Species { get; set; }

    public double Coefficient { get; set; }
    public string? Branch { get; set; }
}

/// <summary>
/// Represents different numerical attributes depending on the reaction type.
/// Uses the ReactionId and SerializationKey as the primary key to ensure uniqueness.
/// </summary>
[Table("ReactionNumericalAttributes")]
[PrimaryKey(nameof(ReactionId), nameof(SerializationKey))]
public class ReactionNumericalAttribute
{
    [JsonIgnore]
    public Guid ReactionId { get; set; }
    
    [JsonIgnore]
    public Reaction? Reaction { get; set; } = null;

    // Key which is used in JSON/YAML serialization
    public string SerializationKey { get; set; } = null!;
    public double Value { get; set; }
}

/// <summary>
/// Represents different string attributes depending on the reaction type.
/// Uses the ReactionId and SerializationKey as the primary key to ensure uniqueness.
/// </summary>
[Table("ReactionStringAttributes")]
[PrimaryKey(nameof(ReactionId), nameof(SerializationKey))]
public class ReactionStringAttribute
{
    [JsonIgnore]
    public Guid ReactionId { get; set; }
    
    [JsonIgnore]
    public Reaction? Reaction { get; set; } = null;

    // Key which is used in JSON/YAML serialization
    public string SerializationKey { get; set; } = null!;
    public string Value { get; set; } = null!;
}