using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChemistryCafeAPI.Models;

public class Phase
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;
    public string Name { get; set; } = null!;
    public string? Description { get; set; }

    // Navigation property for species in this phase
    public ICollection<Species> Species { get; set; } = new List<Species>();

    // Mechanism relationship
    [ForeignKey("Mechanism")]
    public Guid MechanismId { get; set; }
    public Mechanism Mechanism { get; set; } = null!;
} 