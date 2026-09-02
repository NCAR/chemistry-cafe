using ChemistryCafeAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace ChemistryCafeAPI.Services;

public class SpeciesService
{
    private readonly ChemistryDbContext _context;

    public SpeciesService(ChemistryDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Retrieves a list of all species given specified constraints.
    /// If a constraint is null, it is ignored.
    /// </summary>
    /// <param name="familyId">ID of the family this species belongs to</param>
    /// <returns>Tuple of result of the transaction and list of species</returns>
    public async Task<(QueryResult, IEnumerable<Species>?)> GetAllSpeciesAsync(Guid? familyId = null)
    {
        IQueryable<Species> query = _context.Species;

        if (familyId != null)
        {
            Family? family = await _context.Families.SingleOrDefaultAsync(f => f.Id == familyId);
            if (family == null)
            {
                return (QueryResult.ParentRelationNotFound, null);
            }
            query = query.Where(s => s.FamilyId == familyId);
        }

        var species = await query.ToListAsync();
        return (QueryResult.Success, species);
    }

    /// <summary>
    /// Retrieves a specified species from the database.
    /// Species is null if not found.
    /// </summary>
    /// <param name="id">ID of the species</param>
    /// <returns>Tuple of transaction result and species</returns>
    public async Task<(QueryResult, Species?)> GetSpeciesAsync(Guid id)
    {
        Species? species = await _context.Species
            .SingleOrDefaultAsync(s => s.Id == id);

        if (species == null)
        {
            return (QueryResult.NotFound, null);
        }

        return (QueryResult.Success, species);
    }
}
