using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace ChemistryCafeAPI.Models;

public partial class Family
{
    public Guid Id { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public User Owner { get; set; } = null!;

    public ICollection<Species> Species { get; set; } = new List<Species>();
}