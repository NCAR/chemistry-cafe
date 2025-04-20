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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Species Relations
        modelBuilder.Entity<Species>()
            .HasOne(s => s.Family)
            .WithMany(f => f.Species)
            .HasForeignKey(s => s.FamilyId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<SpeciesNumericalAttribute>()
            .HasOne(s => s.Species)
            .WithMany(s => s.NumericalAttributes)
            .HasForeignKey(na => na.SpeciesId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure Reaction Relations
        modelBuilder.Entity<Reaction>()
            .HasOne(r => r.Family)
            .WithMany(f => f.Reactions)
            .HasForeignKey(r => r.FamilyId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ReactionNumericalAttribute>()
            .HasOne(r => r.Reaction)
            .WithMany(r => r.NumericalAttributes)
            .HasForeignKey(na => na.ReactionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ReactionStringAttribute>()
            .HasOne(r => r.Reaction)
            .WithMany(r => r.StringAttributes)
            .HasForeignKey(sa => sa.ReactionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Reactant>()
            .HasOne(r => r.Species)
            .WithMany(s => s.AsReactant)
            .HasForeignKey(r => r.SpeciesId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Reactant>()
            .HasOne(r => r.Reaction)
            .WithMany(r => r.Reactants)
            .HasForeignKey(r => r.ReactionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Product>()
            .HasOne(p => p.Species)
            .WithMany(s => s.AsProduct)
            .HasForeignKey(p => p.SpeciesId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Product>()
            .HasOne(p => p.Reaction)
            .WithMany(r => r.Products)
            .HasForeignKey(p => p.ReactionId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure Mechanism relationships
        modelBuilder.Entity<Mechanism>()
            .HasOne(m => m.Family)
            .WithMany(f => f.Mechanisms)
            .HasForeignKey(m => m.FamilyId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Mechanism>()
            .HasMany(m => m.Species)
            .WithMany(r => r.Mechanisms)
            .UsingEntity<MechanismSpecies>();

        modelBuilder.Entity<Mechanism>()
            .HasMany(m => m.Reactions)
            .WithMany(r => r.Mechanisms)
            .UsingEntity<MechanismReaction>();

        modelBuilder.Entity<Mechanism>()
            .HasMany(m => m.Phases)
            .WithMany(p => p.Mechanisms)
            .UsingEntity<MechanismPhase>();

        // Configure Phase relationships
        modelBuilder.Entity<Phase>()
            .HasMany(p => p.Species)
            .WithMany(s => s.Phases);

        modelBuilder.Entity<Phase>()
            .HasOne(p => p.Family)
            .WithMany(f => f.Phases)
            .HasForeignKey(p => p.FamilyId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure composite keys
        modelBuilder.Entity<SpeciesNumericalAttribute>()
            .HasKey(s => new { s.SpeciesId, s.SerializationKey });

        modelBuilder.Entity<ReactionNumericalAttribute>()
            .HasKey(r => new { r.ReactionId, r.SerializationKey });

        modelBuilder.Entity<ReactionStringAttribute>()
            .HasKey(r => new { r.ReactionId, r.SerializationKey });

        modelBuilder.Entity<Reactant>()
            .HasKey(r => new { r.ReactionId, r.SpeciesId });

        modelBuilder.Entity<Product>()
            .HasKey(r => new { r.ReactionId, r.SpeciesId });
    }
}