using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Pomelo.EntityFrameworkCore.MySql.Scaffolding.Internal;

namespace Chemistry_Cafe_API.Models;

public partial class ChemistryDbContext : DbContext
{
    public ChemistryDbContext()
    {
    }

    public ChemistryDbContext(DbContextOptions<ChemistryDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Family> Families { get; set; }

    public virtual DbSet<InitialConditionsSpecies> InitialConditionsSpecies { get; set; }

    public virtual DbSet<Mechanism> Mechanisms { get; set; }

    public virtual DbSet<MechanismReaction> MechanismReactions { get; set; }

    public virtual DbSet<MechanismSpecies> MechanismSpecies { get; set; }

    public virtual DbSet<MechanismVersion> MechanismVersions { get; set; }

    public virtual DbSet<Reaction> Reactions { get; set; }

    public virtual DbSet<ReactionSpecies> ReactionSpecies { get; set; }

    public virtual DbSet<Species> Species { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserMechanism> UserMechanisms { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .UseCollation("utf8mb4_0900_ai_ci")
            .HasCharSet("utf8mb4");

        modelBuilder.Entity<Family>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.Property(e => e.CreatedDate).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<InitialConditionsSpecies>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.HasOne(d => d.Mechanism).WithMany(p => p.InitialConditionsSpecies).HasConstraintName("initial_conditions_species_ibfk_1");

            entity.HasOne(d => d.Species).WithMany(p => p.InitialConditionsSpecies).HasConstraintName("initial_conditions_species_ibfk_2");
        });

        modelBuilder.Entity<Mechanism>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.Property(e => e.CreatedDate).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(d => d.Family).WithMany(p => p.Mechanisms).HasConstraintName("mechanisms_ibfk_1");
        });

        modelBuilder.Entity<MechanismReaction>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.HasOne(d => d.Mechanism).WithMany(p => p.MechanismReactions).HasConstraintName("mechanism_reactions_ibfk_1");

            entity.HasOne(d => d.Reaction).WithMany(p => p.MechanismReactions).HasConstraintName("mechanism_reactions_ibfk_2");
        });

        modelBuilder.Entity<MechanismSpecies>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.HasOne(d => d.Mechanism).WithMany(p => p.MechanismSpecies).HasConstraintName("mechanism_species_ibfk_1");

            entity.HasOne(d => d.Species).WithMany(p => p.MechanismSpecies).HasConstraintName("mechanism_species_ibfk_2");
        });

        modelBuilder.Entity<MechanismVersion>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.HasOne(d => d.Mechanism).WithMany(p => p.MechanismVersions).HasConstraintName("mechanism_versions_ibfk_1");
        });

        modelBuilder.Entity<Reaction>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.Property(e => e.CreatedDate).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<ReactionSpecies>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.HasOne(d => d.Reaction).WithMany(p => p.ReactionSpecies).HasConstraintName("reaction_species_ibfk_1");

            entity.HasOne(d => d.Species).WithMany(p => p.ReactionSpecies).HasConstraintName("reaction_species_ibfk_2");
        });

        modelBuilder.Entity<Species>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.Property(e => e.CreatedDate).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.Property(e => e.CreatedDate).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<UserMechanism>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.HasOne(d => d.Mechanism).WithMany(p => p.UserMechanisms).HasConstraintName("user_mechanisms_ibfk_2");

            entity.HasOne(d => d.User).WithMany(p => p.UserMechanisms).HasConstraintName("user_mechanisms_ibfk_1");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
