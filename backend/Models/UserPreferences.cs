using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ChemistryCafeAPI.Models;

/// <summary>
/// The unit system that the frontend uses to show rate parameters with a concentration unit.
/// The database always stores SI values.
/// The database stores the number of each value, so do not change the numbers.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum RateUnits
{
    Molecule = 0,
    SI = 1
}

/// <summary>
/// The parameter that a user enters for the temperature dependence of Arrhenius and Taylor Series
/// reactions: the activation energy Ea [J] or C [K], with C = -Ea / k_B. The frontend shows the
/// other one as a computed value. A reaction stores only one of them.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ActivationParameter
{
    Ea = 0,
    C = 1
}

/// <summary>
/// Display preferences of a user. Each user has zero or one row.
/// Each reaction type with a concentration-dependent rate parameter has its own rate unit.
/// </summary>
public class UserPreferences
{
    [Key]
    public Guid UserId { get; set; }

    [JsonIgnore]
    public User? User { get; set; }

    public RateUnits ArrheniusRateUnits { get; set; } = RateUnits.Molecule;
    public RateUnits BranchedRateUnits { get; set; } = RateUnits.Molecule;
    public RateUnits TaylorSeriesRateUnits { get; set; } = RateUnits.Molecule;
    public RateUnits TernaryChemicalActivationRateUnits { get; set; } = RateUnits.Molecule;
    public RateUnits TroeRateUnits { get; set; } = RateUnits.Molecule;
    public RateUnits TunnelingRateUnits { get; set; } = RateUnits.Molecule;

    /// <summary>Whether the user enters Ea or C, for all reaction types</summary>
    public ActivationParameter ActivationParameter { get; set; } = ActivationParameter.Ea;
}
