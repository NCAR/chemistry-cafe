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

    public async Task<(QueryResult, IEnumerable<Species>?)> GetAllSpeciesAsync(Guid? familyId = null)
    {
        IQueryable<Species> query = _context.Species
            .Include(s => s.NumericalAttributes)
            .Include(s => s.StringAttributes);

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

    public async Task<(QueryResult, Species?)> GetSpeciesAsync(Guid id)
    {
        Species? species = await _context.Species
            .Include(s => s.NumericalAttributes)
            .Include(s => s.StringAttributes)
            .SingleOrDefaultAsync(s => s.Id == id);

        if (species == null)
        {
            return (QueryResult.NotFound, null);
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

        // Verify there are no duplicate keys in the attributes
        // This is already a constraint in the database, but this tells the user the issue
        var serializationKeys = species.NumericalAttributes.Select(e => e.SerializationKey)
            .Concat(species.StringAttributes.Select(e => e.SerializationKey));

        if (serializationKeys.Count() != serializationKeys.Distinct().Count())
        {
            return (QueryResult.DuplicateKeyError, null);
        }

        Species speciesInfo = new Species
        {
            CreatedDate = DateTime.UtcNow,
            UpdatedDate = DateTime.UtcNow,
            Name = species.Name,
            Description = species.Description,
            NumericalAttributes = species.NumericalAttributes,
            StringAttributes = species.StringAttributes,
            Family = family,
        };

        var createdSpecies = _context.Species.Add(speciesInfo);
        family.Species.Add(createdSpecies.Entity);
        await _context.SaveChangesAsync();

        return (QueryResult.Success, createdSpecies.Entity);
    }

    public async Task<(QueryResult, Species?)> UpdateSpeciesAsync(Guid id, Species species, string nameIdentifier)
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

        var currentSpecies = await _context.Species
            .Include(s => s.Family)
                .ThenInclude(f => f!.Owner)
            .Include(s => s.NumericalAttributes)
            .Include(s => s.StringAttributes)
            .SingleOrDefaultAsync(s => s.Id == id);
        if (currentSpecies == null)
        {
            return (QueryResult.NotFound, null);
        }

        if (currentSpecies.Family!.Owner.Id.ToString() != nameIdentifier)
        {
            return (QueryResult.NoAccess, null);
        }

        // Verify there are no duplicate keys in the attributes
        // This is already a constraint in the database, but this tells the user the issue
        var serializationKeys = species.NumericalAttributes.Select(e => e.SerializationKey)
            .Concat(species.StringAttributes.Select(e => e.SerializationKey));

        if (serializationKeys.Count() != serializationKeys.Distinct().Count())
        {
            return (QueryResult.DuplicateKeyError, null);
        }

        currentSpecies.UpdatedDate = DateTime.UtcNow;
        currentSpecies.Name = species.Name;
        currentSpecies.Description = species.Description;

        currentSpecies.NumericalAttributes.Clear();
        currentSpecies.NumericalAttributes = species.NumericalAttributes;

        currentSpecies.StringAttributes.Clear();
        currentSpecies.StringAttributes = species.StringAttributes;

        await _context.SaveChangesAsync();

        return (QueryResult.Success, currentSpecies);
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
            .SingleOrDefaultAsync(u => u.Id == userId);
        if (currentUser == null)
        {
            return QueryResult.OwnerNotFound;
        }

        Species? species = await _context.Species
            .Include(s => s.Family)
                .ThenInclude(f => f!.Owner)
            .SingleOrDefaultAsync(s => s.Id == id);

        if (species == null)
        {
            return QueryResult.NotFound;
        }

        if (species.Family!.Owner.Id.ToString() != nameIdentifier)
        {
            return QueryResult.NoAccess;
        }

        _context.Species.Remove(species);
        await _context.SaveChangesAsync();

        return QueryResult.Success;
    }
}