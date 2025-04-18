using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Pomelo.EntityFrameworkCore.MySql.Scaffolding.Internal;

namespace ChemistryCafeAPI.Models;

public partial class ChemistryDbContext : DbContext
{
    public ChemistryDbContext()
    {
    }

    public ChemistryDbContext(DbContextOptions<ChemistryDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<User> Users { get; set; }
    public virtual DbSet<Family> Families { get; set; }
    public virtual DbSet<Species> Species { get; set; }
    public virtual DbSet<Phase> Phases { get; set; }
    public virtual DbSet<Mechanism> Mechanisms { get; set; }
    public virtual DbSet<Reaction> Reactions { get; set; }
    public virtual DbSet<Reactant> Reactants { get; set; }
    public virtual DbSet<Product> Products { get; set; }
    public virtual DbSet<MechanismSpecies> MechanismSpecies { get; set; }
    public virtual DbSet<MechanismReaction> MechanismReactions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure junction tables for mechanism references
        modelBuilder.Entity<MechanismSpecies>()
            .HasKey(ms => new { ms.MechanismId, ms.SpeciesId });

        modelBuilder.Entity<MechanismReaction>()
            .HasKey(mr => new { mr.MechanismId, mr.ReactionId });

        // Configure one-to-many relationships for Family
        modelBuilder.Entity<Species>()
            .HasOne(s => s.Family)
            .WithMany(f => f.Species)
            .HasForeignKey(s => s.FamilyId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<SpeciesNumericalAttribute>()
            .HasOne(s => s.Species)
            .WithMany(s => s.NumericalAttributes)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Reaction>()
            .HasOne(r => r.Family)
            .WithMany(f => f.Reactions)
            .HasForeignKey(r => r.FamilyId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ReactionNumericalAttribute>()
            .HasOne(r => r.Reaction)
            .WithMany(r => r.NumericalAttributes)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ReactionStringAttribute>()
            .HasOne(r => r.Reaction)
            .WithMany(r => r.StringAttributes)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Mechanism>()
            .HasOne(m => m.Family)
            .WithMany(f => f.Mechanisms)
            .HasForeignKey(m => m.FamilyId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure Phase relationships
        modelBuilder.Entity<Species>()
            .HasMany(s => s.Phases)
            .WithMany(p => p.Species);

        modelBuilder.Entity<Phase>()
            .HasMany(p => p.Mechanisms)
            .WithMany(m => m.Phases);

        // Configure Reaction relationships
        modelBuilder.Entity<Reactant>()
            .HasOne(r => r.Species)
            .WithMany(s => s.AsReactant)
            .HasForeignKey(r => r.SpeciesId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Product>()
            .HasOne(p => p.Species)
            .WithMany(s => s.AsProduct)
            .HasForeignKey(p => p.SpeciesId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Reactant>()
            .HasOne(r => r.Reaction)
            .WithMany(r => r.Reactants)
            .HasForeignKey(r => r.ReactionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Product>()
            .HasOne(p => p.Reaction)
            .WithMany(r => r.Products)
            .HasForeignKey(p => p.ReactionId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure attribute composite keys
        modelBuilder.Entity<SpeciesNumericalAttribute>()
            .HasKey(s => new { s.SpeciesId, s.SerializationKey });

        modelBuilder.Entity<ReactionNumericalAttribute>()
            .HasKey(r => new { r.ReactionId, r.SerializationKey });

        modelBuilder.Entity<ReactionStringAttribute>()
            .HasKey(r => new { r.ReactionId, r.SerializationKey });
    }
}