using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace ChemistryCafeAPI.Models;

public partial class Species
{
    [Key]
    public Guid Id { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;
    public string Name { get; set; } = null!;
    public string? Description { get; set; }

    // Species belongs to a family
    [ForeignKey("Family")]
    public Guid FamilyId { get; set; }
}