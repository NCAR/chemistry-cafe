namespace ChemistryCafeAPI.Models.Dto;

/// <summary>
/// Data transfer object for the Phase model. Species membership is expressed as
/// an id list rather than nested objects. DiffusionCoefficients holds a value
/// only for the member species that have one.
/// </summary>
public class PhaseDto
{
    public Guid Id { get; set; }
    public Guid FamilyId { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public List<Guid> SpeciesIds { get; set; } = new();
    // Diffusion coefficient [m2 s-1] of each member species, by species id
    public Dictionary<Guid, double> DiffusionCoefficients { get; set; } = new();
}
