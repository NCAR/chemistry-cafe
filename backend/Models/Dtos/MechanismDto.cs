namespace ChemistryCafeAPI.Models.Dto;

/// <summary>
/// Data transfer object for the Mechanism model. Its relations to species,
/// reactions, and phases are expressed as id lists rather than nested objects.
/// </summary>
public class MechanismDto
{
    public Guid Id { get; set; }
    public Guid FamilyId { get; set; }
    public Guid FamilyVersionId { get; set; }
    public bool IsReadOnly { get; set; }
    public ValidationStatus ValidationStatus { get; set; } = ValidationStatus.NoValidationRequested;
    public Guid? ValidatedById { get; set; }
    public string? ValidatedBy { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public List<Guid> SpeciesIds { get; set; } = new();
    public List<Guid> ReactionIds { get; set; } = new();
    public List<Guid> PhaseIds { get; set; } = new();
}
