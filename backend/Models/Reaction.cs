using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using ChemistryCafeAPI.Models.Dto;
using ChemistryCafeAPI.Models.Mappers;

namespace ChemistryCafeAPI.Models;

[Table("Reactions")]
public class Reaction
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? SourceObjectId { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;
    public string Name { get; set; } = null!;
    public string ReactionType { get; set; } = null!;
    public string? Description { get; set; }
    [Column(TypeName = "json")]
    public Dictionary<string, JsonElement>? OtherProperties { get; set; }

    // Dedicated parameter table for Arrhenius reactions. Null for other types.
    public ArrheniusParameters? Arrhenius { get; set; }

    // Dedicated parameter table for Tunneling reactions. Null for other types.
    public TunnelingParameters? Tunneling { get; set; }

    // Dedicated parameter table for Troe reactions. Null for other types.
    public TroeParameters? Troe { get; set; }

    // Dedicated parameter table for Ternary Chemical Activation reactions. Null for other types.
    public TernaryChemicalActivationParameters? TernaryChemicalActivation { get; set; }

    // Dedicated parameter table for Branched (no RO2) reactions. Null for other types.
    public BranchedParameters? Branched { get; set; }

    // Dedicated parameter table for Taylor Series reactions. Null for other types.
    public TaylorSeriesParameters? TaylorSeries { get; set; }

    // Dedicated parameter table for Surface reactions. Null for other types.
    public SurfaceParameters? Surface { get; set; }

    // Dedicated parameter table for Emission reactions. Null for other types.
    public EmissionParameters? Emission { get; set; }

    // Dedicated parameter table for First Order Loss reactions. Null for other types.
    public FirstOrderLossParameters? FirstOrderLoss { get; set; }

    // Dedicated parameter table for Photolysis reactions. Null for other types.
    public PhotolysisParameters? Photolysis { get; set; }

    // Dedicated parameter table for User Defined reactions. Null for other types.
    public UserDefinedParameters? UserDefined { get; set; }


    // Collections of reactants and products (must be species from the same family)
    public ICollection<Reactant> Reactants { get; set; } = new List<Reactant>();
    public ICollection<Product> Products { get; set; } = new List<Product>();

    [ForeignKey("Phases")]
    public Guid? GasPhaseId { get; set; }
    public Phase? GasPhase { get; set; }

    [ForeignKey("Species")]
    public Guid? GasPhaseSpeciesId { get; set; }
    public Species? GasPhaseSpecies { get; set; }

    // Mechanisms that reference this reaction
    [JsonIgnore]
    public ICollection<Mechanism> Mechanisms { get; set; } = new List<Mechanism>();

    // FamilyVersion relationship
    [ForeignKey("FamilyVersion")]
    public Guid FamilyVersionId { get; set; }

    [JsonIgnore]
    public FamilyVersion FamilyVersion { get; set; } = null!;

    /// <summary>
    /// Determines whether this reaction (including reactants, products, and rate parameters) differs from the given DTO.
    /// </summary>
    public bool IsDifferent(ReactionDto other)
    {
        if ((Name ?? "") != (other.Name ?? "") ||
            ReactionType != other.ReactionType ||
            (Description ?? "") != (other.Description ?? "") ||
            GasPhaseId != other.GasPhaseId ||
            GasPhaseSpeciesId != other.GasPhaseSpeciesId ||
            OtherProperties.IsDifferentFrom(other.OtherProperties))
        {
            return true;
        }

        if (Reactants.Count != other.Reactants.Count) return true;
        foreach (var r in other.Reactants)
        {
            var match = Reactants.FirstOrDefault(er => er.SpeciesId == r.SpeciesId);
            if (match == null || match.Coefficient != r.Coefficient) return true;
        }

        if (Products.Count != other.Products.Count) return true;
        foreach (var p in other.Products)
        {
            var match = Products.FirstOrDefault(ep => ep.SpeciesId == p.SpeciesId && (ep.Branch ?? "") == (p.Branch ?? ""));
            if (match == null || match.Coefficient != p.Coefficient) return true;
        }

        if ((Arrhenius != null || other.Arrhenius != null) && (Arrhenius ?? new()).IsDifferent(other.Arrhenius ?? new())) return true;
        if ((Tunneling != null || other.Tunneling != null) && (Tunneling ?? new()).IsDifferent(other.Tunneling ?? new())) return true;
        if ((Troe != null || other.Troe != null) && (Troe ?? new()).IsDifferent(other.Troe ?? new())) return true;
        if ((TernaryChemicalActivation != null || other.TernaryChemicalActivation != null) && (TernaryChemicalActivation ?? new()).IsDifferent(other.TernaryChemicalActivation ?? new())) return true;
        if ((Branched != null || other.Branched != null) && (Branched ?? new()).IsDifferent(other.Branched ?? new())) return true;
        if ((TaylorSeries != null || other.TaylorSeries != null) && (TaylorSeries ?? new()).IsDifferent(other.TaylorSeries ?? new())) return true;
        if ((Surface != null || other.Surface != null) && (Surface ?? new()).IsDifferent(other.Surface ?? new())) return true;
        if ((Emission != null || other.Emission != null) && (Emission ?? new()).IsDifferent(other.Emission ?? new())) return true;
        if ((FirstOrderLoss != null || other.FirstOrderLoss != null) && (FirstOrderLoss ?? new()).IsDifferent(other.FirstOrderLoss ?? new())) return true;
        if ((Photolysis != null || other.Photolysis != null) && (Photolysis ?? new()).IsDifferent(other.Photolysis ?? new())) return true;
        if ((UserDefined != null || other.UserDefined != null) && (UserDefined ?? new()).IsDifferent(other.UserDefined ?? new())) return true;

        return false;
    }

    /// <summary>
    /// Updates this reaction and its rate parameter rows in place from the given DTO.
    /// </summary>
    public void UpdateFrom(ReactionDto other)
    {
        Name = other.Name;
        ReactionType = other.ReactionType;
        Description = other.Description;
        GasPhaseSpeciesId = other.GasPhaseSpeciesId;
        GasPhaseId = other.GasPhaseId;
        Reactants = other.Reactants.Select(r => r.ToEntity()).ToList();
        Products = other.Products.Select(p => p.ToEntity()).ToList();
        OtherProperties = other.OtherProperties;

        if (other.Arrhenius == null) Arrhenius = null;
        else if (Arrhenius == null) Arrhenius = other.Arrhenius.ToEntity();
        else Arrhenius.UpdateFrom(other.Arrhenius);

        if (other.Tunneling == null) Tunneling = null;
        else if (Tunneling == null) Tunneling = other.Tunneling.ToEntity();
        else Tunneling.UpdateFrom(other.Tunneling);

        if (other.Troe == null) Troe = null;
        else if (Troe == null) Troe = other.Troe.ToEntity();
        else Troe.UpdateFrom(other.Troe);

        if (other.TernaryChemicalActivation == null) TernaryChemicalActivation = null;
        else if (TernaryChemicalActivation == null) TernaryChemicalActivation = other.TernaryChemicalActivation.ToEntity();
        else TernaryChemicalActivation.UpdateFrom(other.TernaryChemicalActivation);

        if (other.Branched == null) Branched = null;
        else if (Branched == null) Branched = other.Branched.ToEntity();
        else Branched.UpdateFrom(other.Branched);

        if (other.TaylorSeries == null) TaylorSeries = null;
        else if (TaylorSeries == null) TaylorSeries = other.TaylorSeries.ToEntity();
        else TaylorSeries.UpdateFrom(other.TaylorSeries);

        if (other.Surface == null) Surface = null;
        else if (Surface == null) Surface = other.Surface.ToEntity();
        else Surface.UpdateFrom(other.Surface);

        if (other.Emission == null) Emission = null;
        else if (Emission == null) Emission = other.Emission.ToEntity();
        else Emission.UpdateFrom(other.Emission);

        if (other.FirstOrderLoss == null) FirstOrderLoss = null;
        else if (FirstOrderLoss == null) FirstOrderLoss = other.FirstOrderLoss.ToEntity();
        else FirstOrderLoss.UpdateFrom(other.FirstOrderLoss);

        if (other.Photolysis == null) Photolysis = null;
        else if (Photolysis == null) Photolysis = other.Photolysis.ToEntity();
        else Photolysis.UpdateFrom(other.Photolysis);

        if (other.UserDefined == null) UserDefined = null;
        else if (UserDefined == null) UserDefined = other.UserDefined.ToEntity();
        else UserDefined.UpdateFrom(other.UserDefined);
    }

    /// <summary>
    /// Creates a deep copy of this reaction and its parameters for a new family version snapshot.
    /// </summary>
    public Reaction Clone(
        FamilyVersion targetVersion,
        DateTime timestamp,
        IReadOnlyDictionary<Guid, Species> speciesMap,
        IReadOnlyDictionary<Guid, Phase> phaseMap)
    {
        var reactionId = Guid.NewGuid();
        return new Reaction
        {
            Id = reactionId,
            SourceObjectId = Id,
            FamilyVersionId = targetVersion.Id,
            FamilyVersion = targetVersion,
            Name = Name,
            ReactionType = ReactionType,
            Description = Description,
            CreatedDate = timestamp,
            UpdatedDate = timestamp,
            OtherProperties = OtherProperties.CloneDictionary(),
            GasPhaseId = GasPhaseId.HasValue && phaseMap.ContainsKey(GasPhaseId.Value)
                ? phaseMap[GasPhaseId.Value].Id
                : null,
            GasPhaseSpeciesId = GasPhaseSpeciesId.HasValue && speciesMap.ContainsKey(GasPhaseSpeciesId.Value)
                ? speciesMap[GasPhaseSpeciesId.Value].Id
                : null,
            Reactants = Reactants
                .Where(r => speciesMap.ContainsKey(r.SpeciesId))
                .Select(r => new Reactant
                {
                    ReactionId = reactionId,
                    SpeciesId = speciesMap[r.SpeciesId].Id,
                    Coefficient = r.Coefficient,
                })
                .ToList(),
            Products = Products
                .Where(p => speciesMap.ContainsKey(p.SpeciesId))
                .Select(p => new Product
                {
                    ReactionId = reactionId,
                    SpeciesId = speciesMap[p.SpeciesId].Id,
                    Coefficient = p.Coefficient,
                    Branch = p.Branch,
                })
                .ToList(),
            Arrhenius = Arrhenius?.Clone(reactionId),
            Tunneling = Tunneling?.Clone(reactionId),
            Troe = Troe?.Clone(reactionId),
            TernaryChemicalActivation = TernaryChemicalActivation?.Clone(reactionId),
            Branched = Branched?.Clone(reactionId),
            TaylorSeries = TaylorSeries?.Clone(reactionId),
            Surface = Surface?.Clone(reactionId),
            Emission = Emission?.Clone(reactionId),
            FirstOrderLoss = FirstOrderLoss?.Clone(reactionId),
            Photolysis = Photolysis?.Clone(reactionId),
            UserDefined = UserDefined?.Clone(reactionId),
        };
    }
}

