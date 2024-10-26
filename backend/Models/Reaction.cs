using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chemistry_Cafe_API.Models;

[Table("reactions")]
[Index("Equation", Name = "equation", IsUnique = true)]
public partial class Reaction
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("equation")]
    [StringLength(512)]
    public string Equation { get; set; } = null!;

    [Column("description", TypeName = "text")]
    public string? Description { get; set; }

    [Column("created_by")]
    [StringLength(255)]
    public string? CreatedBy { get; set; }

    [Column("created_date", TypeName = "timestamp")]
    public DateTime? CreatedDate { get; set; }

    [InverseProperty("Reaction")]
    public virtual ICollection<MechanismReaction> MechanismReactions { get; set; } = new List<MechanismReaction>();

    [InverseProperty("Reaction")]
    public virtual ICollection<ReactionSpecies> ReactionSpecies { get; set; } = new List<ReactionSpecies>();
}
