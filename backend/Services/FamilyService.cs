using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using ChemistryCafeAPI.Models;
using ChemistryCafeAPI.Models.Dto;
using ChemistryCafeAPI.Models.Mappers;

namespace ChemistryCafeAPI.Services;

public class FamilyService
{
    private readonly ChemistryDbContext _context;
    private readonly UserService _userService;

    public FamilyService(ChemistryDbContext context, UserService userService)
    {
        _context = context;
        _userService = userService;
    }

    /// <summary>
    /// Returns every family in the database with some constraints
    /// </summary>
    /// <param name="expand">Adds extra child classes if true. This is mainly false for large bulk queries where the nested objects aren't needed</param>
    /// <param name="userId">User ID constraint to only query families from a certain user if not null</param>
    /// <returns>List of families</returns>
    public async Task<IEnumerable<Family>> GetFamiliesAsync(bool expand, Guid? userId = null)
    {
        IQueryable<Family> query = _context.Families;

        // Always include Owner
        query = query.AsSplitQuery().Include(f => f.Owner);

        if (expand)
        {
            query = query
                .Include(f => f.Owner)
                .Include(f => f.Species)
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
                    .ThenInclude(r => r.Species)
                .Include(f => f.Mechanisms)
                    .ThenInclude(m => m.Species)
                .Include(f => f.Mechanisms)
                    .ThenInclude(m => m.Reactions)
                .Include(f => f.Mechanisms)
                    .ThenInclude(m => m.Phases);
        }

        if (userId != null)
        {
            query = query
                .Where(f => f.Owner.Id == userId);
        }

        var families = await query.ToListAsync();

        return families;
    }

    /// <summary>
    /// Gets a specific family from the database
    /// </summary>
    /// <param name="id">The id of the family</param>
    /// <returns>Family or null if not found</returns>
    public async Task<Family?> GetFamilyAsync(Guid id)
    {
        var family = await _context.Families
            .AsSplitQuery()
            .Include(f => f.Owner)
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
                .ThenInclude(r => r.Species)
            .Include(f => f.Mechanisms)
                .ThenInclude(m => m.Species)
            .Include(f => f.Mechanisms)
                .ThenInclude(m => m.Reactions)
            .Include(f => f.Mechanisms)
                .ThenInclude(m => m.Phases)
            .SingleOrDefaultAsync(f => f.Id == id);
        return family;
    }

    /// <summary>
    /// Creates a family in the database. 
    /// Only shallow values defined by the user are created:
    /// name, description, owner
    /// </summary>
    /// <param name="family">Family information to create</param>
    /// <param name="userId">ID of the owner of the family</param>
    /// <returns>Result of the transaction and the entity entry</returns>
    public async Task<(QueryResult, EntityEntry<Family>?)> CreateFamilyAsync(FamilyDto family, Guid userId)
    {
        User? currentUser = await _userService.GetUserByIdAsync(userId);
        if (currentUser == null)
        {
            return (QueryResult.OwnerNotFound, null);
        }

        if (family.Id != Guid.Empty && await _context.Families.AnyAsync(f => f.Id == family.Id))
        {
            return (QueryResult.DuplicateIdError, null);
        }

        Guid familyId = family.Id == Guid.Empty ? Guid.NewGuid() : family.Id;

        Family familyInfo = new Family
        {
            Id = familyId,
            CreatedDate = DateTime.UtcNow,
            Name = family.Name,
            Description = family.Description,
            Owner = currentUser,
            Species = family.Species.Select(s => s.ToEntity()).ToList(),
            Reactions = family.Reactions.Select(r => r.ToEntity()).ToList(),
        };

        // now we need to create the child objects and link them to the family
        Dictionary<Guid, Species> speciesById = familyInfo.Species.ToDictionary(s => s.Id);
        Dictionary<Guid, Reaction> reactionsById = familyInfo.Reactions.ToDictionary(r => r.Id);

        familyInfo.Phases = family.Phases
            .Select(p =>
            {
                Phase phase = p.ToEntity();
                phase.Species = p.SpeciesIds.Select(id => speciesById[id]).ToList();
                return phase;
            })
            .ToList();
        
        Dictionary<Guid, Phase> phasesById = familyInfo.Phases.ToDictionary(p => p.Id);

        familyInfo.Mechanisms = family.Mechanisms
            .Select(m =>
            {
                Mechanism mechanism = m.ToEntity();
                mechanism.Species = m.SpeciesIds.Select(id => speciesById[id]).ToList();
                mechanism.Reactions = m.ReactionIds.Select(id => reactionsById[id]).ToList();
                mechanism.Phases = m.PhaseIds.Select(id => phasesById[id]).ToList();
                return mechanism;
            })
            .ToList();


        var createdFamily = _context.Families.Add(familyInfo);
        await _context.SaveChangesAsync();

        return (QueryResult.Success, createdFamily);
    }

    /// <summary>
    /// Updates the shallow values of a family: name, description
    /// </summary>
    /// <param name="id">ID of the family to update</param>
    /// <param name="family">family information</param>
    /// <param name="nameIdentifier">ID of he user updating the family</param>
    /// <returns>Result of the transaction</returns>
    public async Task<QueryResult> UpdateFamilyAsync(Guid id, FamilyDto family, string nameIdentifier)
    {
        var existingFamily = await _context.Families
            .Include(f => f.Owner)
            .FirstOrDefaultAsync(f => f.Id == id);

        if (existingFamily == null)
        {
            return QueryResult.NotFound;
        }

        if (existingFamily.Owner.Id.ToString() != nameIdentifier)
        {
            return QueryResult.NoAccess;
        }

        // Update allowed fields
        existingFamily.Name = family.Name;
        existingFamily.Description = family.Description;

        await _context.SaveChangesAsync();
        return QueryResult.Success;
    }

    /// <summary>
    /// Removes a family from the database. This cascades to its children as well.
    /// </summary>
    /// <param name="id">ID of the family</param>
    /// <param name="nameIdentifier">ID of the user deleting the family</param>
    /// <returns>Result of the transaction</returns>
    public async Task<QueryResult> DeleteFamilyAsync(Guid id, string nameIdentifier)
    {
        var family = await _context.Families
            .Include(f => f.Owner)
            .FirstOrDefaultAsync(f => f.Id == id);

        if (family == null)
        {
            return QueryResult.NotFound;
        }

        if (family.Owner.Id.ToString() != nameIdentifier)
        {
            return QueryResult.NoAccess;
        }

        await _context.Families.Where(f => f.Id == id).ExecuteDeleteAsync();
        return QueryResult.Success;
    }

    private async Task<Family> TrackChangesToFamily(FamilyDto incoming, Family existing)
    {
        return existing;
    }
}