[Table("Reactants")]
[PrimaryKey(nameof(ReactionId), nameof(SpeciesId))]
public class Reactant
{
    // Reaction relationship
    [ForeignKey("Reactions")]
    public Guid ReactionId { get; set; }

    [JsonIgnore]
    public Reaction? Reaction { get; set; }

    // Species relationship (must be from same family as reaction)
    [ForeignKey("Species")]
    public Guid SpeciesId { get; set; }

    [JsonIgnore]
    public Species? Species { get; set; }

    public double Coefficient { get; set; }
}

[Table("Products")]
[PrimaryKey(nameof(ReactionId), nameof(SpeciesId))]
public class Product
{
    // Reaction relationship
    [ForeignKey("Reactions")]
    public Guid ReactionId { get; set; }

    [JsonIgnore]
    public Reaction? Reaction { get; set; }

    // Species relationship (must be from same family as reaction)
    [ForeignKey("Species")]
    public Guid SpeciesId { get; set; }

    [JsonIgnore]
    public Species? Species { get; set; }

    public double Coefficient { get; set; }
    public string? Branch { get; set; }
}

/// <summary>
/// Dedicated parameters for an Arrhenius reaction. Has a one-to-one relationship
/// with a reaction: ReactionId is both the primary key and the foreign key.
/// C and Ea are mutually exclusive; the frontend edits Ea, while C may arrive on
/// import (C = -Ea / kb). All columns are nullable so an unset value stays unset.
/// </summary>
[Table("ArrheniusParameters")]
public class ArrheniusParameters
{
    [Key]
    public Guid ReactionId { get; set; }

