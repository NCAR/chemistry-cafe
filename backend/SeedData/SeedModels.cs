using System.Text.Json;

namespace ChemistryCafeAPI.SeedData;

// Plain shapes that mirror SeedData/seed.json (produced by generate-seed.mjs).
// Deserialized case-insensitively, so PascalCase members match the camelCase keys.

public class SeedRoot
{
    public List<SeedFamily> Families { get; set; } = new();
}

public class SeedFamily
{
    public string Name { get; set; } = null!;
    public List<SeedSpecies> Species { get; set; } = new();
    public List<SeedPhase> Phases { get; set; } = new();
    public List<SeedMechanism> Mechanisms { get; set; } = new();
}

public class SeedSpecies
{
    public string Name { get; set; } = null!;
    public double? MolecularWeight { get; set; }
    public double? AbsoluteTolerance { get; set; }
    public double? ConstantConcentration { get; set; }
    public double? ConstantMixingRatio { get; set; }
    public bool? IsThirdBody { get; set; }
    public Dictionary<string, JsonElement>? OtherProperties { get; set; }
}

public class SeedPhase
{
    public string Name { get; set; } = null!;
    public List<string> Species { get; set; } = new();
}

public class SeedMechanism
{
    public string Name { get; set; } = null!;
    public List<string> Species { get; set; } = new();
    public List<string> Phases { get; set; } = new();
    public List<SeedReaction> Reactions { get; set; } = new();
}

public class SeedReaction
{
    public string Name { get; set; } = null!;
    public string Type { get; set; } = null!;
    public List<SeedComponent> Reactants { get; set; } = new();
    public List<SeedComponent> Products { get; set; } = new();
    public Dictionary<string, double> NumericalAttributes { get; set; } = new();
    public Dictionary<string, string> StringAttributes { get; set; } = new();
    public string? GasPhase { get; set; }
    public string? GasPhaseSpecies { get; set; }
}

public class SeedComponent
{
    public string Name { get; set; } = null!;
    public double Coefficient { get; set; } = 1;
    public string? Branch { get; set; }
}
