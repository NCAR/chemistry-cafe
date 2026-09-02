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
}
