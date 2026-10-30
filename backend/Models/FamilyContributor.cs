using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;

namespace ChemistryCafeAPI.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ContributorRole
{
    Viewer = 0,
    Editor = 1,
    Owner = 2
}

[Table("FamilyContributors")]
[PrimaryKey(nameof(FamilyId), nameof(UserId))]
public class FamilyContributor
{
    [ForeignKey("Family")]
    public Guid FamilyId { get; set; }
    [JsonIgnore]
    public Family Family { get; set; } = null!;

    [ForeignKey("User")]
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public ContributorRole Role { get; set; } = ContributorRole.Viewer;
}

