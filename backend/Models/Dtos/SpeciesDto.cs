using System.Text.Json;

namespace ChemistryCafeAPI.Models.Dto;

/// <summary>
/// Data transfer object for the Species model
/// </summary>
public class SpeciesDto
{
    public double? AbsoluteTolerance { get; set; }
    public double? ConstantConcentration { get; set; }
    public double? ConstantMixingRatio { get; set; }
    public string? Description { get; set; }
    public Guid FamilyId { get; set; }
    public Guid Id { get; set; }
    public bool? IsThirdBody { get; set; }
    public double? MolecularWeight { get; set; }
    public string Name { get; set; } = null!;
    public Dictionary<string, JsonElement>? OtherProperties { get; set; }
}
