using System;

namespace ChemistryCafeAPI.Models;

public enum ChangeTargetType
{
    Family,
    Species,
    Reaction,
    Phase,
    Mechanism,
    Group
}

public enum ChangeAction
{
    Added,
    Updated,
    Deleted
}

/// <summary>
/// Represents a change to an individual entity (species, reaction, phase, mechanism, group, or family properties)
/// within a save operation.
/// </summary>
public class ChangeEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid ChangeSetId { get; set; }
    public ChangeSet ChangeSet { get; set; } = null!;

    public ChangeTargetType TargetType { get; set; }

    public Guid TargetId { get; set; }

    /// <summary>
    /// Human-readable name at time of change, so deleted items remain identifiable.
    /// </summary>
    public string TargetName { get; set; } = string.Empty;

    public ChangeAction Action { get; set; }

    /// <summary>
    /// JSON representation of the entity state before the change (null if Added).
    /// </summary>
    public string? Before { get; set; }

    /// <summary>
    /// JSON representation of the entity state after the change (null if Deleted).
    /// </summary>
    public string? After { get; set; }
}