    [JsonIgnore]
    public Reaction? Reaction { get; set; }

    public double? A { get; set; }
    public double? B { get; set; }
    public double? C { get; set; }
    public double? Ea { get; set; }
    public double? D { get; set; }
    public double? E { get; set; }

    public bool IsDifferent(ArrheniusParametersDto other) =>
        A != other.A || B != other.B || C != other.C || Ea != other.Ea || D != other.D || E != other.E;

    public void UpdateFrom(ArrheniusParametersDto other)
    {
        A = other.A;
        B = other.B;
        C = other.C;
        Ea = other.Ea;
        D = other.D;
        E = other.E;
    }

    public ArrheniusParameters Clone(Guid reactionId) => new()
    {
        ReactionId = reactionId,
        A = A,
        B = B,
        C = C,
        D = D,
        E = E,
        Ea = Ea,
    };
}

/// <summary>
/// Dedicated parameters for a Tunneling reaction. Has a one-to-one relationship
/// with a reaction: ReactionId is both the primary key and the foreign key.
/// All columns are nullable so an unset value stays unset.
/// </summary>
[Table("TunnelingParameters")]
public class TunnelingParameters
{
    [Key]
    public Guid ReactionId { get; set; }

    [JsonIgnore]
    public Reaction? Reaction { get; set; }

