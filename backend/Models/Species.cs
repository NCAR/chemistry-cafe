using System;
using Microsoft.EntityFrameworkCore;

namespace ChemistryCafeAPI.Models;

public partial class Species
{
    public Guid Id { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;
    public string Name { get; set; } = null!;
    public string? Description { get; set; }

    // Species belongs to a family
    public Guid FamilyId { get; set; }
    public Family Family { get; set; } = null!;
}