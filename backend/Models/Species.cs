﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chemistry_Cafe_API.Models;

[Table("species")]
[Index("Name", Name = "idx_species_name", IsUnique = true)]
public partial class Species
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = null!;

    [Column("description", TypeName = "text")]
    public string? Description { get; set; }

    [Column("created_by")]
    [StringLength(255)]
    public string? CreatedBy { get; set; }

    [Column("created_date", TypeName = "timestamp")]
    public DateTime? CreatedDate { get; set; }

    [InverseProperty("Species")]
    public virtual ICollection<InitialConditionsSpecy> InitialConditionsSpecies { get; set; } = new List<InitialConditionsSpecy>();

    [InverseProperty("Species")]
    public virtual ICollection<MechanismSpecy> MechanismSpecies { get; set; } = new List<MechanismSpecy>();

    [InverseProperty("Species")]
    public virtual ICollection<ReactionSpecy> ReactionSpecies { get; set; } = new List<ReactionSpecy>();
}
