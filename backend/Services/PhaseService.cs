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

    /// <summary>
    /// Retrieves all phases given specified constraints.
    /// If a constrain is null, it is ignored.
    /// </summary>
    /// <param name="familyId">ID of the family these phases belong to</param>
    /// <returns>Tuple of transaction result and list of phases</returns>
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

    /// <summary>
    /// Retrieves a specified phase from the database.
    /// Phase is null if not found
    /// </summary>
    /// <param name="id">ID of the phase</param>
    /// <returns>Tuple of transaction result and phase</returns>
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

    /// <summary>
    /// Creates a phase in the database with a new ID.
    /// Any nested objects are replaced with their database counterpart to ensure there are no unintentional side-effects.
    /// </summary>
    /// <param name="phase">Phase information specified by the user</param>
    /// <param name="familyId">ID of the family this phase is a part of</param>
    /// <param name="nameIdentifier">ID of the user creating the phase</param>
    /// <returns>Tuple of transaction result and created phase</returns>
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

        if (phase.Id == Guid.Empty)
        {
            return (QueryResult.ValidationError, null);
        }

        if (await _context.Phases.AnyAsync(p => p.Id == phase.Id))
        {
            return (QueryResult.DuplicateIdError, null);
        }

        Phase phaseInfo = new Phase
        {
            Id = phase.Id,
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

    /// <summary>
    /// Updates a phase in the database.
    /// Any nested objects are replaced with their database counterpart to ensure there are no unintentional side-effects.
    /// </summary>
    /// <param name="id">ID of the phase</param>
    /// <param name="phase">Phase information specified by the user</param>
    /// <param name="nameIdentifier">ID of the user updating the phase</param>
    /// <returns>Tuple of transaction result and updated phase</returns>
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
                .ThenInclude(f => f!.Owner)
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
            if (databaseSpecies == null || databaseSpecies.FamilyId != currentPhase.Family!.Id)
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

    /// <summary>
    /// Deletes a given phase from the database
    /// This will also implicitly remove any junction table rows.
    /// </summary>
    /// <param name="id">ID of the phase to delete</param>
    /// <param name="nameIdentifier">ID of the user deleting the phase</param>
    /// <returns>Result of the transaction</returns>
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