    public double? A { get; set; }
    public double? B { get; set; }
    public double? C { get; set; }

    public bool IsDifferent(TunnelingParametersDto other) =>
        A != other.A || B != other.B || C != other.C;

    public void UpdateFrom(TunnelingParametersDto other)
    {
        A = other.A;
        B = other.B;
        C = other.C;
    }

    public TunnelingParameters Clone(Guid reactionId) => new()
    {
        ReactionId = reactionId,
        A = A,
        B = B,
        C = C,
    };
}

/// <summary>
/// Dedicated parameters for a Troe (fall-off) reaction. Has a one-to-one
/// relationship with a reaction: ReactionId is both the primary key and the
/// foreign key. All columns are nullable so an unset value stays unset.
/// </summary>
[Table("TroeParameters")]
public class TroeParameters
{
    [Key]
    public Guid ReactionId { get; set; }

    [JsonIgnore]
    public Reaction? Reaction { get; set; }

    public double? K0A { get; set; }
    public double? K0B { get; set; }
    public double? K0C { get; set; }
    public double? KinfA { get; set; }
    public double? KinfB { get; set; }
    public double? KinfC { get; set; }
    public double? Fc { get; set; }
    public double? N { get; set; }

    public bool IsDifferent(TroeParametersDto other) =>
        K0A != other.K0A || K0B != other.K0B || K0C != other.K0C ||
        KinfA != other.KinfA || KinfB != other.KinfB || KinfC != other.KinfC ||
        Fc != other.Fc || N != other.N;

    public void UpdateFrom(TroeParametersDto other)
    {
        K0A = other.K0A;
        K0B = other.K0B;
        K0C = other.K0C;
        KinfA = other.KinfA;
        KinfB = other.KinfB;
        KinfC = other.KinfC;
        Fc = other.Fc;
        N = other.N;
    }

    public TroeParameters Clone(Guid reactionId) => new()
    {
        ReactionId = reactionId,
        K0A = K0A,
        K0B = K0B,
        K0C = K0C,
        KinfA = KinfA,
        KinfB = KinfB,
        KinfC = KinfC,
        Fc = Fc,
        N = N,
    };
}

/// <summary>
/// Dedicated parameters for a Ternary Chemical Activation reaction. Has a
/// one-to-one relationship with a reaction: ReactionId is both the primary key
/// and the foreign key. All columns are nullable so an unset value stays unset.
/// </summary>
[Table("TernaryChemicalActivationParameters")]
public class TernaryChemicalActivationParameters
{
    [Key]
    public Guid ReactionId { get; set; }

    [JsonIgnore]
    public Reaction? Reaction { get; set; }

    public double? K0A { get; set; }
    public double? K0B { get; set; }
    public double? K0C { get; set; }
    public double? KinfA { get; set; }
    public double? KinfB { get; set; }
    public double? KinfC { get; set; }
    public double? Fc { get; set; }
    public double? N { get; set; }

