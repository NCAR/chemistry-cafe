
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

    public async Task<(QueryResult, IEnumerable<Mechanism>?)> GetAllMechanismsAsync(Guid? familyId = null)
    {
        IQueryable<Mechanism> query = _context.Mechanisms
            .Include(f => f.Species)
            .Include(f => f.Reactions)
                .ThenInclude(r => r.Reactants)
                    .ThenInclude(r => r.Species)
            .Include(f => f.Reactions)
                .ThenInclude(r => r.Products)
                    .ThenInclude(p => p.Species)
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

    public async Task<(QueryResult, Mechanism?)> GetMechanismAsync(Guid id)
    {
        Mechanism? mechanism = await _context.Mechanisms
            .Include(f => f.Species)
            .Include(f => f.Reactions)
                .ThenInclude(r => r.Reactants)
                    .ThenInclude(r => r.Species)
            .Include(f => f.Reactions)
                .ThenInclude(r => r.Products)
                    .ThenInclude(p => p.Species)
            .Include(f => f.Phases)
                .ThenInclude(p => p.Species)
            .SingleOrDefaultAsync(m => m.Id == id);

        if (mechanism == null)
        {
            return (QueryResult.NotFound, null);
        }

        return (QueryResult.Success, mechanism);
    }

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

        List<Species> mechanismSpecies = new List<Species>();
        foreach (var species in mechanism.Species)
        {
            var databaseSpecies = await _context.Species.FindAsync(species.Id);
            if (databaseSpecies == null || databaseSpecies.FamilyId != family.Id)
            {
                return (QueryResult.ChildRelationNotFound, null);
            }

            // Ensure no implicit updating of the species rows
            mechanismSpecies.Add(databaseSpecies);
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
            mechanismReactions.Add(databaseReaction);
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
            mechanismPhases.Add(databasePhase);
        }

        Mechanism mechanismInfo = new Mechanism
        {
            CreatedDate = DateTime.UtcNow,
            UpdatedDate = DateTime.UtcNow,
            Name = mechanism.Name,
            Description = mechanism.Description,
            Species = mechanismSpecies,
            Reactions = mechanismReactions,
            Phases = mechanismPhases,
            Family = family,
        };

        var createdMechanism = _context.Mechanisms.Add(mechanismInfo);
        family.Mechanisms.Add(createdMechanism.Entity);
        await _context.SaveChangesAsync();

        return (QueryResult.Success, createdMechanism.Entity);
    }

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

        currentMechanism.Species.Clear();
        foreach (var species in mechanism.Species)
        {
            var databaseSpecies = await _context.Species.FindAsync(species.Id);
            if (databaseSpecies == null || databaseSpecies.FamilyId != currentMechanism.Family!.Owner.Id)
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
            if (databaseReaction == null || databaseReaction.FamilyId != currentMechanism.Family!.Owner.Id)
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
            if (databasePhase == null || databasePhase.FamilyId != currentMechanism.Family!.Owner.Id)
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