using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace ChemistryCafeAPI.Models;

[Table("Species")]
public class Species
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;
    public string Name { get; set; } = null!;
    public string? Description { get; set; }

    // Store attributes as JSON string
    public string? Attributes { get; set; }

    // Phase relationship
    public Guid? PhaseId { get; set; }
    public Phase? Phase { get; set; }

    // Family relationship
    [ForeignKey("Family")]
    public Guid FamilyId { get; set; }
    public Family Family { get; set; } = null!;

    // Navigation properties for reactions
    public ICollection<Reactant> AsReactant { get; set; } = new List<Reactant>();
    public ICollection<Product> AsProduct { get; set; } = new List<Product>();

    // Mechanisms that reference this species
    public ICollection<MechanismSpecies> MechanismSpecies { get; set; } = new List<MechanismSpecies>();
}