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

    public async Task<(QueryResult, IEnumerable<Reaction>?)> GetAllReactionsAsync(Guid? familyId = null)
    {
        IQueryable<Reaction> query = _context.Reactions
            .Include(r => r.NumericalAttributes)
            .Include(r => r.StringAttributes)
            .Include(r => r.Reactants)
                .ThenInclude(p => p.Species)
            .Include(r => r.Products)
                .ThenInclude(p => p.Species);

        if(familyId != null)
        {
            Family? family = await _context.Families.SingleOrDefaultAsync(f => f.Id == familyId);
            if(family == null)
            {
                return (QueryResult.ParentRelationNotFound, null);
            }
            query = query.Where(r => r.FamilyId == familyId);
        }

        var reactions = await query.ToListAsync();
        return (QueryResult.Success, reactions);
    }

    public async Task<(QueryResult, Reaction?)> GetReactionAsync(Guid id)
    {
        Reaction? reaction = await _context.Reactions
            .Include(r => r.NumericalAttributes)
            .Include(r => r.StringAttributes)
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
        bool duplicateStringAttributes = reaction.StringAttributes
                                                 .GroupBy(sa => sa.SerializationKey)
                                                 .Any(e => e.Count() > 1);

        bool duplicateNumericalAttributes = reaction.NumericalAttributes
                                                 .GroupBy(sa => sa.SerializationKey)
                                                 .Any(e => e.Count() > 1);

        if (duplicateStringAttributes || duplicateNumericalAttributes)
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

        var createdReaction = _context.Reactions.Add(reactionInfo);
        family.Reactions.Add(createdReaction.Entity);
        await _context.SaveChangesAsync();

        return (QueryResult.Success, createdReaction.Entity);
    }

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
        bool duplicateStringAttributes = reaction.StringAttributes
            .GroupBy(sa => sa.SerializationKey)
            .Any(e => e.Count() > 1);

        bool duplicateNumericalAttributes = reaction.NumericalAttributes
            .GroupBy(na => na.SerializationKey)
            .Any(e => e.Count() > 1);

        if (duplicateStringAttributes || duplicateNumericalAttributes)
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
        
        if(reaction == null)
        {
            return QueryResult.NotFound;
        }

        if(reaction.Family!.Owner.Id.ToString() != nameIdentifier)
        {
            return QueryResult.NoAccess;
        }

        _context.Reactions.Remove(reaction);
        await _context.SaveChangesAsync();

        return QueryResult.Success;
    }
}