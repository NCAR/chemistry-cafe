using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chemistry_Cafe_API.Models;

[Table("mechanisms")]
[Index("FamilyId", Name = "family_id")]
[Index("Name", Name = "idx_mechanisms_name", IsUnique = true)]
public partial class Mechanism
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("family_id")]
    public int FamilyId { get; set; }

    [Column("name")]
    public string Name { get; set; } = null!;

    [Column("description", TypeName = "text")]
    public string? Description { get; set; }

    [Column("created_by")]
    [StringLength(255)]
    public string? CreatedBy { get; set; }

    [Column("created_date", TypeName = "timestamp")]
    public DateTime? CreatedDate { get; set; }

    [ForeignKey("FamilyId")]
    [InverseProperty("Mechanisms")]
    public virtual Family Family { get; set; } = null!;

    [InverseProperty("Mechanism")]
    public virtual ICollection<InitialConditionsSpecy> InitialConditionsSpecies { get; set; } = new List<InitialConditionsSpecy>();

    [InverseProperty("Mechanism")]
    public virtual ICollection<MechanismReaction> MechanismReactions { get; set; } = new List<MechanismReaction>();

    [InverseProperty("Mechanism")]
    public virtual ICollection<MechanismSpecy> MechanismSpecies { get; set; } = new List<MechanismSpecy>();

    [InverseProperty("Mechanism")]
    public virtual ICollection<MechanismVersion> MechanismVersions { get; set; } = new List<MechanismVersion>();

    [InverseProperty("Mechanism")]
    public virtual ICollection<UserMechanism> UserMechanisms { get; set; } = new List<UserMechanism>();
}
