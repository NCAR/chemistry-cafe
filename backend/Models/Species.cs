using System.Text.Json.Serialization;

namespace ChemistryCafeAPI.Models;

public class Species
{
    public Guid Id { get; set; } = Guid.NewGuid();
    [JsonIgnore]
    public virtual Family Family { get; set; } = null!;
    public Guid FamilyId { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? CreatedDate { get; set; } = DateTime.UtcNow;

    // one to one for now
    public InitialConditions? InitialConditions { get; set; }
    public Properties? Properties { get; set; }
}

public class InitialConditions
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SpeciesId { get; set; }
    [JsonIgnore]
    public Species Species { get; set; } = null!;
    public double? Concentration { get; set; } = 0.0;
    public double? Temperature { get; set; } = 0.0;
    public double? Pressure { get; set; } = 0.0;
    public string? AdditionalConditions { get; set; } = null!;
    public double? AbsConvergenceTolerance { get; set; } = 0.0;
    public double? DiffusionCoefficient { get; set; } = 0.0;
    public double? MolecularWeight { get; set; } = 0.0;
    public double? FixedConcentration { get; set; } = 0.0;
}

public class Properties
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SpeciesId { get; set; }
    [JsonIgnore]
    public Species Species { get; set; } = null!;
    public double? Tolerance { get; set; } = 0.0;
    public double? Weight { get; set; } = 0.0;
    public double? Concentration { get; set; } = 0.0;
    public double? Diffusion { get; set; } = 0.0;
}

