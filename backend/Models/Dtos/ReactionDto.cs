namespace ChemistryCafeAPI.Models.Dto;

/// <summary>
/// Data transfer object for the Reaction model. Reactants and products are
/// carried inline; phase/species references are ids.
/// </summary>
public class ReactionDto
{
    public Guid Id { get; set; }
    public Guid FamilyId { get; set; }
    public string Name { get; set; } = null!;
    public string ReactionType { get; set; } = null!;
    public string? Description { get; set; }

    public List<ReactantDto> Reactants { get; set; } = new();
    public List<ProductDto> Products { get; set; } = new();

    // Exactly one of these is populated, matching ReactionType. Every
    // reaction type has a dedicated parameter table (#268).
    public ArrheniusParametersDto? Arrhenius { get; set; }
    public TunnelingParametersDto? Tunneling { get; set; }
    public TroeParametersDto? Troe { get; set; }
    public TernaryChemicalActivationParametersDto? TernaryChemicalActivation { get; set; }
    public BranchedParametersDto? Branched { get; set; }
    public TaylorSeriesParametersDto? TaylorSeries { get; set; }
    public SurfaceParametersDto? Surface { get; set; }
    public EmissionParametersDto? Emission { get; set; }
    public FirstOrderLossParametersDto? FirstOrderLoss { get; set; }
    public PhotolysisParametersDto? Photolysis { get; set; }
    public UserDefinedParametersDto? UserDefined { get; set; }

    public Guid? GasPhaseId { get; set; }
    public Guid? GasPhaseSpeciesId { get; set; }
    public Guid? AerosolPhaseId { get; set; }
    public Guid? AerosolPhaseSpeciesId { get; set; }
    public Guid? AerosolPhaseWaterId { get; set; }
}

public class ReactantDto
{
    public Guid SpeciesId { get; set; }
    public double Coefficient { get; set; }
}

public class ProductDto
{
    public Guid SpeciesId { get; set; }
    public double Coefficient { get; set; }
    public string? Branch { get; set; }
}

public class ArrheniusParametersDto
{
    public double? A { get; set; }
    public double? B { get; set; }
    public double? C { get; set; }
    public double? Ea { get; set; }
    public double? D { get; set; }
    public double? E { get; set; }
}

public class TunnelingParametersDto
{
    public double? A { get; set; }
    public double? B { get; set; }
    public double? C { get; set; }
}

public class TroeParametersDto
{
    public double? K0A { get; set; }
    public double? K0B { get; set; }
    public double? K0C { get; set; }
    public double? KinfA { get; set; }
    public double? KinfB { get; set; }
    public double? KinfC { get; set; }
    public double? Fc { get; set; }
    public double? N { get; set; }
}

public class TernaryChemicalActivationParametersDto
{
    public double? K0A { get; set; }
    public double? K0B { get; set; }
    public double? K0C { get; set; }
    public double? KinfA { get; set; }
    public double? KinfB { get; set; }
    public double? KinfC { get; set; }
    public double? Fc { get; set; }
    public double? N { get; set; }
}

public class BranchedParametersDto
{
    public double? X { get; set; }
    public double? Y { get; set; }
    public double? A0 { get; set; }
    public double? N { get; set; }
}

public class TaylorSeriesParametersDto
{
    public double? A { get; set; }
    public double? B { get; set; }
    public double? C { get; set; }
    public double? Ea { get; set; }
    public double? D { get; set; }
    public double? E { get; set; }
    public List<double>? TaylorCoefficients { get; set; }
}

public class SurfaceParametersDto
{
    public double? ReactionProbability { get; set; }
}

public class EmissionParametersDto
{
    public double? ScalingFactor { get; set; }
}

public class FirstOrderLossParametersDto
{
    public double? ScalingFactor { get; set; }
}

public class PhotolysisParametersDto
{
    public double? ScalingFactor { get; set; }
}

public class UserDefinedParametersDto
{
    public double? ScalingFactor { get; set; }
}
