using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace ChemistryCafeAPI.Models;

public class Reaction
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;
    public string Name { get; set; } = null!;
    public string? Description { get; set; }

    // Collections of reactants and products (must be species from the same family)
    public ICollection<Reactant> Reactants { get; set; } = new List<Reactant>();
    public ICollection<Product> Products { get; set; } = new List<Product>();

    // Mechanisms that reference this reaction
    public ICollection<MechanismReaction> MechanismReactions { get; set; } = new List<MechanismReaction>();

    // Family relationship
    [ForeignKey("Family")]
    public Guid FamilyId { get; set; }
    public Family Family { get; set; } = null!;
}

public class Reactant
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    // Reaction relationship
    public Guid ReactionId { get; set; }
    public Reaction Reaction { get; set; } = null!;

    // Species relationship (must be from same family as reaction)
    public Guid SpeciesId { get; set; }
    public Species Species { get; set; } = null!;

    public double? Coefficient { get; set; }
}

public class Product
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    // Reaction relationship
    public Guid ReactionId { get; set; }
    public Reaction Reaction { get; set; } = null!;

    // Species relationship (must be from same family as reaction)
    public Guid SpeciesId { get; set; }
    public Species Species { get; set; } = null!;

    public double? Coefficient { get; set; }
    public string? Branch { get; set; }
}