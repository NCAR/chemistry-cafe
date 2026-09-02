namespace ChemistryCafeAPI.Models.Dto;

/// <summary>
/// Data transfer object for the Family model, carrying the whole family graph.
/// Used to save (create/update) and load a family in a single payload.
/// </summary>
public class FamilyDto
{
    public Guid Id { get; set; }
    public Guid OwnerId { get; set; }

    /// <summary>
    /// A read projection of the owner for display. It carries no back-reference
    /// to families, so it does not reintroduce a serialization cycle. The
    /// create and update actions ignore this and take the owner from the
    /// authenticated user.
    /// </summary>
    public OwnerDto? Owner { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public List<SpeciesDto> Species { get; set; } = new();
    public List<ReactionDto> Reactions { get; set; } = new();
    public List<PhaseDto> Phases { get; set; } = new();
    public List<MechanismDto> Mechanisms { get; set; } = new();
}

public class OwnerDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = null!;
    public string Role { get; set; } = null!;
}
