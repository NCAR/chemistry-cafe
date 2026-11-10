using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ChemistryCafeAPI.Models;

[Table("VerifiedMechanismVersions")]
public class VerifiedMechanismVersion
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [ForeignKey("Family")]
    public Guid FamilyId { get; set; }
    [JsonIgnore]
    public Family Family { get; set; } = null!;

    [ForeignKey("FamilyVersion")]
    public Guid FamilyVersionId { get; set; }
    public FamilyVersion FamilyVersion { get; set; } = null!;

    public Guid? SourceMechanismId { get; set; }

    [ForeignKey("Mechanism")]
    public Guid MechanismId { get; set; }
    public Mechanism Mechanism { get; set; } = null!;

    [MaxLength(255)]
    public string Name { get; set; } = null!;

    public string? Notes { get; set; }

    public DateTime VerifiedDate { get; set; } = DateTime.UtcNow;

    [ForeignKey("Verifier")]
    public Guid VerifierId { get; set; }
    public User Verifier { get; set; } = null!;

    public bool IsDeprecated { get; set; } = false;

    public string? DeprecationReason { get; set; }

    public DateTime? DeprecatedDate { get; set; }

    [ForeignKey("DeprecatedBy")]
    public Guid? DeprecatedById { get; set; }
    public User? DeprecatedBy { get; set; }

    public Guid? BetterVersionId { get; set; }

    [Column(TypeName = "json")]
    public string? DeprecationHistoryJson { get; set; }

    public bool IsArchived { get; set; } = false;

    public DateTime? ArchivedDate { get; set; }

    [ForeignKey("ArchivedBy")]
    public Guid? ArchivedById { get; set; }
    public User? ArchivedBy { get; set; }

    public Guid? OriginalFamilyId { get; set; }

    [MaxLength(255)]
    public string? OriginalFamilyName { get; set; }

    public Guid? OriginalOwnerId { get; set; }

    [MaxLength(255)]
    public string? OriginalOwnerUsername { get; set; }

    /// <summary>
    /// Appends a deprecation or undeprecation audit entry to DeprecationHistoryJson.
    /// </summary>
    public void AppendDeprecationHistory(string action, User actor, DateTime timestamp, string? reason, Guid? betterVersionId = null)
    {
        var history = new List<Dictionary<string, object>>();
        if (!string.IsNullOrWhiteSpace(DeprecationHistoryJson))
        {
            try
            {
                var parsed = JsonSerializer.Deserialize<List<Dictionary<string, object>>>(DeprecationHistoryJson);
                if (parsed != null) history = parsed;
            }
            catch { }
        }

        var entry = new Dictionary<string, object>
        {
            ["action"] = action,
            ["who"] = actor.GetDisplayName(),
            ["whoId"] = actor.Id.ToString(),
            ["when"] = timestamp.ToString("o"),
            ["why"] = reason ?? "",
        };
        if (action == "deprecated" || betterVersionId.HasValue)
        {
            entry["betterVersionId"] = betterVersionId?.ToString() ?? "";
        }

        history.Add(entry);
        DeprecationHistoryJson = JsonSerializer.Serialize(history);
    }
}