    public bool IsDifferent(TernaryChemicalActivationParametersDto other) =>
        K0A != other.K0A || K0B != other.K0B || K0C != other.K0C ||
        KinfA != other.KinfA || KinfB != other.KinfB || KinfC != other.KinfC ||
        Fc != other.Fc || N != other.N;

    public void UpdateFrom(TernaryChemicalActivationParametersDto other)
    {
        K0A = other.K0A;
        K0B = other.K0B;
        K0C = other.K0C;
        KinfA = other.KinfA;
        KinfB = other.KinfB;
        KinfC = other.KinfC;
        Fc = other.Fc;
        N = other.N;
    }

    public TernaryChemicalActivationParameters Clone(Guid reactionId) => new()
    {
        ReactionId = reactionId,
        K0A = K0A,
        K0B = K0B,
        K0C = K0C,
        KinfA = KinfA,
        KinfB = KinfB,
        KinfC = KinfC,
        Fc = Fc,
        N = N,
    };
}

/// <summary>
/// Dedicated parameters for a Branched (no RO2) reaction. Has a one-to-one
/// relationship with a reaction: ReactionId is both the primary key and the
/// foreign key. All columns are nullable so an unset value stays unset.
/// </summary>
[Table("BranchedParameters")]
public class BranchedParameters
{
    [Key]
    public Guid ReactionId { get; set; }

    [JsonIgnore]
    public Reaction? Reaction { get; set; }

    public double? X { get; set; }
    public double? Y { get; set; }
    public double? A0 { get; set; }
    public double? N { get; set; }

    public bool IsDifferent(BranchedParametersDto other) =>
        X != other.X || Y != other.Y || A0 != other.A0 || N != other.N;

    public void UpdateFrom(BranchedParametersDto other)
    {
        X = other.X;
        Y = other.Y;
        A0 = other.A0;
        N = other.N;
    }

    public BranchedParameters Clone(Guid reactionId) => new()
    {
        ReactionId = reactionId,
        X = X,
        Y = Y,
        A0 = A0,
        N = N,
    };
}

/// <summary>
/// Dedicated parameters for a Taylor Series reaction. Has a one-to-one
/// relationship with a reaction: ReactionId is both the primary key and the
/// foreign key. C and Ea are mutually exclusive, as with Arrhenius. All
/// scalar columns are nullable so an unset value stays unset; TaylorCoefficients
/// is stored as JSON since it is a variable-length list.
/// </summary>
[Table("TaylorSeriesParameters")]
public class TaylorSeriesParameters
{
    [Key]
    public Guid ReactionId { get; set; }

    [JsonIgnore]
    public Reaction? Reaction { get; set; }

    public double? A { get; set; }
    public double? B { get; set; }
    public double? C { get; set; }
    public double? Ea { get; set; }
    public double? D { get; set; }
    public double? E { get; set; }
    public List<double>? TaylorCoefficients { get; set; }

    public bool IsDifferent(TaylorSeriesParametersDto other)
    {
        if (A != other.A || B != other.B || C != other.C || Ea != other.Ea || D != other.D || E != other.E)
            return true;

        bool taylorEqual = (TaylorCoefficients == null && other.TaylorCoefficients == null)
            || (TaylorCoefficients != null && other.TaylorCoefficients != null && Enumerable.SequenceEqual(TaylorCoefficients, other.TaylorCoefficients));
        return !taylorEqual;
    }

    public void UpdateFrom(TaylorSeriesParametersDto other)
    {
        A = other.A;
        B = other.B;
        C = other.C;
        Ea = other.Ea;
        D = other.D;
        E = other.E;
        TaylorCoefficients = other.TaylorCoefficients;
    }

    public TaylorSeriesParameters Clone(Guid reactionId) => new()
    {
        ReactionId = reactionId,
        A = A,
        B = B,
        C = C,
        D = D,
        E = E,
        Ea = Ea,
        TaylorCoefficients = TaylorCoefficients != null ? new List<double>(TaylorCoefficients) : null,
    };
}

/// <summary>
/// Dedicated parameters for a Surface reaction. Has a one-to-one relationship
/// with a reaction: ReactionId is both the primary key and the foreign key.
/// Nullable so an unset value stays unset.
/// </summary>
[Table("SurfaceParameters")]
public class SurfaceParameters
{
    [Key]
    public Guid ReactionId { get; set; }

