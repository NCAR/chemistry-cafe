namespace ChemistryCafeAPI.Models.Dto;

/// <summary>
/// Data transfer object for the Reaction model. Reactants, products, and
/// attributes are carried inline; phase/species references are ids.
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
    public List<ReactionNumericalAttributeDto> NumericalAttributes { get; set; } = new();
    public List<ReactionStringAttributeDto> StringAttributes { get; set; } = new();

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

public class ReactionNumericalAttributeDto
{
    public string SerializationKey { get; set; } = null!;
    public double Value { get; set; }
}

public class ReactionStringAttributeDto
{
    public string SerializationKey { get; set; } = null!;
    public string Value { get; set; } = null!;
}
