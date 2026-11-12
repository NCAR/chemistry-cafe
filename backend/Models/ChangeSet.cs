using System;
using System.Collections.Generic;

namespace ChemistryCafeAPI.Models;

/// <summary>
/// Represents a set of changes made to a family during a single save operation.
/// </summary>
public class ChangeSet
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid FamilyId { get; set; }
    public Family Family { get; set; } = null!;

    public Guid? UserId { get; set; }
    public User? User { get; set; }

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Optional comment/note provided by the user when saving changes.
    /// </summary>
    public string? Note { get; set; }

    public ICollection<ChangeEntry> Entries { get; set; } = new List<ChangeEntry>();
}

