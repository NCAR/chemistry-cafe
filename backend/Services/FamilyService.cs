using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using ChemistryCafeAPI.Services;
using ChemistryCafeAPI.Models;

namespace ChemistryCafeAPI.Services;

public class FamilyService
{
    private readonly ChemistryDbContext _context;
    private readonly UserService _userService;

    public enum Result
    {
        Success,
        NoAccess,
        NotFound, 
        ParseError,
    }

    public FamilyService(ChemistryDbContext context, UserService userService)
    {
        _context = context;
        _userService = userService;
    }

    public async Task<IEnumerable<Family>> GetFamiliesAsync(bool expand)
    {
        IQueryable<Family> query = _context.Families;
        
        // Always include Owner
        query = query.Include(f => f.Owner);
        
        if (expand)
        {
            query = query
                .Include(f => f.Species)
                .Include(f => f.Mechanisms)
                .Include(f => f.Reactions)
                    .ThenInclude(r => r.Reactants)
                        .ThenInclude(r => r.Species)
                .Include(f => f.Reactions)
                    .ThenInclude(r => r.Products)
                        .ThenInclude(p => p.Species);
        }

        var families = await query.ToListAsync();

        return families;
    }

    public async Task<Family?> GetFamilyAsync(Guid id)
    {
        var family = await _context.Families
            .Include(f => f.Owner)
            .Include(f => f.Species)
                .ThenInclude(s => s.Phases)
            .Include(f => f.Reactions)
                .ThenInclude(r => r.Reactants)
                    .ThenInclude(r => r.Species)
            .Include(f => f.Reactions)
                .ThenInclude(r => r.Products)
                    .ThenInclude(p => p.Species)
            .Include(f => f.Mechanisms)
                .ThenInclude(m => m.Phases)
            .FirstOrDefaultAsync(f => f.Id == id);
        return family;
    }

    public async Task<(Result, EntityEntry<Family>?)> CreateFamilyAsync(Family family, Guid userId)
    {
        User? currentUser = await _userService.GetUserByIdAsync(userId);
        if (currentUser == null)
        {
            return (Result.NotFound, null);
        }

        // Set defaults
        family.Id = Guid.NewGuid();
        family.CreatedDate = DateTime.UtcNow;
        family.Owner = currentUser;
        family.Species = new List<Species>();
        family.Reactions = new List<Reaction>();
        family.Mechanisms = new List<Mechanism>();

        var createdFamily = _context.Families.Add(family);
        await _context.SaveChangesAsync();

        // Return the created family with all relationships loaded
        return (Result.Success, createdFamily);
    }

    public async Task<Result> UpdateFamilyAsync(Guid id, Family family, string nameIdentifier)
    {
        var existingFamily = await _context.Families
            .Include(f => f.Owner)
            .FirstOrDefaultAsync(f => f.Id == id);

        if (existingFamily == null)
        {
            return Result.NotFound;
        }

        if (existingFamily.Owner.Id.ToString() != nameIdentifier)
        {
            return Result.NoAccess;
        }

        // Update allowed fields
        existingFamily.Name = family.Name;
        existingFamily.Description = family.Description;

        await _context.SaveChangesAsync();
        return Result.Success;
    }

    public async Task<Result> DeleteFamilyAsync(Guid id, string nameIdentifier)
    {
        var family = await _context.Families
            .Include(f => f.Owner)
            .FirstOrDefaultAsync(f => f.Id == id);

        if (family == null)
        {
            return Result.NotFound;
        }

        if (family.Owner.Id.ToString() != nameIdentifier)
        {
            return Result.NoAccess;
        }

        await _context.Families.Where(f => f.Id == id).ExecuteDeleteAsync();
        return Result.Success;
    }
}
