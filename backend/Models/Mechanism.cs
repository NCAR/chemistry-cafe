using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;

namespace Chemistry_Cafe_API.Models;

[Table("mechanisms")]
[Index("FamilyId", Name = "family_id")]
[Index("Name", Name = "idx_mechanisms_name", IsUnique = true)]
public partial class Mechanism
{
    [Key]
    [Column("id")]
    [JsonPropertyName("id")]
    public Guid Id { get; set; }

    [Column("family_id")]
    [Required]
    [JsonPropertyName("family_id")]
    public Guid FamilyId { get; set; }

    [Column("name")]
    [Required]
    [JsonPropertyName("name")]
    public string Name { get; set; } = null!;

    [Column("description", TypeName = "text")]
    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [Column("created_by")]
    [JsonPropertyName("created_by")]
    [StringLength(255)]
    public string? CreatedBy { get; set; }

    [Column("created_date", TypeName = "timestamp")]
    [JsonPropertyName("created_date")]
    public DateTime? CreatedDate { get; set; }

    [ForeignKey("FamilyId")]

    [JsonIgnore]
    [InverseProperty("Mechanisms")]
    public virtual Family? Family { get; set; } = null!;

    [InverseProperty("Mechanism")]
    [JsonIgnore]
    public virtual ICollection<InitialConditionsSpecies> InitialConditionsSpecies { get; set; } = new List<InitialConditionsSpecies>();

    [InverseProperty("Mechanism")]
    [JsonIgnore]
    public virtual ICollection<MechanismReaction> MechanismReactions { get; set; } = new List<MechanismReaction>();

    [InverseProperty("Mechanism")]
    [JsonIgnore]
    public virtual ICollection<MechanismSpecies> MechanismSpecies { get; set; } = new List<MechanismSpecies>();

    [InverseProperty("Mechanism")]
    [JsonIgnore]
    public virtual ICollection<MechanismVersion> MechanismVersions { get; set; } = new List<MechanismVersion>();

    [InverseProperty("Mechanism")]
    [JsonIgnore]
    public virtual ICollection<UserMechanism> UserMechanisms { get; set; } = new List<UserMechanism>();
}
