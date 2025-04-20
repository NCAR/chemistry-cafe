using ChemistryCafeAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace ChemistryCafeAPI.Services;

public class PhaseService
{
    private readonly ChemistryDbContext _context;
    private readonly UserService _userService;

    public PhaseService(ChemistryDbContext context, UserService userService)
    {
        _context = context;
        _userService = userService;
    }

    public async Task<(QueryResult, IEnumerable<Phase>?)> GetAllPhasesAsync(Guid? familyId = null)
    {
        IQueryable<Phase> query = _context.Phases
            .Include(p => p.Species);

        if (familyId != null)
        {
            Family? family = await _context.Families.SingleOrDefaultAsync(f => f.Id == familyId);
            if (family == null)
            {
                return (QueryResult.ParentRelationNotFound, null);
            }
            query = query.Where(r => r.FamilyId == familyId);
        }
        var phases = await query.ToListAsync();
        return (QueryResult.Success, phases);
    }

    public async Task<(QueryResult, Phase?)> GetPhaseAsync(Guid id)
    {
        Phase? phase = await _context.Phases
            .Include(p => p.Species)
            .SingleOrDefaultAsync(p => p.Id == id);

        if (phase == null)
        {
            return (QueryResult.NotFound, null);
        }

        return (QueryResult.Success, phase);
    }

    public async Task<(QueryResult, Phase?)> CreatePhaseAsync(Phase phase, Guid familyId, string nameIdentifier)
    {
        Guid userId;
        bool isValidUserId = Guid.TryParse(nameIdentifier, out userId);
        if (!isValidUserId)
        {
            return (QueryResult.ParseError, null);
        }

        User? currentUser = await _context.Users
            .SingleOrDefaultAsync(u => u.Id == userId);
        if (currentUser == null)
        {
            return (QueryResult.OwnerNotFound, null);
        }

        Family? family = await _context.Families
            .Include(f => f.Owner)
            .SingleOrDefaultAsync(f => f.Id == familyId);
        if (family == null)
        {
            return (QueryResult.ParentRelationNotFound, null);
        }

        if (family.Owner.Id.ToString() != nameIdentifier)
        {
            return (QueryResult.NoAccess, null);
        }

        // Verify each species exists and is in the family
        List<Species> phaseSpecies = new List<Species>();
        foreach (var userInputSpecies in phase.Species)
        {
            Species? databaseSpecies = await _context.Species.FindAsync(userInputSpecies.Id);
            if (databaseSpecies == null || databaseSpecies.FamilyId != family.Id)
            {
                return (QueryResult.ChildRelationNotFound, null);
            }

            // Ensure no accidental implicit updating of the species rows
            phaseSpecies.Add(databaseSpecies);
        }

        Phase phaseInfo = new Phase
        {
            CreatedDate = DateTime.UtcNow,
            UpdatedDate = DateTime.UtcNow,
            Name = phase.Name,
            Description = phase.Description,
            Species = phaseSpecies,
            Family = family
        };

        var createdPhase = _context.Phases.Add(phaseInfo);
        family.Phases.Add(createdPhase.Entity);
        await _context.SaveChangesAsync();

        return (QueryResult.Success, createdPhase.Entity);
    }

    public async Task<(QueryResult, Phase?)> UpdatePhaseAsync(Guid id, Phase phase, string nameIdentifier)
    {
        Guid userId;
        bool isValidUserId = Guid.TryParse(nameIdentifier, out userId);
        if (!isValidUserId)
        {
            return (QueryResult.ParseError, null);
        }

        User? currentUser = await _context.Users
            .SingleOrDefaultAsync(u => u.Id == userId);
        if (currentUser == null)
        {
            return (QueryResult.OwnerNotFound, null);
        }

        Phase? currentPhase = await _context.Phases
            .Include(p => p.Family)
            .Include(p => p.Species)
            .SingleOrDefaultAsync(p => p.Id == id);

        if (currentPhase == null)
        {
            return (QueryResult.NotFound, null);
        }

        if (currentPhase.Family!.Owner.Id.ToString() != nameIdentifier)
        {
            return (QueryResult.NoAccess, null);
        }

        // Verify each species exists and is in the family
        currentPhase.Species.Clear();
        foreach (var species in phase.Species)
        {
            var databaseSpecies = await _context.Species.FindAsync(species.Id);
            if (databaseSpecies == null || databaseSpecies.FamilyId != phase.Family!.Id)
            {
                return (QueryResult.ChildRelationNotFound, null);
            }

            // Ensure no accidental implicit updating of the species rows
            currentPhase.Species.Add(databaseSpecies);
        }

        currentPhase.UpdatedDate = DateTime.UtcNow;
        currentPhase.Name = phase.Name;
        currentPhase.Description = phase.Description;

        await _context.SaveChangesAsync();

        return (QueryResult.Success, currentPhase);
    }

    public async Task<QueryResult> DeletePhaseAsync(Guid id, string nameIdentifier)
    {
        Guid userId;
        bool isValidUserId = Guid.TryParse(nameIdentifier, out userId);
        if (!isValidUserId)
        {
            return QueryResult.ParseError;
        }

        User? currentUser = await _context.Users
            .SingleOrDefaultAsync(u => u.Id == userId);
        if (currentUser == null)
        {
            return QueryResult.OwnerNotFound;
        }

        Phase? phase = await _context.Phases
            .Include(p => p.Family)
                .ThenInclude(f => f!.Owner)
            .SingleOrDefaultAsync(p => p.Id == id);

        if (phase == null)
        {
            return QueryResult.NotFound;
        }

        if (phase.Family!.Owner.Id.ToString() != nameIdentifier)
        {
            return QueryResult.NoAccess;
        }

        _context.Phases.Remove(phase);
        await _context.SaveChangesAsync();

        return QueryResult.Success;
    }
}