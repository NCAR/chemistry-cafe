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
            new User { Id = new Guid("11111111-1111-1111-1111-111111111111"), Username = "jackson.stewart", Role = "admin", Email = "jackson.stewart@tamu.edu" }
        );

        modelBuilder.Entity<Species>().HasData(
            new Species { Id = new Guid("33333333-3333-3333-3333-333333333333"), Name = "H2O", FamilyId = new Guid("22222222-2222-2222-2222-222222222222") },
            new Species { Id = new Guid("44444444-4444-4444-4444-444444444444"), Name = "H2", FamilyId = new Guid("22222222-2222-2222-2222-222222222222") }
        );

        modelBuilder.Entity<Reaction>().HasData(
            new Reaction { Id = new Guid("55555555-5555-5555-5555-555555555555"), Name = "Hydrogen Combustion", FamilyId = new Guid("22222222-2222-2222-2222-222222222222") }
        );

        modelBuilder.Entity<Mechanism>().HasData(
            new Mechanism { Id = new Guid("66666666-6666-6666-6666-666666666666"), Name = "Rocket Launch", Description = "Rocket Launch", FamilyId = new Guid("22222222-2222-2222-2222-222222222222") }
        );

        modelBuilder.Entity<Family>().HasData(
            new Family
            {
                Id = new Guid("22222222-2222-2222-2222-222222222222"),
                Name = "Water",
                Description = "Water is a chemical compound with the formula H2O. It is a transparent, tasteless, odorless, and nearly colorless chemical substance, and it is the main constituent of Earth's hydrosphere and the fluids of all known living organisms.",
                IsPublic = true,
                CreatedDate = DateTime.UtcNow,
                OwnerId = new Guid("11111111-1111-1111-1111-111111111111"),
            }
        );
    }
}
