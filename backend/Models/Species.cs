﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization; // Added
using Microsoft.EntityFrameworkCore;

namespace Chemistry_Cafe_API.Models;

[Table("species")]
[Index("Name", Name = "idx_species_name", IsUnique = true)]
public partial class Species
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("name")]
    [JsonPropertyName("name")]
    public string Name { get; set; } = null!;

    [Column("description", TypeName = "text")]
    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [Column("created_by")]
    [StringLength(255)]
    [JsonPropertyName("created_by")]
    public string? CreatedBy { get; set; }

    [Column("created_date", TypeName = "timestamp")]
    [JsonPropertyName("created_date")]
    public DateTime? CreatedDate { get; set; }

    [InverseProperty("Species")]
    public virtual ICollection<InitialConditionsSpecies> InitialConditionsSpecies { get; set; } = new List<InitialConditionsSpecies>();

    [InverseProperty("Species")]
    public virtual ICollection<MechanismSpecies> MechanismSpecies { get; set; } = new List<MechanismSpecies>();

    [InverseProperty("Species")]
    public virtual ICollection<ReactionSpecies> ReactionSpecies { get; set; } = new List<ReactionSpecies>();
}
