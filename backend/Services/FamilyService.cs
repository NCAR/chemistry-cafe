using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using ChemistryCafeAPI.Models;
using ChemistryCafeAPI.Models.Dto;
using ChemistryCafeAPI.Models.Mappers;

namespace ChemistryCafeAPI.Services;

public class FamilyService
{
    private readonly ChemistryDbContext _context;
    private readonly UserService _userService;

    public FamilyService(ChemistryDbContext context, UserService userService)
    {
        _context = context;
        _userService = userService;
    }

    /// <summary>
    /// Returns every family in the database with some constraints
    /// </summary>
    /// <param name="expand">Adds extra child classes if true. This is mainly false for large bulk queries where the nested objects aren't needed</param>
    /// <param name="userId">User ID constraint to only query families from a certain user if not null</param>
    /// <returns>List of families</returns>
    public async Task<IEnumerable<Family>> GetFamiliesAsync(bool expand, Guid? userId = null)
    {
        IQueryable<Family> query = _context.Families;

        // Always include Owner
        query = query.AsSplitQuery().Include(f => f.Owner);

        if (expand)
        {
            query = query
                .Include(f => f.Owner)
                .Include(f => f.Species)
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
                    .ThenInclude(r => r.Species)
                .Include(f => f.Mechanisms)
                    .ThenInclude(m => m.Species)
                .Include(f => f.Mechanisms)
                    .ThenInclude(m => m.Reactions)
                .Include(f => f.Mechanisms)
                    .ThenInclude(m => m.Phases);
        }

        if (userId != null)
        {
            query = query
                .Where(f => f.Owner.Id == userId);
        }

        var families = await query.ToListAsync();

        return families;
    }

    /// <summary>
    /// Gets a specific family from the database
    /// </summary>
    /// <param name="id">The id of the family</param>
    /// <returns>Family or null if not found</returns>
    public async Task<Family?> GetFamilyAsync(Guid id)
    {
        var family = await _context.Families
            .AsSplitQuery()
            .Include(f => f.Owner)
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
                .ThenInclude(r => r.Species)
            .Include(f => f.Mechanisms)
                .ThenInclude(m => m.Species)
            .Include(f => f.Mechanisms)
                .ThenInclude(m => m.Reactions)
            .Include(f => f.Mechanisms)
                .ThenInclude(m => m.Phases)
            .SingleOrDefaultAsync(f => f.Id == id);
        return family;
    }

    /// <summary>
    /// Creates a family in the database. 
    /// Only shallow values defined by the user are created:
    /// name, description, owner
    /// </summary>
    /// <param name="family">Family information to create</param>
    /// <param name="userId">ID of the owner of the family</param>
    /// <returns>Result of the transaction and the entity entry</returns>
    public async Task<(QueryResult, EntityEntry<Family>?)> CreateFamilyAsync(FamilyDto family, Guid userId)
    {
        User? currentUser = await _userService.GetUserByIdAsync(userId);
        if (currentUser == null)
        {
            return (QueryResult.OwnerNotFound, null);
        }

        if (family.Id != Guid.Empty && await _context.Families.AnyAsync(f => f.Id == family.Id))
        {
            return (QueryResult.DuplicateIdError, null);
        }

        if (HasDuplicateChildIds(family))
        {
            return (QueryResult.ValidationError, null);
        }

        if (FindUnresolvedReferences(family).Count > 0)
        {
            return (QueryResult.ValidationError, null);
        }

        Guid familyId = family.Id == Guid.Empty ? Guid.NewGuid() : family.Id;

        Family familyInfo = new Family
        {
            Id = familyId,
            CreatedDate = DateTime.UtcNow,
            Name = family.Name,
            Description = family.Description,
            Owner = currentUser,
            Species = family.Species.Select(s => s.ToEntity()).ToList(),
            Reactions = family.Reactions.Select(r => r.ToEntity()).ToList(),
        };

        // now we need to create the child objects and link them to the family
        Dictionary<Guid, Species> speciesById = familyInfo.Species.ToDictionary(s => s.Id);
        Dictionary<Guid, Reaction> reactionsById = familyInfo.Reactions.ToDictionary(r => r.Id);

        familyInfo.Phases = family.Phases
            .Select(p =>
            {
                Phase phase = p.ToEntity();
                phase.Species = p.SpeciesIds.Select(id => speciesById[id]).ToList();
                return phase;
            })
            .ToList();
        
        Dictionary<Guid, Phase> phasesById = familyInfo.Phases.ToDictionary(p => p.Id);

        familyInfo.Mechanisms = family.Mechanisms
            .Select(m =>
            {
                Mechanism mechanism = m.ToEntity();
                mechanism.Species = m.SpeciesIds.Select(id => speciesById[id]).ToList();
                mechanism.Reactions = m.ReactionIds.Select(id => reactionsById[id]).ToList();
                mechanism.Phases = m.PhaseIds.Select(id => phasesById[id]).ToList();
                return mechanism;
            })
            .ToList();


        var createdFamily = _context.Families.Add(familyInfo);
        await _context.SaveChangesAsync();

        return (QueryResult.Success, createdFamily);
    }

