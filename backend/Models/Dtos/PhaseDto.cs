using System.Text.Json;

namespace ChemistryCafeAPI.Models.Dto;

/// <summary>
/// Data transfer object for the Phase model. Species membership is expressed as
/// an id list rather than nested objects. DiffusionCoefficients and Densities
/// hold a value only for the member species that have one.
/// </summary>
public class PhaseDto
{
    public Guid Id { get; set; }
    public Guid? SourceObjectId { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public List<Guid> SpeciesIds { get; set; } = new();
    // Diffusion coefficient [m2 s-1] of each member species, by species id
    public Dictionary<Guid, double> DiffusionCoefficients { get; set; } = new();
    // Density [kg m-3] of each member species, by species id
    public Dictionary<Guid, double> Densities { get; set; } = new();
    public Dictionary<string, JsonElement>? OtherProperties { get; set; }
}
