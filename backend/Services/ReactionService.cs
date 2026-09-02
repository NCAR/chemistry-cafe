using ChemistryCafeAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace ChemistryCafeAPI.Services;

public class ReactionService
{
    private readonly ChemistryDbContext _context;

    public ReactionService(ChemistryDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Retrieves a list of all reactions given specified constraints.
    /// If a constraint is null, it is ignored.
    /// </summary>
    /// <param name="familyId">ID of the family the reactions belong to</param>
    /// <returns>Tuple of result of the transaction and list of reactions</returns>
    public async Task<(QueryResult, IEnumerable<Reaction>?)> GetAllReactionsAsync(Guid? familyId = null)
    {
        IQueryable<Reaction> query = _context.Reactions
            .Include(r => r.NumericalAttributes)
            .Include(r => r.StringAttributes)
            .Include(r => r.GasPhase)
            .Include(r => r.GasPhaseSpecies)
            .Include(r => r.AerosolPhase)
            .Include(r => r.AerosolPhaseSpecies)
            .Include(r => r.AerosolPhaseWater)
            .Include(r => r.Reactants)
                .ThenInclude(p => p.Species)
            .Include(r => r.Products)
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

        var reactions = await query.ToListAsync();
        return (QueryResult.Success, reactions);
    }

    /// <summary>
    /// Retrieves a specified reaction from the database.
    /// Reaction is null if not found.
    /// </summary>
    /// <param name="id">ID of the reaction</param>
    /// <returns>Tuple of transaction result and reaction</returns>
    public async Task<(QueryResult, Reaction?)> GetReactionAsync(Guid id)
    {
        Reaction? reaction = await _context.Reactions
            .Include(r => r.NumericalAttributes)
            .Include(r => r.StringAttributes)
            .Include(r => r.GasPhase)
            .Include(r => r.GasPhaseSpecies)
            .Include(r => r.AerosolPhase)
            .Include(r => r.AerosolPhaseSpecies)
            .Include(r => r.AerosolPhaseWater)
            .Include(r => r.Reactants)
                .ThenInclude(p => p.Species)
            .Include(r => r.Products)
                .ThenInclude(p => p.Species)
            .SingleOrDefaultAsync(r => r.Id == id);

        if (reaction == null)
        {
            return (QueryResult.NotFound, null);
        }

        return (QueryResult.Success, reaction);
    }
}
