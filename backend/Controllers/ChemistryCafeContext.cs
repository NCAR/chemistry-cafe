using ChemistryCafeAPI.Models;

using Microsoft.EntityFrameworkCore;

namespace ChemistryCafeAPI.Controllers;

public class ChemistryCafeContext : DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<Family> Families { get; set; }
    public DbSet<Mechanism> Mechanisms { get; set; }
    public DbSet<Reaction> Reactions { get; set; }
    public DbSet<Species> Species { get; set; }

    public ChemistryCafeContext(DbContextOptions<ChemistryCafeContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>().HasData(
            new User { Id = Guid.NewGuid(), Username = "jackson.stewart", Role = "admin", Email = "jackson.stewart@tamu.edu" }
        );
    }
}