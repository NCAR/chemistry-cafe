namespace ChemistryCafeAPI.Models.Dto;

/// <summary>
/// Data transfer object representing a specific FamilyVersion snapshot.
/// </summary>
public class FamilyVersionDto
{
    public Guid Id { get; set; }
    public Guid FamilyId { get; set; }
    public DateTime CreatedDate { get; set; }
    public List<SpeciesDto> Species { get; set; } = new();
    public List<ReactionDto> Reactions { get; set; } = new();
    public List<PhaseDto> Phases { get; set; } = new();
}

