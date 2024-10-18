using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chemistry_Cafe_API.Models;

[Table("mechanism_reactions")]
[Index("ReactionId", Name = "reaction_id")]
[Index("MechanismId", "ReactionId", Name = "unique_mechanism_reaction", IsUnique = true)]
public partial class MechanismReaction
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("mechanism_id")]
    public int MechanismId { get; set; }

    [Column("reaction_id")]
    public int ReactionId { get; set; }

    [ForeignKey("MechanismId")]
    [InverseProperty("MechanismReactions")]
    public virtual Mechanism Mechanism { get; set; } = null!;

    [ForeignKey("ReactionId")]
    [InverseProperty("MechanismReactions")]
    public virtual Reaction Reaction { get; set; } = null!;
}
