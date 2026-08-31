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

    /// <summary>
    /// Creates a species in the database with a new ID.
    /// Any attributes are implicitly created as well.
    /// </summary>
    /// <param name="species">Species information specified by the user</param>
    /// <param name="familyId">ID of the family this species is a part o</param>
    /// <param name="nameIdentifier">ID of the user creating this species</param>
    /// <returns>Tuple of transaction result and created species</returns>
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

        if (species.ConstantConcentration != null && species.ConstantMixingRatio != null)
        {
            return (QueryResult.ValidationError, null);
        }

        if (species.Id == Guid.Empty)
        {
            return (QueryResult.ValidationError, null);
        }

        if (await _context.Species.AnyAsync(s => s.Id == species.Id))
        {
            return (QueryResult.DuplicateIdError, null);
        }

        Species speciesInfo = new Species
        {
            AbsoluteTolerance = species.AbsoluteTolerance,
            ConstantConcentration = species.ConstantConcentration,
            ConstantMixingRatio = species.ConstantMixingRatio,
            CreatedDate = DateTime.UtcNow,
            Description = species.Description,
            Family = family,
            Id = species.Id,
            IsThirdBody = species.IsThirdBody,
            MolecularWeight = species.MolecularWeight,
            Name = species.Name,
            OtherProperties = species.OtherProperties,
            UpdatedDate = DateTime.UtcNow,
        };

        var createdSpecies = _context.Species.Add(speciesInfo);
        family.Species.Add(createdSpecies.Entity);
        await _context.SaveChangesAsync();

        return (QueryResult.Success, createdSpecies.Entity);
    }

    /// <summary>
    /// Updates the values of a given species.
    /// Any changes to attributes are automatically updated.
    /// </summary>
    /// <param name="id">ID of the species to update</param>
    /// <param name="species">Species information specified by the user</param>
    /// <param name="nameIdentifier">ID of the user updating the species</param>
    /// <returns>Tuple of transaction result and the updated species</returns>
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
            .SingleOrDefaultAsync(s => s.Id == id);
        if (currentSpecies == null)
        {
            return (QueryResult.NotFound, null);
        }

        if (currentSpecies.Family!.Owner.Id.ToString() != nameIdentifier)
        {
            return (QueryResult.NoAccess, null);
        }

        if (species.ConstantConcentration != null && species.ConstantMixingRatio != null)
        {
            return (QueryResult.ValidationError, null);
        }

        currentSpecies.AbsoluteTolerance = species.AbsoluteTolerance;
        currentSpecies.ConstantConcentration = species.ConstantConcentration;
        currentSpecies.ConstantMixingRatio = species.ConstantMixingRatio;
        currentSpecies.Description = species.Description;
        currentSpecies.IsThirdBody = species.IsThirdBody;
        currentSpecies.MolecularWeight = species.MolecularWeight;
        currentSpecies.Name = species.Name;
        currentSpecies.OtherProperties = species.OtherProperties;
        currentSpecies.UpdatedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return (QueryResult.Success, currentSpecies);
    }

    /// <summary>
    /// Deletes a gievn species from the database.
    /// This will also implicitly remove any nested attribute objects
    /// </summary>
    /// <param name="id">ID of the species to delete</param>
    /// <param name="nameIdentifier">ID of the user deleting the species</param>
    /// <returns>Result of the transaction</returns>
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