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

    /// <summary>
    /// Creates a reaction in the database with a new ID.
    /// 
    /// Any nested objects are replaced with their database counterpart to ensure there are no unintentional side-effects.
    /// An exception to this is the product, reactant, and attribute objects. These update their own properties but not their own nested objects.
    /// </summary>
    /// <param name="reaction">Reaction information specified by the user</param>
    /// <param name="familyId">ID of the family this reaction belongs to</param>
    /// <param name="nameIdentifier">ID of the user creating this reaction</param>
    /// <returns>Tuple of transaction result and created reaction</returns>
    public async Task<(QueryResult, Reaction?)> CreateReactionAsync(Reaction reaction, Guid familyId, string nameIdentifier)
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
        var serializationKeys = reaction.NumericalAttributes.Select(e => e.SerializationKey)
            .Concat(reaction.StringAttributes.Select(e => e.SerializationKey));

        if (serializationKeys.Count() != serializationKeys.Distinct().Count())
        {
            return (QueryResult.DuplicateKeyError, null);
        }

        // Verify all species belong to the family
        foreach (var reactant in reaction.Reactants)
        {
            var species = await _context.Species.FindAsync(reactant.SpeciesId);
            if (species == null || species.FamilyId != family.Id)
            {
                return (QueryResult.ChildRelationNotFound, null);
            }

            // Ensure no implicit updating of the species rows
            reactant.Species = species;
        }

        foreach (var product in reaction.Products)
        {
            var species = await _context.Species.FindAsync(product.SpeciesId);
            if (species == null || species.FamilyId != family.Id)
            {
                return (QueryResult.ChildRelationNotFound, null);
            }

            // Ensure no implicit updating of the species rows
            product.Species = species;
        }

        Reaction reactionInfo = new Reaction
        {
            CreatedDate = DateTime.UtcNow,
            UpdatedDate = DateTime.UtcNow,
            Name = reaction.Name,
            Description = reaction.Description,
            ReactionType = reaction.ReactionType,
            NumericalAttributes = reaction.NumericalAttributes,
            StringAttributes = reaction.StringAttributes,
            Products = reaction.Products,
            Reactants = reaction.Reactants,
            Family = family,
        };

        // Verify phase relationships
        if (reaction.GasPhaseId != null)
        {
            Phase? gasPhase = await _context.Phases.FindAsync(reaction.GasPhaseId);
            if (gasPhase == null)
            {
                return (QueryResult.ChildRelationNotFound, null);
            }
            reactionInfo.GasPhase = gasPhase;
        }

        if (reaction.GasPhaseSpeciesId != null)
        {
            Species? species = await _context.Species.FindAsync(reaction.GasPhaseSpeciesId);
            if (species == null)
            {
                return (QueryResult.ChildRelationNotFound, null);
            }
            reactionInfo.GasPhaseSpecies = species;
        }

        if (reaction.AerosolPhaseId != null)
        {
            Phase? aerosolPhase = await _context.Phases.FindAsync(reaction.AerosolPhaseId);
            if (aerosolPhase == null)
            {
                return (QueryResult.ChildRelationNotFound, null);
            }
            reactionInfo.AerosolPhase = aerosolPhase;
        }

        if (reaction.AerosolPhaseSpeciesId != null)
        {
            Species? species = await _context.Species.FindAsync(reaction.AerosolPhaseSpeciesId);
            if (species == null)
            {
                return (QueryResult.ChildRelationNotFound, null);
            }
            reactionInfo.AerosolPhaseSpecies = species;
        }

        if (reaction.AerosolPhaseWaterId != null)
        {
            Species? species = await _context.Species.FindAsync(reaction.AerosolPhaseWaterId);
            if (species == null)
            {
                return (QueryResult.ChildRelationNotFound, null);
            }
            reactionInfo.AerosolPhaseWater = species;
        }

        var createdReaction = _context.Reactions.Add(reactionInfo);
        family.Reactions.Add(createdReaction.Entity);
        await _context.SaveChangesAsync();

        return (QueryResult.Success, createdReaction.Entity);
    }

    /// <summary>
    /// Updates a reaction in the database.
    /// 
    /// Any nested objects are replaced with their database counterpart to ensure there are no unintentional side-effects.
    /// An exception to this is the product, reactant, and attribute objects. These update their own properties but not their own nested objects.
    /// </summary>
    /// <param name="id">ID of the reaction to update</param>
    /// <param name="reaction">Reaction information specified by the user</param>
    /// <param name="nameIdentifier">ID of the user updating this reaction</param>
    /// <returns>Tuple of transaction result and updated reaction</returns>
    public async Task<(QueryResult, Reaction?)> UpdateReactionAsync(Guid id, Reaction reaction, string nameIdentifier)
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

        var currentReaction = await _context.Reactions
            .Include(r => r.Family)
                .ThenInclude(f => f!.Owner)
            .Include(r => r.NumericalAttributes)
            .Include(r => r.StringAttributes)
            .Include(r => r.Reactants)
                .ThenInclude(p => p.Species)
            .Include(r => r.Products)
                .ThenInclude(p => p.Species)
            .SingleOrDefaultAsync(r => r.Id == id);

        if (currentReaction == null)
        {
            return (QueryResult.NotFound, null);
        }

        if (currentReaction.Family!.Owner.Id.ToString() != nameIdentifier)
        {
            return (QueryResult.NoAccess, null);
        }

        // Verify there are no duplicate keys in the attributes
        // This is already a constraint in the database, but this tells the user the issue
        var serializationKeys = reaction.NumericalAttributes.Select(e => e.SerializationKey)
            .Concat(reaction.StringAttributes.Select(e => e.SerializationKey));

        if (serializationKeys.Count() != serializationKeys.Distinct().Count())
        {
            return (QueryResult.DuplicateKeyError, null);
        }

        // Verify all species belong to the family
        foreach (var reactant in reaction.Reactants)
        {
            var species = await _context.Species.FindAsync(reactant.SpeciesId);
            if (species == null || species.FamilyId != currentReaction.Family!.Id)
            {
                return (QueryResult.ChildRelationNotFound, null);
            }

            // Ensure no implicit updating of the species rows
            reactant.Species = species;
        }

        foreach (var product in reaction.Products)
        {
            var species = await _context.Species.FindAsync(product.SpeciesId);
            if (species == null || species.FamilyId != currentReaction.Family!.Id)
            {
                return (QueryResult.ChildRelationNotFound, null);
            }

            // Ensure no implicit updating of the species rows
            product.Species = species;
        }

        // Verify phase relationships
        if (reaction.GasPhaseId != null)
        {
            Phase? gasPhase = await _context.Phases.FindAsync(reaction.GasPhaseId);
            if (gasPhase == null)
            {
                return (QueryResult.ChildRelationNotFound, null);
            }
            currentReaction.GasPhase = gasPhase;
        }

        if (reaction.GasPhaseSpeciesId != null)
        {
            Species? species = await _context.Species.FindAsync(reaction.GasPhaseSpeciesId);
            if (species == null)
            {
                return (QueryResult.ChildRelationNotFound, null);
            }
            currentReaction.GasPhaseSpecies = species;
        }

        if (reaction.AerosolPhaseId != null)
        {
            Phase? aerosolPhase = await _context.Phases.FindAsync(reaction.AerosolPhaseId);
            if (aerosolPhase == null)
            {
                return (QueryResult.ChildRelationNotFound, null);
            }
            currentReaction.AerosolPhase = aerosolPhase;
        }

        if (reaction.AerosolPhaseSpeciesId != null)
        {
            Species? species = await _context.Species.FindAsync(reaction.AerosolPhaseSpeciesId);
            if (species == null)
            {
                return (QueryResult.ChildRelationNotFound, null);
            }
            currentReaction.AerosolPhaseSpecies = species;
        }

        if (reaction.AerosolPhaseWaterId != null)
        {
            Species? species = await _context.Species.FindAsync(reaction.AerosolPhaseWaterId);
            if (species == null)
            {
                return (QueryResult.ChildRelationNotFound, null);
            }
            currentReaction.AerosolPhaseWater = species;
        }

        currentReaction.UpdatedDate = DateTime.UtcNow;
        currentReaction.Name = reaction.Name;
        currentReaction.Description = reaction.Description;
        currentReaction.ReactionType = reaction.ReactionType;

        currentReaction.Reactants.Clear();
        currentReaction.Reactants = reaction.Reactants;

        currentReaction.Products.Clear();
        currentReaction.Products = reaction.Products;

        currentReaction.StringAttributes.Clear();
        currentReaction.StringAttributes = reaction.StringAttributes;

        currentReaction.NumericalAttributes.Clear();
        currentReaction.NumericalAttributes = reaction.NumericalAttributes;

        await _context.SaveChangesAsync();

        return (QueryResult.Success, currentReaction);
    }

    /// <summary>
    /// Deletes a given reaction from the database.
    /// This will also implicitly remove product, reactant, and attribute table rows.
    /// </summary>
    /// <param name="id">ID of the reaction to delete</param>
    /// <param name="nameIdentifier">ID of the user deleting the reaction</param>
    /// <returns>Result of the transaction</returns>
    public async Task<QueryResult> DeleteReactionAsync(Guid id, string nameIdentifier)
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


        Reaction? reaction = await _context.Reactions
            .Include(r => r.Family)
                .ThenInclude(f => f!.Owner)
            .SingleOrDefaultAsync(r => r.Id == id);

        if (reaction == null)
        {
            return QueryResult.NotFound;
        }

        if (reaction.Family!.Owner.Id.ToString() != nameIdentifier)
        {
            return QueryResult.NoAccess;
        }

        _context.Reactions.Remove(reaction);
        await _context.SaveChangesAsync();

        return QueryResult.Success;
    }
}