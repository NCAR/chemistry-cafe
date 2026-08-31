
using ChemistryCafeAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace ChemistryCafeAPI.Services;

public class MechanismService
{
    private readonly ChemistryDbContext _context;

    public MechanismService(ChemistryDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Gets a list of all mechanisms given specified constraints.
    /// If a constraint is null, it is ignored.
    /// </summary>
    /// <param name="familyId">ID of the family the mechanisms belong to</param>
    /// <returns>Tuple of result of the transaction and list of mechanisms</returns>
    public async Task<(QueryResult, IEnumerable<Mechanism>?)> GetAllMechanismsAsync(Guid? familyId = null)
    {
        IQueryable<Mechanism> query = _context.Mechanisms
            .AsSplitQuery()
            .Include(f => f.Species)
            .Include(f => f.Reactions)
                .ThenInclude(r => r.Reactants)
            .Include(f => f.Reactions)
                .ThenInclude(r => r.Products)
            .Include(f => f.Reactions)
                .ThenInclude(r => r.NumericalAttributes)
            .Include(f => f.Reactions)
                .ThenInclude(r => r.StringAttributes)
            .Include(f => f.Phases)
                .ThenInclude(p => p.Species);

        if (familyId != null)
        {
            Family? family = await _context.Families.SingleOrDefaultAsync(f => f.Id == familyId);
            if (family == null)
            {
                return (QueryResult.ParentRelationNotFound, null);
            }
            query = query.Where(r => r.FamilyId == familyId);
        }

        var mechanisms = await query.ToListAsync();
        return (QueryResult.Success, mechanisms);
    }

    /// <summary>
    /// Retrieves a specified mechanism from the database. 
    /// Mechanism is null if not found.
    /// </summary>
    /// <param name="id">ID of the mechanism</param>
    /// <returns>Tuple of transaction result and mechanism</returns>
    public async Task<(QueryResult, Mechanism?)> GetMechanismAsync(Guid id)
    {
        Mechanism? mechanism = await _context.Mechanisms
            .Include(f => f.Species)
            .Include(f => f.Reactions)
                .ThenInclude(r => r.Reactants)
            .Include(f => f.Reactions)
                .ThenInclude(r => r.Products)
            .Include(f => f.Reactions)
                .ThenInclude(r => r.NumericalAttributes)
            .Include(f => f.Reactions)
                .ThenInclude(r => r.StringAttributes)
            .Include(f => f.Phases)
                .ThenInclude(p => p.Species)
            .SingleOrDefaultAsync(m => m.Id == id);

        if (mechanism == null)
        {
            return (QueryResult.NotFound, null);
        }

        return (QueryResult.Success, mechanism);
    }

    /// <summary>
    /// Creates a mechanism in the database with a new ID.
    /// Any nested objects are replaced with their database counterpart to ensure there are no unintentional side-effects.
    /// </summary>
    /// <param name="mechanism">Mechanism information specified by the user</param>
    /// <param name="familyId">ID of the family this mechanism is a part of</param>
    /// <param name="nameIdentifier">ID of the user creating the mechanism</param>
    /// <returns>Tuple of transaction result and created mechanism</returns>
    public async Task<(QueryResult, Mechanism?)> CreateMechanismAsync(Mechanism mechanism, Guid familyId, string nameIdentifier)
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

        if (mechanism.Id != Guid.Empty && await _context.Mechanisms.AnyAsync(m => m.Id == mechanism.Id))
        {
            return (QueryResult.DuplicateIdError, null);
        }

        Mechanism mechanismInfo = new Mechanism
        {
            Id = mechanism.Id == Guid.Empty ? Guid.NewGuid() : mechanism.Id,
            CreatedDate = DateTime.UtcNow,
            UpdatedDate = DateTime.UtcNow,
            Name = mechanism.Name,
            Description = mechanism.Description,
            Family = family,
        };

        foreach (var species in mechanism.Species)
        {
            var databaseSpecies = await _context.Species.FindAsync(species.Id);
            if (databaseSpecies == null || databaseSpecies.FamilyId != family.Id)
            {
                return (QueryResult.ChildRelationNotFound, null);
            }

            // Ensure no implicit updating of the species rows
            mechanismInfo.Species.Add(databaseSpecies);
        }

        List<Reaction> mechanismReactions = new List<Reaction>();
        foreach (var reaction in mechanism.Reactions)
        {
            var databaseReaction = await _context.Reactions.FindAsync(reaction.Id);
            if (databaseReaction == null || databaseReaction.FamilyId != family.Id)
            {
                return (QueryResult.ChildRelationNotFound, null);
            }

            // Ensure no implicit updating of the reaction rows
            mechanismInfo.Reactions.Add(databaseReaction);
        }

        List<Phase> mechanismPhases = new List<Phase>();
        foreach (var phase in mechanism.Phases)
        {
            var databasePhase = await _context.Phases.FindAsync(phase.Id);
            if (databasePhase == null || databasePhase.FamilyId != family.Id)
            {
                return (QueryResult.ChildRelationNotFound, null);
            }

            // Ensure no implicit updating of the phase rows
            mechanismInfo.Phases.Add(databasePhase);
        }

        var createdMechanism = _context.Mechanisms.Add(mechanismInfo);
        family.Mechanisms.Add(createdMechanism.Entity);
        await _context.SaveChangesAsync();

        return (QueryResult.Success, createdMechanism.Entity);
    }

