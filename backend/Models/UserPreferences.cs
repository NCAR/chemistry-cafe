using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ChemistryCafeAPI.Models;

/// <summary>
/// The unit system that the frontend uses to show rate parameters with a concentration unit.
/// The database always stores SI values.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum RateUnits
{
    Molecule,
    SI
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
}
