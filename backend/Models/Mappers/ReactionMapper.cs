using ChemistryCafeAPI.Models;
using ChemistryCafeAPI.Models.Dto;

namespace ChemistryCafeAPI.Models.Mappers;

public static class ReactionMapper
{
    public static ReactionDto ToDto(this Reaction reaction)
    {
        return new ReactionDto
        {
            Id = reaction.Id,
            FamilyId = reaction.FamilyId,
            Name = reaction.Name,
            ReactionType = reaction.ReactionType,
            Description = reaction.Description,
            Reactants = reaction.Reactants
                .Select(r => new ReactantDto { SpeciesId = r.SpeciesId, Coefficient = r.Coefficient })
                .ToList(),
            Products = reaction.Products
                .Select(p => new ProductDto { SpeciesId = p.SpeciesId, Coefficient = p.Coefficient, Branch = p.Branch })
                .ToList(),
            NumericalAttributes = reaction.NumericalAttributes
                .Select(a => new ReactionNumericalAttributeDto { SerializationKey = a.SerializationKey, Value = a.Value })
                .ToList(),
            StringAttributes = reaction.StringAttributes
                .Select(a => new ReactionStringAttributeDto { SerializationKey = a.SerializationKey, Value = a.Value })
                .ToList(),
            Arrhenius = reaction.Arrhenius?.ToDto(),
            Tunneling = reaction.Tunneling?.ToDto(),
            Troe = reaction.Troe?.ToDto(),
            TernaryChemicalActivation = reaction.TernaryChemicalActivation?.ToDto(),
            Branched = reaction.Branched?.ToDto(),
            TaylorSeries = reaction.TaylorSeries?.ToDto(),
            Surface = reaction.Surface?.ToDto(),
            Emission = reaction.Emission?.ToDto(),
            GasPhaseId = reaction.GasPhaseId,
            GasPhaseSpeciesId = reaction.GasPhaseSpeciesId,
            AerosolPhaseId = reaction.AerosolPhaseId,
            AerosolPhaseSpeciesId = reaction.AerosolPhaseSpeciesId,
            AerosolPhaseWaterId = reaction.AerosolPhaseWaterId,
        };
    }

    /// <summary>
    /// Maps a ReactionDto to a Reaction entity. Reactants/products/attributes are
    /// self-contained value rows, so they are built here; the many-to-many link
    /// to mechanisms is set from the mechanism side during the family save.
    /// </summary>
    public static Reaction ToEntity(this ReactionDto reactionDto)
    {
        return new Reaction
        {
            Id = reactionDto.Id,
            FamilyId = reactionDto.FamilyId,
            Name = reactionDto.Name,
            ReactionType = reactionDto.ReactionType,
            Description = reactionDto.Description,
            Reactants = reactionDto.Reactants.Select(r => r.ToEntity()).ToList(),
            Products = reactionDto.Products.Select(p => p.ToEntity()).ToList(),
            NumericalAttributes = reactionDto.NumericalAttributes.Select(a => a.ToEntity()).ToList(),
            StringAttributes = reactionDto.StringAttributes.Select(a => a.ToEntity()).ToList(),
            Arrhenius = reactionDto.Arrhenius?.ToEntity(),
            Tunneling = reactionDto.Tunneling?.ToEntity(),
            Troe = reactionDto.Troe?.ToEntity(),
            TernaryChemicalActivation = reactionDto.TernaryChemicalActivation?.ToEntity(),
            Branched = reactionDto.Branched?.ToEntity(),
            TaylorSeries = reactionDto.TaylorSeries?.ToEntity(),
            Surface = reactionDto.Surface?.ToEntity(),
            Emission = reactionDto.Emission?.ToEntity(),
            GasPhaseId = reactionDto.GasPhaseId,
            GasPhaseSpeciesId = reactionDto.GasPhaseSpeciesId,
            AerosolPhaseId = reactionDto.AerosolPhaseId,
            AerosolPhaseSpeciesId = reactionDto.AerosolPhaseSpeciesId,
            AerosolPhaseWaterId = reactionDto.AerosolPhaseWaterId,
        };
    }

    public static Reactant ToEntity(this ReactantDto dto) =>
        new Reactant { SpeciesId = dto.SpeciesId, Coefficient = dto.Coefficient };

    public static Product ToEntity(this ProductDto dto) =>
        new Product { SpeciesId = dto.SpeciesId, Coefficient = dto.Coefficient, Branch = dto.Branch };

    public static ReactionNumericalAttribute ToEntity(this ReactionNumericalAttributeDto dto) =>
        new ReactionNumericalAttribute { SerializationKey = dto.SerializationKey, Value = dto.Value };

