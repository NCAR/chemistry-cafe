using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace ChemistryCafeAPI.Models;

[Table("Families")]
public partial class Family
{
    [Key]
    public Guid Id { get; set; } = new Guid();
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public User Owner { get; set; } = null!;

    // Collections of species and reactions that belong to this family
    public ICollection<Species> Species { get; set; } = new List<Species>();
    public ICollection<Reaction> Reactions { get; set; } = new List<Reaction>();

    // Collection of mechanisms that reference this family's species and reactions
    public ICollection<Mechanism> Mechanisms { get; set; } = new List<Mechanism>();
}