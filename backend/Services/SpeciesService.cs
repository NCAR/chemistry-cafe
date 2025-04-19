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

    public async Task<(QueryResult, IEnumerable<Species>)> GetAllSpeciesAsync()
    {
        IQueryable<Species> query = _context.Species;
        var species = await query.ToListAsync();
        return (QueryResult.Success, species);
    }

    public async Task<(QueryResult, Species?)> GetSpeciesAsync(Guid id)
    {
        Species? species = await _context.Species.FirstOrDefaultAsync(s => s.Id == id);

        if (species == null)
        {
            return (QueryResult.NotFound, species);
        }

        return (QueryResult.Success, species);
    }

    public async Task<(QueryResult, Species?)> CreateSpeciesAsync(Species species, Guid familyId, string nameIdentifier)
    {
        Guid userId;
        bool isValidUserId = Guid.TryParse(nameIdentifier, out userId);
        if (!isValidUserId)
        {
            return (QueryResult.ParseError, null);
        }

        User? currentUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId);
        if (currentUser == null)
        {
            return (QueryResult.OwnerNotFound, null);
        }

        Family? family = await _context.Families
            .Include(f => f.Owner)
            .FirstOrDefaultAsync(f => f.Id == familyId);
        if (family == null)
        {
            return (QueryResult.ParentRelationNotFound, null);
        }

        if (family.Owner.Id.ToString() != nameIdentifier)
        {
            return (QueryResult.NoAccess, null);
        }

        Species speciesInfo = new Species
        {
            CreatedDate = DateTime.UtcNow,
            UpdatedDate = DateTime.UtcNow,
            Name = species.Name,
            Description = species.Description,
            NumericalAttributes = [],
            Family = family,
            FamilyId = family.Id,
        };

        // Create each new attribute
        foreach (var attribute in species.NumericalAttributes)
        {
            speciesInfo.NumericalAttributes.Add(new SpeciesNumericalAttribute
            {
                Species = speciesInfo,
                SerializationKey = attribute.SerializationKey,
                Value = attribute.Value,
            });
        }

        var createdSpecies = _context.Species.Add(speciesInfo);
        family.Species.Add(createdSpecies.Entity);
        await _context.SaveChangesAsync();

        return (QueryResult.Success, createdSpecies.Entity);
    }

    public async Task<QueryResult> UpdateSpeciesAsync(Guid id, Species species, string nameIdentifier)
    {
        Guid userId;
        bool isValidUserId = Guid.TryParse(nameIdentifier, out userId);
        if (!isValidUserId)
        {
            return QueryResult.ParseError;
        }

        User? currentUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId);
        if (currentUser == null)
        {
            return QueryResult.OwnerNotFound;
        }

        var currentSpecies = await _context.Species
            .Include(s => s.Family)
                .ThenInclude(f => f!.Owner)
            .FirstOrDefaultAsync(s => s.Id == id);
        if (currentSpecies == null)
        {
            return QueryResult.NotFound;
        }

        if (currentSpecies.Family!.Owner.Id.ToString() != nameIdentifier)
        {
            return QueryResult.NoAccess;
        }

        currentSpecies.UpdatedDate = DateTime.UtcNow;
        currentSpecies.Name = species.Name;
        currentSpecies.Description = species.Description;
        currentSpecies.NumericalAttributes = species.NumericalAttributes;
        await _context.SaveChangesAsync();

        return QueryResult.Success;
    }

    public async Task<QueryResult> DeleteSpeciesAsync(Guid id, string nameIdentifier)
    {
        Guid userId;
        bool isValidUserId = Guid.TryParse(nameIdentifier, out userId);
        if (!isValidUserId)
        {
            return QueryResult.ParseError;
        }

        User? currentUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId);
        if (currentUser == null)
        {
            return QueryResult.OwnerNotFound;
        }

        Species? species = await _context.Species
            .Include(s => s.Family)
                .ThenInclude(f => f!.Owner)
            .FirstOrDefaultAsync(s => s.Id == id);

        if(species == null)
        {
            return QueryResult.NotFound;
        }

        if(species.Family!.Owner.Id.ToString() != nameIdentifier)
        {
            return QueryResult.NoAccess;
        }

        _context.Species.Remove(species);
        await _context.SaveChangesAsync();

        return QueryResult.Success;
    }
}