    /// <summary>
    /// Updates the shallow values of a family: name, description
    /// </summary>
    /// <param name="id">ID of the family to update</param>
    /// <param name="family">family information</param>
    /// <param name="nameIdentifier">ID of he user updating the family</param>
    /// <returns>Result of the transaction</returns>
    public async Task<QueryResult> UpdateFamilyAsync(Guid id, FamilyDto family, string nameIdentifier)
    {
        var existingFamily = await _context.Families
            .AsSplitQuery()
            .Include(f => f.Owner)
            .Include(f => f.Species)
            .Include(f => f.Reactions).ThenInclude(r => r.Reactants)
            .Include(f => f.Reactions).ThenInclude(r => r.Products)
            .Include(f => f.Reactions).ThenInclude(r => r.NumericalAttributes)
            .Include(f => f.Reactions).ThenInclude(r => r.StringAttributes)
            .Include(f => f.Phases).ThenInclude(p => p.Species)
            .Include(f => f.Mechanisms).ThenInclude(m => m.Species)
            .Include(f => f.Mechanisms).ThenInclude(m => m.Reactions)
            .Include(f => f.Mechanisms).ThenInclude(m => m.Phases)
            .SingleOrDefaultAsync(f => f.Id == id);

        if (existingFamily == null)
        {
            return QueryResult.NotFound;
        }

        if (existingFamily.Owner.Id.ToString() != nameIdentifier)
        {
            return QueryResult.NoAccess;
        }

        if (HasDuplicateChildIds(family))
        {
            return QueryResult.ValidationError;
        }

        if (FindUnresolvedReferences(family).Count > 0)
        {
            return QueryResult.ValidationError;
        }

        // Update the easy fields
        existingFamily.Name = family.Name;
        existingFamily.Description = family.Description;

        // reconcile all of the changes in all child objects
        TrackChangesToFamily(family, existingFamily);

        await _context.SaveChangesAsync();
        return QueryResult.Success;
    }

    /// <summary>
    /// Removes a family from the database. This cascades to its children as well.
    /// </summary>
    /// <param name="id">ID of the family</param>
    /// <param name="nameIdentifier">ID of the user deleting the family</param>
    /// <returns>Result of the transaction</returns>
    public async Task<QueryResult> DeleteFamilyAsync(Guid id, string nameIdentifier)
    {
        var family = await _context.Families
            .Include(f => f.Owner)
            .FirstOrDefaultAsync(f => f.Id == id);

        if (family == null)
        {
            return QueryResult.NotFound;
        }

        if (family.Owner.Id.ToString() != nameIdentifier)
        {
            return QueryResult.NoAccess;
        }

        await _context.Families.Where(f => f.Id == id).ExecuteDeleteAsync();
        return QueryResult.Success;
    }

    /// <summary>
    /// Finds every id that a family references but does not define. A phase or a
    /// mechanism may only reference a species, a reaction, or a phase that the
    /// same family contains. A reaction may only reference a species or a phase
    /// that the same family contains. The method returns the ids that do not
    /// resolve, so the caller can reject the graph before it saves.
    /// </summary>
    private static List<Guid> FindUnresolvedReferences(FamilyDto family)
    {
        HashSet<Guid> speciesIds = family.Species.Select(s => s.Id).ToHashSet();
        HashSet<Guid> reactionIds = family.Reactions.Select(r => r.Id).ToHashSet();
        HashSet<Guid> phaseIds = family.Phases.Select(p => p.Id).ToHashSet();

        List<Guid> missing = new();

        // Phase species membership.
        foreach (PhaseDto phase in family.Phases)
        {
            missing.AddRange(phase.SpeciesIds.Where(id => !speciesIds.Contains(id)));
        }

        // Mechanism memberships.
        foreach (MechanismDto mechanism in family.Mechanisms)
        {
            missing.AddRange(mechanism.SpeciesIds.Where(id => !speciesIds.Contains(id)));
            missing.AddRange(mechanism.ReactionIds.Where(id => !reactionIds.Contains(id)));
            missing.AddRange(mechanism.PhaseIds.Where(id => !phaseIds.Contains(id)));
        }

        // Reaction references. Reactants and products point at species, and the
        // gas/aerosol fields point at species or phases.
        foreach (ReactionDto reaction in family.Reactions)
        {
            missing.AddRange(reaction.Reactants.Select(r => r.SpeciesId).Where(id => !speciesIds.Contains(id)));
            missing.AddRange(reaction.Products.Select(p => p.SpeciesId).Where(id => !speciesIds.Contains(id)));

            if (reaction.GasPhaseSpeciesId is Guid gasSpecies && !speciesIds.Contains(gasSpecies))
            {
                missing.Add(gasSpecies);
            }
            if (reaction.AerosolPhaseSpeciesId is Guid aerosolSpecies && !speciesIds.Contains(aerosolSpecies))
            {
                missing.Add(aerosolSpecies);
            }
            if (reaction.AerosolPhaseWaterId is Guid aerosolWater && !speciesIds.Contains(aerosolWater))
            {
                missing.Add(aerosolWater);
            }
            if (reaction.GasPhaseId is Guid gasPhase && !phaseIds.Contains(gasPhase))
            {
                missing.Add(gasPhase);
            }
            if (reaction.AerosolPhaseId is Guid aerosolPhase && !phaseIds.Contains(aerosolPhase))
            {
                missing.Add(aerosolPhase);
            }
        }

        return missing;
    }

