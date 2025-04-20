
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
            .Include(m => m.Species)
            .Include(m => m.Phases)
            .Include(m => m.Reactions);

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
}