    /// <summary>
    /// Updates the values of a given mechanism.
    /// Any nested objects are replaced with their database counterpart to ensure there are no unintentional side-effects.
    /// </summary>
    /// <param name="id">ID of the mechanism to update</param>
    /// <param name="mechanism">Mechanism information specified by the user</param>
    /// <param name="nameIdentifier">ID of the user updating the mechanism</param>
    /// <returns>Tuple of transaction result and the updated mechanism</returns>
    public async Task<(QueryResult, Mechanism?)> UpdateMechanismAsync(Guid id, Mechanism mechanism, string nameIdentifier)
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

        Mechanism? currentMechanism = await _context.Mechanisms
            .Include(m => m.Family)
                .ThenInclude(f => f!.Owner)
            .Include(m => m.Species)
            .Include(m => m.Reactions)
            .Include(m => m.Phases)
            .SingleOrDefaultAsync(m => m.Id == id);

        if (currentMechanism == null)
        {
            return (QueryResult.NotFound, null);
        }

        if (currentMechanism.Family!.Owner.Id.ToString() != nameIdentifier)
        {
            return (QueryResult.NoAccess, null);
        }

        currentMechanism.Species.Clear();
        foreach (var species in mechanism.Species)
        {
            var databaseSpecies = await _context.Species.FindAsync(species.Id);
            if (databaseSpecies == null || databaseSpecies.FamilyId != currentMechanism.Family!.Id)
            {
                return (QueryResult.ChildRelationNotFound, null);
            }

            // Ensure no implicit updating of the species rows
            currentMechanism.Species.Add(databaseSpecies);
        }

        currentMechanism.Reactions.Clear();
        foreach (var reaction in mechanism.Reactions)
        {
            var databaseReaction = await _context.Reactions.FindAsync(reaction.Id);
            if (databaseReaction == null || databaseReaction.FamilyId != currentMechanism.Family!.Id)
            {
                return (QueryResult.ChildRelationNotFound, null);
            }

            // Ensure no implicit updating of the reaction rows
            currentMechanism.Reactions.Add(databaseReaction);
        }

        currentMechanism.Phases.Clear();
        foreach (var phase in mechanism.Phases)
        {
            var databasePhase = await _context.Phases.FindAsync(phase.Id);
            if (databasePhase == null || databasePhase.FamilyId != currentMechanism.Family!.Id)
            {
                return (QueryResult.ChildRelationNotFound, null);
            }

            // Ensure no implicit updating of the phase rows
            currentMechanism.Phases.Add(databasePhase);
        }

        currentMechanism.UpdatedDate = DateTime.UtcNow;
        currentMechanism.Name = mechanism.Name;
        currentMechanism.Description = mechanism.Description;

        await _context.SaveChangesAsync();

        return (QueryResult.Success, currentMechanism);
    }

    /// <summary>
    /// Deletes a given mechanism from the database.
    /// This will also implicitly remove any junction table rows.
    /// </summary>
    /// <param name="id">ID of the mechanism to delete</param>
    /// <param name="nameIdentifier">ID of the user deleting the mechanism</param>
    /// <returns>Result of the transaction</returns>
    public async Task<QueryResult> DeleteMechanismAsync(Guid id, string nameIdentifier)
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

        Mechanism? mechanism = await _context.Mechanisms
            .Include(m => m.Family)
                .ThenInclude(f => f!.Owner)
            .SingleOrDefaultAsync(m => m.Id == id);

        if (mechanism == null)
        {
            return QueryResult.NotFound;
        }

        if (mechanism.Family!.Owner.Id.ToString() != nameIdentifier)
        {
            return QueryResult.NoAccess;
        }

        _context.Mechanisms.Remove(mechanism);
        await _context.SaveChangesAsync();

        return QueryResult.Success;
    }
}