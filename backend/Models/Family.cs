using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace ChemistryCafeAPI.Models;

public partial class Family
{
    [Key]
    public Guid Id { get; set; } = new Guid();
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public User Owner { get; set; } = null!;

    public ICollection<Species> Species { get; set; } = new List<Species>();
}