    /// <summary>
    /// Returns true if any child collection has duplicates ids
    /// </summary>
    private static bool HasDuplicateChildIds(FamilyDto family)
    {
        return family.Species.Count != family.Species.Select(s => s.Id).Distinct().Count()
            || family.Reactions.Count != family.Reactions.Select(r => r.Id).Distinct().Count()
            || family.Phases.Count != family.Phases.Select(p => p.Id).Distinct().Count()
            || family.Mechanisms.Count != family.Mechanisms.Select(m => m.Id).Distinct().Count();
    }

    /// <summary>
    /// Find the difference between the incoming and existing family graphs
    /// Do this for each child object and make any deletionts, additions, or updates to the existing family graph
    /// </summary>
    private void TrackChangesToFamily(FamilyDto incoming, Family existing)
    {
        HashSet<Guid> incomingSpeciesIds = incoming.Species.Select(s => s.Id).ToHashSet();
        HashSet<Guid> incomingReactionIds = incoming.Reactions.Select(r => r.Id).ToHashSet();
        HashSet<Guid> incomingPhaseIds = incoming.Phases.Select(p => p.Id).ToHashSet();
        HashSet<Guid> incomingMechanismIds = incoming.Mechanisms.Select(m => m.Id).ToHashSet();

        HashSet<Guid> existingSpeciesIds = existing.Species.Select(s => s.Id).ToHashSet();
        HashSet<Guid> existingReactionIds = existing.Reactions.Select(r => r.Id).ToHashSet();
        HashSet<Guid> existingPhaseIds = existing.Phases.Select(p => p.Id).ToHashSet();
        HashSet<Guid> existingMechanismIds = existing.Mechanisms.Select(m => m.Id).ToHashSet();

        // Species changes
        HashSet<Guid> deletedSpeciesIds = existingSpeciesIds.Except(incomingSpeciesIds).ToHashSet();
        HashSet<Guid> newSpeciesIds = incomingSpeciesIds.Except(existingSpeciesIds).ToHashSet();
        HashSet<Guid> maybeUpdatedSpeciesIds = existingSpeciesIds.Intersect(incomingSpeciesIds).ToHashSet();
        deletedSpeciesIds.ToList().ForEach(id => _context.Species.Remove(existing.Species.Single(s => s.Id == id)));
        newSpeciesIds.ToList().ForEach(id => existing.Species.Add(incoming.Species.Single(s => s.Id == id).ToEntity()));
        maybeUpdatedSpeciesIds.ToList().ForEach(id =>
        {
            SpeciesDto incomingSpecies = incoming.Species.Single(s => s.Id == id);
            Species existingSpecies = existing.Species.Single(s => s.Id == id);
            existingSpecies.Name = incomingSpecies.Name;
            existingSpecies.Description = incomingSpecies.Description;
            existingSpecies.MolecularWeight = incomingSpecies.MolecularWeight;
            existingSpecies.IsThirdBody = incomingSpecies.IsThirdBody;
            existingSpecies.ConstantConcentration = incomingSpecies.ConstantConcentration;
            existingSpecies.ConstantMixingRatio = incomingSpecies.ConstantMixingRatio;
            existingSpecies.AbsoluteTolerance = incomingSpecies.AbsoluteTolerance;
            existingSpecies.OtherProperties = incomingSpecies.OtherProperties;
        });

        // Reaction changes
        HashSet<Guid> deletedReactionIds = existingReactionIds.Except(incomingReactionIds).ToHashSet();
        HashSet<Guid> newReactionIds = incomingReactionIds.Except(existingReactionIds).ToHashSet();
        HashSet<Guid> maybeUpdatedReactionIds = existingReactionIds.Intersect(incomingReactionIds).ToHashSet();
        deletedReactionIds.ToList().ForEach(id => _context.Reactions.Remove(existing.Reactions.Single(r => r.Id == id)));
        newReactionIds.ToList().ForEach(id => existing.Reactions.Add(incoming.Reactions.Single(r => r.Id == id).ToEntity()));
        maybeUpdatedReactionIds.ToList().ForEach(id =>
        {
            ReactionDto incomingReaction = incoming.Reactions.Single(r => r.Id == id);
            Reaction existingReaction = existing.Reactions.Single(r => r.Id == id);
            existingReaction.Name = incomingReaction.Name;
            existingReaction.Description = incomingReaction.Description;
            existingReaction.GasPhaseSpeciesId = incomingReaction.GasPhaseSpeciesId;
            existingReaction.AerosolPhaseSpeciesId = incomingReaction.AerosolPhaseSpeciesId;
            existingReaction.AerosolPhaseWaterId = incomingReaction.AerosolPhaseWaterId;
            existingReaction.GasPhaseId = incomingReaction.GasPhaseId;
            existingReaction.AerosolPhaseId = incomingReaction.AerosolPhaseId;
            existingReaction.Reactants = incomingReaction.Reactants.Select(r => r.ToEntity()).ToList();
            existingReaction.Products = incomingReaction.Products.Select(p => p.ToEntity()).ToList();
            existingReaction.NumericalAttributes = incomingReaction.NumericalAttributes.Select(n => n.ToEntity()).ToList();
            existingReaction.StringAttributes = incomingReaction.StringAttributes.Select(s => s.ToEntity()).ToList();
        });

        // Phase changes
        HashSet<Guid> deletedPhaseIds = existingPhaseIds.Except(incomingPhaseIds).ToHashSet();
        HashSet<Guid> newPhaseIds = incomingPhaseIds.Except(existingPhaseIds).ToHashSet();
        HashSet<Guid> maybeUpdatedPhaseIds = existingPhaseIds.Intersect(incomingPhaseIds).ToHashSet();
        deletedPhaseIds.ToList().ForEach(id => _context.Phases.Remove(existing.Phases.Single(p => p.Id == id)));
        newPhaseIds.ToList().ForEach(id => existing.Phases.Add(incoming.Phases.Single(p => p.Id == id).ToEntity()));
        newPhaseIds.ToList().ForEach(id =>
        {
            PhaseDto incomingPhase = incoming.Phases.Single(p => p.Id == id);
            Phase existingPhase = existing.Phases.Single(p => p.Id == id);
            existingPhase.Species = incomingPhase.SpeciesIds.Select(sid => existing.Species.Single(s => s.Id == sid)).ToList();
        });
        maybeUpdatedPhaseIds.ToList().ForEach(id =>
        {
            PhaseDto incomingPhase = incoming.Phases.Single(p => p.Id == id);
            Phase existingPhase = existing.Phases.Single(p => p.Id == id);
            existingPhase.Name = incomingPhase.Name;
            existingPhase.Description = incomingPhase.Description;
            existingPhase.Species = incomingPhase.SpeciesIds.Select(sid => existing.Species.Single(s => s.Id == sid)).ToList();
        });

        // Mechanism changes
        HashSet<Guid> deletedMechanismIds = existingMechanismIds.Except(incomingMechanismIds).ToHashSet();
        HashSet<Guid> newMechanismIds = incomingMechanismIds.Except(existingMechanismIds).ToHashSet();
        HashSet<Guid> maybeUpdatedMechanismIds = existingMechanismIds.Intersect(incomingMechanismIds).ToHashSet();
        deletedMechanismIds.ToList().ForEach(id => _context.Mechanisms.Remove(existing.Mechanisms.Single(m => m.Id == id)));
        newMechanismIds.ToList().ForEach(id => existing.Mechanisms.Add(incoming.Mechanisms.Single(m => m.Id == id).ToEntity()));
        maybeUpdatedMechanismIds.ToList().ForEach(id =>
        {
            MechanismDto incomingMechanism = incoming.Mechanisms.Single(m => m.Id == id);
            Mechanism existingMechanism = existing.Mechanisms.Single(m => m.Id == id);
            existingMechanism.Name = incomingMechanism.Name;
            existingMechanism.Description = incomingMechanism.Description;
            existingMechanism.Species = incomingMechanism.SpeciesIds.Select(sid => existing.Species.Single(s => s.Id == sid)).ToList();
            existingMechanism.Reactions = incomingMechanism.ReactionIds.Select(rid => existing.Reactions.Single(r => r.Id == rid)).ToList();
            existingMechanism.Phases = incomingMechanism.PhaseIds.Select(pid => existing.Phases.Single(p => p.Id == pid)).ToList();
        });
    }
}
