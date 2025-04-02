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
}