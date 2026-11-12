using System;
using System.Collections.Generic;

namespace ChemistryCafeAPI.Models.Dto;

public class ChangeSetDto
{
    public Guid Id { get; set; }
    public Guid FamilyId { get; set; }
    public Guid? UserId { get; set; }
    public OwnerDto? User { get; set; }
    public DateTime Timestamp { get; set; }
    public string? Note { get; set; }
    public List<ChangeEntryDto> Entries { get; set; } = new();
}

public class ChangeEntryDto
{
    public Guid Id { get; set; }
    public Guid ChangeSetId { get; set; }
    public string TargetType { get; set; } = string.Empty;
    public Guid TargetId { get; set; }
    public string TargetName { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string? Before { get; set; }
    public string? After { get; set; }
}