    public static ReactionStringAttribute ToEntity(this ReactionStringAttributeDto dto) =>
        new ReactionStringAttribute { SerializationKey = dto.SerializationKey, Value = dto.Value };

    public static ArrheniusParametersDto ToDto(this ArrheniusParameters parameters) =>
        new ArrheniusParametersDto
        {
            A = parameters.A,
            B = parameters.B,
            C = parameters.C,
            Ea = parameters.Ea,
            D = parameters.D,
            E = parameters.E,
        };

    public static ArrheniusParameters ToEntity(this ArrheniusParametersDto dto) =>
        new ArrheniusParameters
        {
            A = dto.A,
            B = dto.B,
            C = dto.C,
            Ea = dto.Ea,
            D = dto.D,
            E = dto.E,
        };

    public static TunnelingParametersDto ToDto(this TunnelingParameters parameters) =>
        new TunnelingParametersDto
        {
            A = parameters.A,
            B = parameters.B,
            C = parameters.C,
        };

    public static TunnelingParameters ToEntity(this TunnelingParametersDto dto) =>
        new TunnelingParameters
        {
            A = dto.A,
            B = dto.B,
            C = dto.C,
        };

    public static TroeParametersDto ToDto(this TroeParameters parameters) =>
        new TroeParametersDto
        {
            K0A = parameters.K0A,
            K0B = parameters.K0B,
            K0C = parameters.K0C,
            KinfA = parameters.KinfA,
            KinfB = parameters.KinfB,
            KinfC = parameters.KinfC,
            Fc = parameters.Fc,
            N = parameters.N,
        };

    public static TroeParameters ToEntity(this TroeParametersDto dto) =>
        new TroeParameters
        {
            K0A = dto.K0A,
            K0B = dto.K0B,
            K0C = dto.K0C,
            KinfA = dto.KinfA,
            KinfB = dto.KinfB,
            KinfC = dto.KinfC,
            Fc = dto.Fc,
            N = dto.N,
        };

    public static TernaryChemicalActivationParametersDto ToDto(this TernaryChemicalActivationParameters parameters) =>
        new TernaryChemicalActivationParametersDto
        {
            K0A = parameters.K0A,
            K0B = parameters.K0B,
            K0C = parameters.K0C,
            KinfA = parameters.KinfA,
            KinfB = parameters.KinfB,
            KinfC = parameters.KinfC,
            Fc = parameters.Fc,
            N = parameters.N,
        };

    public static TernaryChemicalActivationParameters ToEntity(this TernaryChemicalActivationParametersDto dto) =>
        new TernaryChemicalActivationParameters
        {
            K0A = dto.K0A,
            K0B = dto.K0B,
            K0C = dto.K0C,
            KinfA = dto.KinfA,
            KinfB = dto.KinfB,
            KinfC = dto.KinfC,
            Fc = dto.Fc,
            N = dto.N,
        };

    public static BranchedParametersDto ToDto(this BranchedParameters parameters) =>
        new BranchedParametersDto
        {
            X = parameters.X,
            Y = parameters.Y,
            A0 = parameters.A0,
            N = parameters.N,
        };

    public static BranchedParameters ToEntity(this BranchedParametersDto dto) =>
        new BranchedParameters
        {
            X = dto.X,
            Y = dto.Y,
            A0 = dto.A0,
            N = dto.N,
        };

    public static TaylorSeriesParametersDto ToDto(this TaylorSeriesParameters parameters) =>
        new TaylorSeriesParametersDto
        {
            A = parameters.A,
            B = parameters.B,
            C = parameters.C,
            Ea = parameters.Ea,
            D = parameters.D,
            E = parameters.E,
            TaylorCoefficients = parameters.TaylorCoefficients,
        };

    public static TaylorSeriesParameters ToEntity(this TaylorSeriesParametersDto dto) =>
        new TaylorSeriesParameters
        {
            A = dto.A,
            B = dto.B,
            C = dto.C,
            Ea = dto.Ea,
            D = dto.D,
            E = dto.E,
            TaylorCoefficients = dto.TaylorCoefficients,
        };

    public static SurfaceParametersDto ToDto(this SurfaceParameters parameters) =>
        new SurfaceParametersDto
        {
            ReactionProbability = parameters.ReactionProbability,
        };

    public static SurfaceParameters ToEntity(this SurfaceParametersDto dto) =>
        new SurfaceParameters
        {
            ReactionProbability = dto.ReactionProbability,
        };

    public static EmissionParametersDto ToDto(this EmissionParameters parameters) =>
        new EmissionParametersDto
        {
            ScalingFactor = parameters.ScalingFactor,
        };

    public static EmissionParameters ToEntity(this EmissionParametersDto dto) =>
        new EmissionParameters
        {
            ScalingFactor = dto.ScalingFactor,
        };
}
