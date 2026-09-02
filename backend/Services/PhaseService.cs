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
}