    [JsonIgnore]
    public Reaction? Reaction { get; set; }

    public double? ReactionProbability { get; set; }

    public bool IsDifferent(SurfaceParametersDto other) =>
        ReactionProbability != other.ReactionProbability;

    public void UpdateFrom(SurfaceParametersDto other)
    {
        ReactionProbability = other.ReactionProbability;
    }

    public SurfaceParameters Clone(Guid reactionId) => new()
    {
        ReactionId = reactionId,
        ReactionProbability = ReactionProbability,
    };
}

/// <summary>
/// Dedicated parameters for an Emission reaction. Has a one-to-one
/// relationship with a reaction: ReactionId is both the primary key and the
/// foreign key. Nullable so an unset value stays unset.
/// </summary>
[Table("EmissionParameters")]
public class EmissionParameters
{
    [Key]
    public Guid ReactionId { get; set; }

    [JsonIgnore]
    public Reaction? Reaction { get; set; }

    public double? ScalingFactor { get; set; }

    public bool IsDifferent(EmissionParametersDto other) =>
        ScalingFactor != other.ScalingFactor;

    public void UpdateFrom(EmissionParametersDto other)
    {
        ScalingFactor = other.ScalingFactor;
    }

    public EmissionParameters Clone(Guid reactionId) => new()
    {
        ReactionId = reactionId,
        ScalingFactor = ScalingFactor,
    };
}

/// <summary>
/// Dedicated parameters for a First Order Loss reaction. Has a one-to-one
/// relationship with a reaction: ReactionId is both the primary key and the
/// foreign key. Nullable so an unset value stays unset.
/// </summary>
[Table("FirstOrderLossParameters")]
public class FirstOrderLossParameters
{
    [Key]
    public Guid ReactionId { get; set; }

    [JsonIgnore]
    public Reaction? Reaction { get; set; }

    public double? ScalingFactor { get; set; }

    public bool IsDifferent(FirstOrderLossParametersDto other) =>
        ScalingFactor != other.ScalingFactor;

    public void UpdateFrom(FirstOrderLossParametersDto other)
    {
        ScalingFactor = other.ScalingFactor;
    }

    public FirstOrderLossParameters Clone(Guid reactionId) => new()
    {
        ReactionId = reactionId,
        ScalingFactor = ScalingFactor,
    };
}

/// <summary>
/// Dedicated parameters for a Photolysis reaction. Has a one-to-one
/// relationship with a reaction: ReactionId is both the primary key and the
/// foreign key. Nullable so an unset value stays unset.
/// </summary>
[Table("PhotolysisParameters")]
public class PhotolysisParameters
{
    [Key]
    public Guid ReactionId { get; set; }

    [JsonIgnore]
    public Reaction? Reaction { get; set; }

    public double? ScalingFactor { get; set; }

    public bool IsDifferent(PhotolysisParametersDto other) =>
        ScalingFactor != other.ScalingFactor;

    public void UpdateFrom(PhotolysisParametersDto other)
    {
        ScalingFactor = other.ScalingFactor;
    }

    public PhotolysisParameters Clone(Guid reactionId) => new()
    {
        ReactionId = reactionId,
        ScalingFactor = ScalingFactor,
    };
}

/// <summary>
/// Dedicated parameters for a User Defined reaction. Has a one-to-one
/// relationship with a reaction: ReactionId is both the primary key and the
/// foreign key. Nullable so an unset value stays unset.
/// </summary>
[Table("UserDefinedParameters")]
public class UserDefinedParameters
{
    [Key]
    public Guid ReactionId { get; set; }

    [JsonIgnore]
    public Reaction? Reaction { get; set; }

    public double? ScalingFactor { get; set; }

    public bool IsDifferent(UserDefinedParametersDto other) =>
        ScalingFactor != other.ScalingFactor;

    public void UpdateFrom(UserDefinedParametersDto other)
    {
        ScalingFactor = other.ScalingFactor;
    }

    public UserDefinedParameters Clone(Guid reactionId) => new()
    {
        ReactionId = reactionId,
        ScalingFactor = ScalingFactor,
    };
}