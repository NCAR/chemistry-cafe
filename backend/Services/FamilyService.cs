using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using ChemistryCafeAPI.Models;
using ChemistryCafeAPI.Models.Dto;
using ChemistryCafeAPI.Models.Mappers;

namespace ChemistryCafeAPI.Services;

public class FamilyService(ChemistryDbContext context, UserService? userService = null)
{
    private readonly UserService _userService = userService ?? new UserService(context);

    /// <summary>
    /// Returns every family in the database with some constraints
    /// </summary>
    /// <param name="expand">Adds extra child classes if true. This is mainly false for large bulk queries where the nested objects aren't needed</param>
    /// <param name="userId">User ID constraint to only query families from a certain user if not null</param>
    /// <returns>List of families</returns>
    public async Task<IEnumerable<Family>> GetFamiliesAsync(bool expand, Guid? userId = null)
    {
        IQueryable<Family> query = context.Families;

        // Always include Owner
        query = query.AsSplitQuery().Include(f => f.Owner);

        if (expand)
        {
            query = query
                .Include(f => f.Owner)
                .Include(f => f.CurrentVersion)
                        .ThenInclude(v => v.Species)
                .Include(f => f.CurrentVersion)
                        .ThenInclude(v => v.Reactions)
                        .ThenInclude(r => r.Reactants)
                .Include(f => f.CurrentVersion)
                        .ThenInclude(v => v.Reactions)
                        .ThenInclude(r => r.Products)
                .Include(f => f.CurrentVersion)
                        .ThenInclude(v => v.Reactions)
                        .ThenInclude(r => r.Arrhenius)
                .Include(f => f.CurrentVersion)
                        .ThenInclude(v => v.Reactions)
                        .ThenInclude(r => r.Tunneling)
                .Include(f => f.CurrentVersion)
                        .ThenInclude(v => v.Reactions)
                        .ThenInclude(r => r.Troe)
                .Include(f => f.CurrentVersion)
                        .ThenInclude(v => v.Reactions)
                        .ThenInclude(r => r.TernaryChemicalActivation)
                .Include(f => f.CurrentVersion)
                        .ThenInclude(v => v.Reactions)
                        .ThenInclude(r => r.Branched)
                .Include(f => f.CurrentVersion)
                        .ThenInclude(v => v.Reactions)
                        .ThenInclude(r => r.TaylorSeries)
                .Include(f => f.CurrentVersion)
                        .ThenInclude(v => v.Reactions)
                        .ThenInclude(r => r.Surface)
                .Include(f => f.CurrentVersion)
                        .ThenInclude(v => v.Reactions)
                        .ThenInclude(r => r.Emission)
                .Include(f => f.CurrentVersion)
                        .ThenInclude(v => v.Reactions)
                        .ThenInclude(r => r.FirstOrderLoss)
                .Include(f => f.CurrentVersion)
                        .ThenInclude(v => v.Reactions)
                        .ThenInclude(r => r.Photolysis)
                .Include(f => f.CurrentVersion)
                        .ThenInclude(v => v.Reactions)
                        .ThenInclude(r => r.UserDefined)
                .Include(f => f.CurrentVersion)
                        .ThenInclude(v => v.Phases)
                        .ThenInclude(p => p.PhaseSpecies)
                .Include(f => f.Mechanisms)
                    .ThenInclude(m => m.Species)
                .Include(f => f.Mechanisms)
                    .ThenInclude(m => m.Reactions)
                .Include(f => f.Mechanisms)
                    .ThenInclude(m => m.Phases)
                .Include(f => f.Mechanisms)
                    .ThenInclude(m => m.ValidatedBy);
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
        var family = await context.Families
            .AsSplitQuery()
            .Include(f => f.Owner)
            .Include(f => f.Versions)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Species)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Reactions)
                .ThenInclude(r => r.Reactants)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Reactions)
                .ThenInclude(r => r.Products)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Reactions)
                .ThenInclude(r => r.Arrhenius)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Reactions)
                .ThenInclude(r => r.Tunneling)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Reactions)
                .ThenInclude(r => r.Troe)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Reactions)
                .ThenInclude(r => r.TernaryChemicalActivation)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Reactions)
                .ThenInclude(r => r.Branched)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Reactions)
                .ThenInclude(r => r.TaylorSeries)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Reactions)
                .ThenInclude(r => r.Surface)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Reactions)
                .ThenInclude(r => r.Emission)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Reactions)
                .ThenInclude(r => r.FirstOrderLoss)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Reactions)
                .ThenInclude(r => r.Photolysis)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Reactions)
                .ThenInclude(r => r.UserDefined)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Phases)
                .ThenInclude(p => p.Species)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Phases)
                .ThenInclude(p => p.PhaseSpecies)
            .Include(f => f.Mechanisms)
                .ThenInclude(m => m.Species)
            .Include(f => f.Mechanisms)
                .ThenInclude(m => m.Reactions)
            .Include(f => f.Mechanisms)
                .ThenInclude(m => m.Phases)
            .Include(f => f.Mechanisms)
                .ThenInclude(m => m.ValidatedBy)
            .SingleOrDefaultAsync(f => f.Id == id);

        if (family != null && family.CurrentVersion == null)
        {
            var latestVersion = await context.FamilyVersions
                .Include(v => v.Species)
                .Include(v => v.Reactions).ThenInclude(r => r.Reactants)
                .Include(v => v.Reactions).ThenInclude(r => r.Products)
                .Include(v => v.Reactions).ThenInclude(r => r.Arrhenius)
                .Include(v => v.Reactions).ThenInclude(r => r.Tunneling)
                .Include(v => v.Reactions).ThenInclude(r => r.Troe)
                .Include(v => v.Reactions).ThenInclude(r => r.TernaryChemicalActivation)
                .Include(v => v.Reactions).ThenInclude(r => r.Branched)
                .Include(v => v.Reactions).ThenInclude(r => r.TaylorSeries)
                .Include(v => v.Reactions).ThenInclude(r => r.Surface)
                .Include(v => v.Reactions).ThenInclude(r => r.Emission)
                .Include(v => v.Reactions).ThenInclude(r => r.FirstOrderLoss)
                .Include(v => v.Reactions).ThenInclude(r => r.Photolysis)
                .Include(v => v.Reactions).ThenInclude(r => r.UserDefined)
                .Include(v => v.Phases).ThenInclude(p => p.Species)
                .Where(v => v.FamilyId == family.Id)
                .OrderByDescending(v => v.CreatedDate)
                .FirstOrDefaultAsync();

            if (latestVersion != null)
            {
                family.CurrentVersion = latestVersion;
                family.CurrentVersionId = latestVersion.Id;
            }
        }

        return family;
    }

    /// <summary>
    /// Gets a specific snapshot version of a family.
    /// </summary>
    /// <param name="familyId">The family ID</param>
    /// <param name="versionId">The version ID</param>
    /// <returns>The FamilyVersion or null if not found</returns>
    public async Task<FamilyVersion?> GetFamilyVersionAsync(Guid familyId, Guid versionId)
    {
        var version = await context.FamilyVersions
            .AsSplitQuery()
            .Include(v => v.Species)
            .Include(v => v.Reactions).ThenInclude(r => r.Reactants)
            .Include(v => v.Reactions).ThenInclude(r => r.Products)
            .Include(v => v.Reactions).ThenInclude(r => r.Arrhenius)
            .Include(v => v.Reactions).ThenInclude(r => r.Tunneling)
            .Include(v => v.Reactions).ThenInclude(r => r.Troe)
            .Include(v => v.Reactions).ThenInclude(r => r.TernaryChemicalActivation)
            .Include(v => v.Reactions).ThenInclude(r => r.Branched)
            .Include(v => v.Reactions).ThenInclude(r => r.TaylorSeries)
            .Include(v => v.Reactions).ThenInclude(r => r.Surface)
            .Include(v => v.Reactions).ThenInclude(r => r.Emission)
            .Include(v => v.Reactions).ThenInclude(r => r.FirstOrderLoss)
            .Include(v => v.Reactions).ThenInclude(r => r.Photolysis)
            .Include(v => v.Reactions).ThenInclude(r => r.UserDefined)
            .Include(v => v.Phases).ThenInclude(p => p.Species)
            .FirstOrDefaultAsync(v => v.Id == versionId && v.FamilyId == familyId);

        return version;
    }

    /// <summary>
    /// Creates a family in the database. 
    /// Only shallow values defined by the user are created:
    /// name, description, owner
    /// </summary>
    /// <param name="family">Family information to create</param>
    /// <param name="currentUser">ID of the owner of the family</param>
    /// <returns>Result of the transaction and the entity entry</returns>
    public async Task<(QueryResult, EntityEntry<Family>?)> CreateFamilyAsync(FamilyDto family, User? currentUser)
    {
        if (currentUser == null)
        {
            return (QueryResult.OwnerNotFound, null);
        }

        if (family.Id != Guid.Empty && await context.Families.AnyAsync(f => f.Id == family.Id))
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

        if (family.Mechanisms.Any(m => m.ValidationStatus == ValidationStatus.Validated) &&
            currentUser.Role != Role.Admin && currentUser.Role != Role.Verifier)
        {
            return (QueryResult.NoAccess, null);
        }

        Guid familyId = family.Id == Guid.Empty ? Guid.NewGuid() : family.Id;

        FamilyVersion initialVersion = new FamilyVersion
        {
            Id = Guid.NewGuid(),
            FamilyId = familyId,
            CreatedDate = DateTime.UtcNow,
            Species = family.Species.Select(s => s.ToEntity()).ToList(),
            Reactions = family.Reactions.Select(r => r.ToEntity()).ToList(),
        };

        Family familyInfo = new Family
        {
            Id = familyId,
            CreatedDate = DateTime.UtcNow,
            Name = family.Name,
            Description = family.Description,
            Owner = currentUser,
        };

        initialVersion.Family = familyInfo;

        // now we need to create the child objects and link them to the version
        Dictionary<Guid, Species> speciesById = initialVersion.Species.ToDictionary(s => s.Id);
        Dictionary<Guid, Reaction> reactionsById = initialVersion.Reactions.ToDictionary(r => r.Id);

        initialVersion.Phases = family.Phases
            .Select(p =>
            {
                Phase phase = p.ToEntity();
                phase.PhaseSpecies = p.SpeciesIds
                    .Select(id => new PhaseSpecies
                    {
                        Species = speciesById[id],
                        DiffusionCoefficient = p.DiffusionCoefficientOf(id),
                    })
                    .ToList();
                return phase;
            })
            .ToList();
        
        Dictionary<Guid, Phase> phasesById = initialVersion.Phases.ToDictionary(p => p.Id);
        
        familyInfo.Mechanisms = family.Mechanisms
            .Select(m =>
            {
                Mechanism mechanism = m.ToEntity();
                mechanism.FamilyId = familyInfo.Id;
                mechanism.Family = familyInfo;
                mechanism.FamilyVersionId = initialVersion.Id;
                mechanism.FamilyVersion = initialVersion;
                mechanism.ValidationStatus = m.ValidationStatus;
                if (m.ValidationStatus == ValidationStatus.Validated)
                {
                    mechanism.ValidatedById = currentUser.Id;
                    mechanism.ValidatedBy = currentUser;
                }
                else
                {
                    mechanism.ValidatedById = null;
                    mechanism.ValidatedBy = null;
                }
                mechanism.Species = m.SpeciesIds.Select(id => speciesById[id]).ToList();
                mechanism.Reactions = m.ReactionIds.Select(id => reactionsById[id]).ToList();
                mechanism.Phases = m.PhaseIds.Select(id => phasesById[id]).ToList();
                return mechanism;
            })
            .ToList();

        context.Families.Add(familyInfo);
        context.FamilyVersions.Add(initialVersion);
        await context.SaveChangesAsync();

        familyInfo.CurrentVersion = initialVersion;
        familyInfo.CurrentVersionId = initialVersion.Id;
        await context.SaveChangesAsync();

        return (QueryResult.Success, context.Entry(familyInfo));
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
        if (!Guid.TryParse(nameIdentifier, out Guid userId))
        {
            return QueryResult.ParseError;
        }

        var existingFamily = await context.Families
            .AsSplitQuery()
            .Include(f => f.Owner)
            .Include(f => f.Versions)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Species)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Reactions).ThenInclude(r => r.Reactants)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Reactions).ThenInclude(r => r.Products)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Reactions).ThenInclude(r => r.Arrhenius)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Reactions).ThenInclude(r => r.Tunneling)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Reactions).ThenInclude(r => r.Troe)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Reactions).ThenInclude(r => r.TernaryChemicalActivation)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Reactions).ThenInclude(r => r.Branched)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Reactions).ThenInclude(r => r.TaylorSeries)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Reactions).ThenInclude(r => r.Surface)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Reactions).ThenInclude(r => r.Emission)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Reactions).ThenInclude(r => r.FirstOrderLoss)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Reactions).ThenInclude(r => r.Photolysis)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Reactions).ThenInclude(r => r.UserDefined)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Phases).ThenInclude(p => p.Species)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Phases).ThenInclude(p => p.PhaseSpecies)
            .Include(f => f.Mechanisms).ThenInclude(m => m.Species)
            .Include(f => f.Mechanisms).ThenInclude(m => m.Reactions)
            .Include(f => f.Mechanisms).ThenInclude(m => m.Phases)
            .Include(f => f.Mechanisms).ThenInclude(m => m.ValidatedBy)
            .SingleOrDefaultAsync(f => f.Id == id);

        if (existingFamily == null)
        {
            return QueryResult.NotFound;
        }

        var loggedInUser = await _userService.GetUserByIdAsync(userId);
        if (loggedInUser == null)
        {
            return QueryResult.NoAccess;
        }

        bool isOwner = existingFamily.Owner.Id == userId;
        bool isAdmin = loggedInUser.Role == Role.Admin;
        bool isVerifier = loggedInUser.Role == Role.Verifier;

        if (!isOwner && !isAdmin && !isVerifier)
        {
            return QueryResult.NoAccess;
        }

        // A Verifier who is neither owner nor admin is ONLY authorized to update mechanism validation status.
        if (!isOwner && !isAdmin && isVerifier)
        {
            if (existingFamily.Name != family.Name || existingFamily.Description != family.Description)
            {
                return QueryResult.NoAccess;
            }
            if (HasContentChanges(family, existingFamily))
            {
                return QueryResult.NoAccess;
            }
        }

        // Only Verifiers or Admins can mark a mechanism as Validated
        if (!isVerifier && !isAdmin)
        {
            foreach (var incMech in family.Mechanisms)
            {
                if (incMech.ValidationStatus == ValidationStatus.Validated)
                {
                    var existingMech = existingFamily.Mechanisms.FirstOrDefault(m => m.Id == incMech.Id);
                    if (existingMech == null || existingMech.ValidationStatus != ValidationStatus.Validated)
                    {
                        return QueryResult.NoAccess;
                    }
                }
            }
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
        var result = TrackChangesToFamily(family, existingFamily, loggedInUser);
        if (result != QueryResult.Success)
        {
            return result;
        }

        await context.SaveChangesAsync();
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
        Guid userId;
        bool validGuid = Guid.TryParse(nameIdentifier, out userId);
        if (!validGuid)
        {
            return QueryResult.ParseError;
        }

        var family = await context.Families
            .Include(f => f.Owner)
            .FirstOrDefaultAsync(f => f.Id == id);

        if (family == null)
        {
            return QueryResult.NotFound;
        }

        if (family.Owner.Id != userId)
        {
            var loggedInUser = await _userService.GetUserByIdAsync(userId);
            if (loggedInUser == null || loggedInUser.Role != Role.Admin)
            {
                return QueryResult.NoAccess;
            }
        }

        await context.ExecuteDeleteAsync(context.Families.Where(f => f.Id == id));

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
            // A diffusion coefficient may only be given for a member species.
            missing.AddRange(phase.DiffusionCoefficients.Keys.Where(id => !phase.SpeciesIds.Contains(id)));
        }

        // Mechanism memberships.
        foreach (MechanismDto mechanism in family.Mechanisms)
        {
            if (mechanism.IsReadOnly || mechanism.ValidationStatus != ValidationStatus.NoValidationRequested)
            {
                continue;
            }
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

    private static bool HasContentChanges(FamilyDto incoming, Family existing)
    {
        if (incoming.Species.Count != existing.Species.Count ||
            incoming.Reactions.Count != existing.Reactions.Count ||
            incoming.Phases.Count != existing.Phases.Count ||
            incoming.Mechanisms.Count != existing.Mechanisms.Count)
        {
            return true;
        }

        HashSet<Guid> existingSpeciesIds = existing.Species.Select(s => s.Id).ToHashSet();
        if (incoming.Species.Any(s => !existingSpeciesIds.Contains(s.Id))) return true;

        HashSet<Guid> existingReactionIds = existing.Reactions.Select(r => r.Id).ToHashSet();
        if (incoming.Reactions.Any(r => !existingReactionIds.Contains(r.Id))) return true;

        HashSet<Guid> existingPhaseIds = existing.Phases.Select(p => p.Id).ToHashSet();
        if (incoming.Phases.Any(p => !existingPhaseIds.Contains(p.Id))) return true;

        return false;
    }

    public static FamilyVersion BranchCurrentFamilyVersion(Family existing)
    {
        return BranchCurrentFamilyVersion(existing, out _, out _, out _);
    }

    public static FamilyVersion BranchCurrentFamilyVersion(
        Family existing,
        out Dictionary<Guid, Guid> speciesMap,
        out Dictionary<Guid, Guid> reactionMap,
        out Dictionary<Guid, Guid> phaseMap)
    {
        var current = existing.CurrentVersion;
        var newVersion = new FamilyVersion
        {
            Id = Guid.NewGuid(),
            FamilyId = existing.Id,
            Family = existing,
            CreatedDate = DateTime.UtcNow
        };

        // Deep-copy species
        var sMap = new Dictionary<Guid, Guid>();
        Dictionary<Guid, Species> newSpeciesEntities = new();
        foreach (var oldSpecies in current.Species)
        {
            var newSpecies = new Species
            {
                Id = Guid.NewGuid(),
                FamilyVersionId = newVersion.Id,
                FamilyVersion = newVersion,
                Name = oldSpecies.Name,
                Description = oldSpecies.Description,
                MolecularWeight = oldSpecies.MolecularWeight,
                IsThirdBody = oldSpecies.IsThirdBody,
                ConstantConcentration = oldSpecies.ConstantConcentration,
                ConstantMixingRatio = oldSpecies.ConstantMixingRatio,
                AbsoluteTolerance = oldSpecies.AbsoluteTolerance,
                OtherProperties = oldSpecies.OtherProperties != null
                    ? new Dictionary<string, System.Text.Json.JsonElement>(oldSpecies.OtherProperties)
                    : null
            };
            sMap[oldSpecies.Id] = newSpecies.Id;
            newSpeciesEntities[oldSpecies.Id] = newSpecies;
            newVersion.Species.Add(newSpecies);
        }

        // Deep-copy phases
        var pMap = new Dictionary<Guid, Guid>();
        Dictionary<Guid, Phase> newPhaseEntities = new();
        foreach (var oldPhase in current.Phases)
        {
            var newPhase = new Phase
            {
                Id = Guid.NewGuid(),
                FamilyVersionId = newVersion.Id,
                FamilyVersion = newVersion,
                Name = oldPhase.Name,
                Description = oldPhase.Description,
                Species = oldPhase.Species
                    .Where(s => newSpeciesEntities.ContainsKey(s.Id))
                    .Select(s => newSpeciesEntities[s.Id])
                    .ToList(),
                PhaseSpecies = oldPhase.PhaseSpecies
                    .Where(ps => newSpeciesEntities.ContainsKey(ps.SpeciesId))
                    .Select(ps => new PhaseSpecies
                    {
                        SpeciesId = newSpeciesEntities[ps.SpeciesId].Id,
                        Species = newSpeciesEntities[ps.SpeciesId],
                        DiffusionCoefficient = ps.DiffusionCoefficient
                    })
                    .ToList()
            };
            pMap[oldPhase.Id] = newPhase.Id;
            newPhaseEntities[oldPhase.Id] = newPhase;
            newVersion.Phases.Add(newPhase);
        }

        // Deep-copy reactions
        var rMap = new Dictionary<Guid, Guid>();
        Dictionary<Guid, Reaction> newReactionEntities = new();
        foreach (var oldReaction in current.Reactions)
        {
            var dto = ReactionMapper.ToDto(oldReaction);
            var newReaction = ReactionMapper.ToEntity(dto);
            newReaction.Id = Guid.NewGuid();
            newReaction.FamilyVersionId = newVersion.Id;
            newReaction.FamilyVersion = newVersion;

            newReaction.Reactants = dto.Reactants
                .Where(r => newSpeciesEntities.ContainsKey(r.SpeciesId))
                .Select(r => new Reactant
                {
                    ReactionId = newReaction.Id,
                    SpeciesId = newSpeciesEntities[r.SpeciesId].Id,
                    Species = newSpeciesEntities[r.SpeciesId],
                    Coefficient = r.Coefficient
                }).ToList();

            newReaction.Products = dto.Products
                .Where(p => newSpeciesEntities.ContainsKey(p.SpeciesId))
                .Select(p => new Product
                {
                    ReactionId = newReaction.Id,
                    SpeciesId = newSpeciesEntities[p.SpeciesId].Id,
                    Species = newSpeciesEntities[p.SpeciesId],
                    Coefficient = p.Coefficient,
                    Branch = p.Branch
                }).ToList();

            newReaction.GasPhaseId = dto.GasPhaseId.HasValue && newPhaseEntities.TryGetValue(dto.GasPhaseId.Value, out var gp) ? gp.Id : null;
            newReaction.AerosolPhaseId = dto.AerosolPhaseId.HasValue && newPhaseEntities.TryGetValue(dto.AerosolPhaseId.Value, out var ap) ? ap.Id : null;
            newReaction.GasPhaseSpeciesId = dto.GasPhaseSpeciesId.HasValue && newSpeciesEntities.TryGetValue(dto.GasPhaseSpeciesId.Value, out var gps) ? gps.Id : null;
            newReaction.AerosolPhaseSpeciesId = dto.AerosolPhaseSpeciesId.HasValue && newSpeciesEntities.TryGetValue(dto.AerosolPhaseSpeciesId.Value, out var aps) ? aps.Id : null;
            newReaction.AerosolPhaseWaterId = dto.AerosolPhaseWaterId.HasValue && newSpeciesEntities.TryGetValue(dto.AerosolPhaseWaterId.Value, out var apw) ? apw.Id : null;

            rMap[oldReaction.Id] = newReaction.Id;
            newReactionEntities[oldReaction.Id] = newReaction;
            newVersion.Reactions.Add(newReaction);
        }

        // Remap non-read-only mechanisms to point to newVersion and new entities
        foreach (var mech in existing.Mechanisms.Where(m => m.ValidationStatus == ValidationStatus.NoValidationRequested))
        {
            mech.FamilyVersionId = newVersion.Id;
            mech.Species = mech.Species
                .Where(s => newSpeciesEntities.ContainsKey(s.Id))
                .Select(s => newSpeciesEntities[s.Id])
                .ToList();
            mech.Phases = mech.Phases
                .Where(p => newPhaseEntities.ContainsKey(p.Id))
                .Select(p => newPhaseEntities[p.Id])
                .ToList();
            mech.Reactions = mech.Reactions
                .Where(r => newReactionEntities.ContainsKey(r.Id))
                .Select(r => newReactionEntities[r.Id])
                .ToList();
        }

        speciesMap = sMap;
        reactionMap = rMap;
        phaseMap = pMap;

        existing.Versions.Add(newVersion);
        existing.CurrentVersion = newVersion;
        existing.CurrentVersionId = newVersion.Id;
        return newVersion;
    }

    /// <summary>
    /// Find the difference between the incoming and existing family graphs
    /// Do this for each child object and make any deletions, additions, or updates to the existing family graph
    /// </summary>
    private QueryResult TrackChangesToFamily(FamilyDto incoming, Family existing, User? loggedInUser = null)
    {
        FamilyVersion version = existing.CurrentVersion;

        HashSet<Guid> incomingSpeciesIds = incoming.Species.Select(s => s.Id).ToHashSet();
        HashSet<Guid> incomingReactionIds = incoming.Reactions.Select(r => r.Id).ToHashSet();
        HashSet<Guid> incomingPhaseIds = incoming.Phases.Select(p => p.Id).ToHashSet();
        HashSet<Guid> incomingMechanismIds = incoming.Mechanisms.Select(m => m.Id).ToHashSet();

        HashSet<Guid> existingSpeciesIds = existing.Species.Select(s => s.Id).ToHashSet();
        HashSet<Guid> existingReactionIds = existing.Reactions.Select(r => r.Id).ToHashSet();
        HashSet<Guid> existingPhaseIds = existing.Phases.Select(p => p.Id).ToHashSet();
        HashSet<Guid> existingMechanismIds = existing.Mechanisms.Select(m => m.Id).ToHashSet();

        HashSet<Guid> deletedMechanismIds = existingMechanismIds.Except(incomingMechanismIds).ToHashSet();
        HashSet<Guid> newMechanismIds = incomingMechanismIds.Except(existingMechanismIds).ToHashSet();
        HashSet<Guid> maybeUpdatedMechanismIds = existingMechanismIds.Intersect(incomingMechanismIds).ToHashSet();

        // Cannot delete read-only or pending/validated mechanisms
        foreach (Guid id in deletedMechanismIds)
        {
            Mechanism existingMech = existing.Mechanisms.Single(m => m.Id == id);
            if (existingMech.ValidationStatus != ValidationStatus.NoValidationRequested || existingMech.IsReadOnly)
            {
                return QueryResult.ValidationError;
            }
        }

        // Validate updates on existing mechanisms & check for version branching
        bool shouldBranch = false;
        foreach (Guid id in maybeUpdatedMechanismIds)
        {
            MechanismDto incomingMech = incoming.Mechanisms.Single(m => m.Id == id);
            Mechanism existingMech = existing.Mechanisms.Single(m => m.Id == id);

            if (existingMech.ValidationStatus != ValidationStatus.NoValidationRequested)
            {
                // Cannot revert to NoValidationRequested
                if (incomingMech.ValidationStatus == ValidationStatus.NoValidationRequested)
                {
                    return QueryResult.ValidationError;
                }

                // If already Validated, cannot change status back to PendingValidation
                if (existingMech.ValidationStatus == ValidationStatus.Validated &&
                    incomingMech.ValidationStatus == ValidationStatus.PendingValidation)
                {
                    return QueryResult.ValidationError;
                }

                // Content cannot be modified on a read-only / validated mechanism
                bool contentChanged = existingMech.Name != incomingMech.Name ||
                    existingMech.Description != incomingMech.Description ||
                    !existingMech.Species.Select(s => s.Id).Order().SequenceEqual(incomingMech.SpeciesIds.Order()) ||
                    !existingMech.Reactions.Select(r => r.Id).Order().SequenceEqual(incomingMech.ReactionIds.Order()) ||
                    !existingMech.Phases.Select(p => p.Id).Order().SequenceEqual(incomingMech.PhaseIds.Order());

                if (contentChanged)
                {
                    return QueryResult.ValidationError;
                }
            }
            else
            {
                if (incomingMech.ValidationStatus != ValidationStatus.NoValidationRequested)
                {
                    shouldBranch = true;
                }
            }
        }

        foreach (Guid id in newMechanismIds)
        {
            MechanismDto incomingMech = incoming.Mechanisms.Single(m => m.Id == id);
            if (incomingMech.ValidationStatus != ValidationStatus.NoValidationRequested)
            {
                shouldBranch = true;
            }
        }

        // Species changes
        HashSet<Guid> deletedSpeciesIds = existingSpeciesIds.Except(incomingSpeciesIds).ToHashSet();
        HashSet<Guid> newSpeciesIds = incomingSpeciesIds.Except(existingSpeciesIds).ToHashSet();
        HashSet<Guid> maybeUpdatedSpeciesIds = existingSpeciesIds.Intersect(incomingSpeciesIds).ToHashSet();

        deletedSpeciesIds.ToList().ForEach(id => {
            Species s = existing.Species.Single(s => s.Id == id);
            context.Species.Remove(s);
            existing.Species.Remove(s);
        });
        newSpeciesIds.ToList().ForEach(id => {
            Species added = incoming.Species.Single(s => s.Id == id).ToEntity();
            added.FamilyVersionId = version.Id;
            context.Species.Add(added);
            if (!existing.Species.Any(s => s.Id == added.Id)) existing.Species.Add(added);
        });
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

        deletedReactionIds.ToList().ForEach(id => {
            Reaction r = existing.Reactions.Single(r => r.Id == id);
            context.Reactions.Remove(r);
            existing.Reactions.Remove(r);
        });
        newReactionIds.ToList().ForEach(id => {
            Reaction added = incoming.Reactions.Single(r => r.Id == id).ToEntity();
            added.FamilyVersionId = version.Id;
            context.Reactions.Add(added);
            if (!existing.Reactions.Any(r => r.Id == added.Id)) existing.Reactions.Add(added);
        });
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

            // Arrhenius parameters are a one-to-one row. Update in place when both
            // sides have it, add it when new, and drop it when the incoming
            // reaction no longer carries it (EF cascade deletes the orphan).
            if (incomingReaction.Arrhenius == null)
            {
                existingReaction.Arrhenius = null;
            }
            else if (existingReaction.Arrhenius == null)
            {
                existingReaction.Arrhenius = incomingReaction.Arrhenius.ToEntity();
            }
            else
            {
                ArrheniusParameters existingArrhenius = existingReaction.Arrhenius;
                ArrheniusParametersDto incomingArrhenius = incomingReaction.Arrhenius;
                existingArrhenius.A = incomingArrhenius.A;
                existingArrhenius.B = incomingArrhenius.B;
                existingArrhenius.C = incomingArrhenius.C;
                existingArrhenius.Ea = incomingArrhenius.Ea;
                existingArrhenius.D = incomingArrhenius.D;
                existingArrhenius.E = incomingArrhenius.E;
            }

            // Tunneling parameters are a one-to-one row. Update in place when both
            // sides have it, add it when new, and drop it when the incoming
            // reaction no longer carries it (EF cascade deletes the orphan).
            if (incomingReaction.Tunneling == null)
            {
                existingReaction.Tunneling = null;
            }
            else if (existingReaction.Tunneling == null)
            {
                existingReaction.Tunneling = incomingReaction.Tunneling.ToEntity();
            }
            else
            {
                TunnelingParameters existingTunneling = existingReaction.Tunneling;
                TunnelingParametersDto incomingTunneling = incomingReaction.Tunneling;
                existingTunneling.A = incomingTunneling.A;
                existingTunneling.B = incomingTunneling.B;
                existingTunneling.C = incomingTunneling.C;
            }

            // Troe parameters are a one-to-one row. Update in place when both
            // sides have it, add it when new, and drop it when the incoming
            // reaction no longer carries it (EF cascade deletes the orphan).
            if (incomingReaction.Troe == null)
            {
                existingReaction.Troe = null;
            }
            else if (existingReaction.Troe == null)
            {
                existingReaction.Troe = incomingReaction.Troe.ToEntity();
            }
            else
            {
                TroeParameters existingTroe = existingReaction.Troe;
                TroeParametersDto incomingTroe = incomingReaction.Troe;
                existingTroe.K0A = incomingTroe.K0A;
                existingTroe.K0B = incomingTroe.K0B;
                existingTroe.K0C = incomingTroe.K0C;
                existingTroe.KinfA = incomingTroe.KinfA;
                existingTroe.KinfB = incomingTroe.KinfB;
                existingTroe.KinfC = incomingTroe.KinfC;
                existingTroe.Fc = incomingTroe.Fc;
                existingTroe.N = incomingTroe.N;
            }

            // Ternary Chemical Activation parameters are a one-to-one row.
            // Update in place when both sides have it, add it when new, and
            // drop it when the incoming reaction no longer carries it (EF
            // cascade deletes the orphan).
            if (incomingReaction.TernaryChemicalActivation == null)
            {
                existingReaction.TernaryChemicalActivation = null;
            }
            else if (existingReaction.TernaryChemicalActivation == null)
            {
                existingReaction.TernaryChemicalActivation = incomingReaction.TernaryChemicalActivation.ToEntity();
            }
            else
            {
                TernaryChemicalActivationParameters existingTca = existingReaction.TernaryChemicalActivation;
                TernaryChemicalActivationParametersDto incomingTca = incomingReaction.TernaryChemicalActivation;
                existingTca.K0A = incomingTca.K0A;
                existingTca.K0B = incomingTca.K0B;
                existingTca.K0C = incomingTca.K0C;
                existingTca.KinfA = incomingTca.KinfA;
                existingTca.KinfB = incomingTca.KinfB;
                existingTca.KinfC = incomingTca.KinfC;
                existingTca.Fc = incomingTca.Fc;
                existingTca.N = incomingTca.N;
            }

            // Branched (no RO2) parameters are a one-to-one row. Update in
            // place when both sides have it, add it when new, and drop it
            // when the incoming reaction no longer carries it (EF cascade
            // deletes the orphan).
            if (incomingReaction.Branched == null)
            {
                existingReaction.Branched = null;
            }
            else if (existingReaction.Branched == null)
            {
                existingReaction.Branched = incomingReaction.Branched.ToEntity();
            }
            else
            {
                BranchedParameters existingBranched = existingReaction.Branched;
                BranchedParametersDto incomingBranched = incomingReaction.Branched;
                existingBranched.X = incomingBranched.X;
                existingBranched.Y = incomingBranched.Y;
                existingBranched.A0 = incomingBranched.A0;
                existingBranched.N = incomingBranched.N;
            }

            // Taylor Series parameters are a one-to-one row. Update in place
            // when both sides have it, add it when new, and drop it when the
            // incoming reaction no longer carries it (EF cascade deletes the
            // orphan).
            if (incomingReaction.TaylorSeries == null)
            {
                existingReaction.TaylorSeries = null;
            }
            else if (existingReaction.TaylorSeries == null)
            {
                existingReaction.TaylorSeries = incomingReaction.TaylorSeries.ToEntity();
            }
            else
            {
                TaylorSeriesParameters existingTaylorSeries = existingReaction.TaylorSeries;
                TaylorSeriesParametersDto incomingTaylorSeries = incomingReaction.TaylorSeries;
                existingTaylorSeries.A = incomingTaylorSeries.A;
                existingTaylorSeries.B = incomingTaylorSeries.B;
                existingTaylorSeries.C = incomingTaylorSeries.C;
                existingTaylorSeries.Ea = incomingTaylorSeries.Ea;
                existingTaylorSeries.D = incomingTaylorSeries.D;
                existingTaylorSeries.E = incomingTaylorSeries.E;
                existingTaylorSeries.TaylorCoefficients = incomingTaylorSeries.TaylorCoefficients;
            }

            // Surface parameters are a one-to-one row. Update in place when
            // both sides have it, add it when new, and drop it when the
            // incoming reaction no longer carries it (EF cascade deletes the
            // orphan).
            if (incomingReaction.Surface == null)
            {
                existingReaction.Surface = null;
            }
            else if (existingReaction.Surface == null)
            {
                existingReaction.Surface = incomingReaction.Surface.ToEntity();
            }
            else
            {
                SurfaceParameters existingSurface = existingReaction.Surface;
                SurfaceParametersDto incomingSurface = incomingReaction.Surface;
                existingSurface.ReactionProbability = incomingSurface.ReactionProbability;
            }

            // Emission parameters are a one-to-one row. Update in place when
            // both sides have it, add it when new, and drop it when the
            // incoming reaction no longer carries it (EF cascade deletes the
            // orphan).
            if (incomingReaction.Emission == null)
            {
                existingReaction.Emission = null;
            }
            else if (existingReaction.Emission == null)
            {
                existingReaction.Emission = incomingReaction.Emission.ToEntity();
            }
            else
            {
                EmissionParameters existingEmission = existingReaction.Emission;
                EmissionParametersDto incomingEmission = incomingReaction.Emission;
                existingEmission.ScalingFactor = incomingEmission.ScalingFactor;
            }

            // First Order Loss parameters are a one-to-one row. Update in
            // place when both sides have it, add it when new, and drop it
            // when the incoming reaction no longer carries it (EF cascade
            // deletes the orphan).
            if (incomingReaction.FirstOrderLoss == null)
            {
                existingReaction.FirstOrderLoss = null;
            }
            else if (existingReaction.FirstOrderLoss == null)
            {
                existingReaction.FirstOrderLoss = incomingReaction.FirstOrderLoss.ToEntity();
            }
            else
            {
                FirstOrderLossParameters existingFirstOrderLoss = existingReaction.FirstOrderLoss;
                FirstOrderLossParametersDto incomingFirstOrderLoss = incomingReaction.FirstOrderLoss;
                existingFirstOrderLoss.ScalingFactor = incomingFirstOrderLoss.ScalingFactor;
            }

            // Photolysis parameters are a one-to-one row. Update in place
            // when both sides have it, add it when new, and drop it when
            // the incoming reaction no longer carries it (EF cascade
            // deletes the orphan).
            if (incomingReaction.Photolysis == null)
            {
                existingReaction.Photolysis = null;
            }
            else if (existingReaction.Photolysis == null)
            {
                existingReaction.Photolysis = incomingReaction.Photolysis.ToEntity();
            }
            else
            {
                PhotolysisParameters existingPhotolysis = existingReaction.Photolysis;
                PhotolysisParametersDto incomingPhotolysis = incomingReaction.Photolysis;
                existingPhotolysis.ScalingFactor = incomingPhotolysis.ScalingFactor;
            }

            // User Defined parameters are a one-to-one row. Update in place
            // when both sides have it, add it when new, and drop it when
            // the incoming reaction no longer carries it (EF cascade
            // deletes the orphan).
            if (incomingReaction.UserDefined == null)
            {
                existingReaction.UserDefined = null;
            }
            else if (existingReaction.UserDefined == null)
            {
                existingReaction.UserDefined = incomingReaction.UserDefined.ToEntity();
            }
            else
            {
                UserDefinedParameters existingUserDefined = existingReaction.UserDefined;
                UserDefinedParametersDto incomingUserDefined = incomingReaction.UserDefined;
                existingUserDefined.ScalingFactor = incomingUserDefined.ScalingFactor;
            }
        });

        // Phase changes
        HashSet<Guid> deletedPhaseIds = existingPhaseIds.Except(incomingPhaseIds).ToHashSet();
        HashSet<Guid> newPhaseIds = incomingPhaseIds.Except(existingPhaseIds).ToHashSet();
        HashSet<Guid> maybeUpdatedPhaseIds = existingPhaseIds.Intersect(incomingPhaseIds).ToHashSet();

        deletedPhaseIds.ToList().ForEach(id => {
            Phase p = existing.Phases.Single(p => p.Id == id);
            context.Phases.Remove(p);
            existing.Phases.Remove(p);
        });
        newPhaseIds.ToList().ForEach(id => {
            PhaseDto incomingPhase = incoming.Phases.Single(p => p.Id == id);
            Phase added = incomingPhase.ToEntity();
            added.FamilyVersionId = version.Id;
            added.PhaseSpecies = incomingPhase.SpeciesIds
                .Select(sid => new PhaseSpecies
                {
                    Species = existing.Species.First(s => s.Id == sid),
                    DiffusionCoefficient = incomingPhase.DiffusionCoefficientOf(sid),
                })
                .ToList();
            context.Phases.Add(added);
            if (!existing.Phases.Any(p => p.Id == added.Id)) existing.Phases.Add(added);
        });
        maybeUpdatedPhaseIds.ToList().ForEach(id =>
        {
            PhaseDto incomingPhase = incoming.Phases.Single(p => p.Id == id);
            Phase existingPhase = existing.Phases.Single(p => p.Id == id);
            existingPhase.Name = incomingPhase.Name;
            existingPhase.Description = incomingPhase.Description;
            // Update the join rows in place. A new join row with the same key as
            // a tracked row makes EF throw.
            existingPhase.PhaseSpecies
                .Where(ps => !incomingPhase.SpeciesIds.Contains(ps.SpeciesId))
                .ToList()
                .ForEach(ps => context.Remove(ps));
            foreach (Guid sid in incomingPhase.SpeciesIds)
            {
                PhaseSpecies? member = existingPhase.PhaseSpecies.SingleOrDefault(ps => ps.SpeciesId == sid);
                if (member == null)
                {
                    member = new PhaseSpecies { Species = existing.Species.First(s => s.Id == sid) };
                    existingPhase.PhaseSpecies.Add(member);
                }
                member.DiffusionCoefficient = incomingPhase.DiffusionCoefficientOf(sid);
            }
        });

        // Mechanism changes
        deletedMechanismIds.ToList().ForEach(id => {
            Mechanism m = existing.Mechanisms.Single(m => m.Id == id);
            context.Mechanisms.Remove(m);
            existing.Mechanisms.Remove(m);
        });
        newMechanismIds.ToList().ForEach(id => {
            MechanismDto incomingMechanism = incoming.Mechanisms.Single(m => m.Id == id);
            Mechanism added = incomingMechanism.ToEntity();
            added.FamilyId = existing.Id;
            added.Family = existing;
            added.FamilyVersionId = version.Id;
            added.ValidationStatus = incomingMechanism.ValidationStatus;
            if (incomingMechanism.ValidationStatus == ValidationStatus.Validated)
            {
                added.ValidatedById = loggedInUser?.Id;
                added.ValidatedBy = loggedInUser;
            }
            added.Species = incomingMechanism.SpeciesIds.Select(sid => existing.Species.First(s => s.Id == sid)).ToList();
            added.Reactions = incomingMechanism.ReactionIds.Select(rid => existing.Reactions.First(r => r.Id == rid)).ToList();
            added.Phases = incomingMechanism.PhaseIds.Select(pid => existing.Phases.First(p => p.Id == pid)).ToList();
            context.Mechanisms.Add(added);
            if (!existing.Mechanisms.Any(m => m.Id == added.Id)) existing.Mechanisms.Add(added);
        });
        maybeUpdatedMechanismIds.ToList().ForEach(id =>
        {
            MechanismDto incomingMechanism = incoming.Mechanisms.Single(m => m.Id == id);
            Mechanism existingMechanism = existing.Mechanisms.Single(m => m.Id == id);

            if (existingMechanism.ValidationStatus == ValidationStatus.NoValidationRequested)
            {
                existingMechanism.Name = incomingMechanism.Name;
                existingMechanism.Description = incomingMechanism.Description;
                existingMechanism.Species = incomingMechanism.SpeciesIds.Select(sid => existing.Species.First(s => s.Id == sid)).ToList();
                existingMechanism.Reactions = incomingMechanism.ReactionIds.Select(rid => existing.Reactions.First(r => r.Id == rid)).ToList();
                existingMechanism.Phases = incomingMechanism.PhaseIds.Select(pid => existing.Phases.First(p => p.Id == pid)).ToList();
            }

            if (incomingMechanism.ValidationStatus != existingMechanism.ValidationStatus)
            {
                existingMechanism.ValidationStatus = incomingMechanism.ValidationStatus;
                if (incomingMechanism.ValidationStatus == ValidationStatus.Validated)
                {
                    existingMechanism.ValidatedById = loggedInUser?.Id;
                    existingMechanism.ValidatedBy = loggedInUser;
                }
                else
                {
                    existingMechanism.ValidatedById = null;
                    existingMechanism.ValidatedBy = null;
                }
            }
        });

        if (shouldBranch)
        {
            var newVersion = BranchCurrentFamilyVersion(existing, out var speciesMap, out var reactionMap, out var phaseMap);
            context.FamilyVersions.Add(newVersion);

            foreach (var s in incoming.Species)
            {
                if (speciesMap.TryGetValue(s.Id, out var newId)) s.Id = newId;
            }
            foreach (var r in incoming.Reactions)
            {
                if (reactionMap.TryGetValue(r.Id, out var newId)) r.Id = newId;
                foreach (var reactant in r.Reactants)
                    if (speciesMap.TryGetValue(reactant.SpeciesId, out var newSpecId)) reactant.SpeciesId = newSpecId;
                foreach (var product in r.Products)
                    if (speciesMap.TryGetValue(product.SpeciesId, out var newSpecId)) product.SpeciesId = newSpecId;
                if (r.GasPhaseId.HasValue && phaseMap.TryGetValue(r.GasPhaseId.Value, out var newGpId)) r.GasPhaseId = newGpId;
                if (r.AerosolPhaseId.HasValue && phaseMap.TryGetValue(r.AerosolPhaseId.Value, out var newApId)) r.AerosolPhaseId = newApId;
                if (r.GasPhaseSpeciesId.HasValue && speciesMap.TryGetValue(r.GasPhaseSpeciesId.Value, out var newGpsId)) r.GasPhaseSpeciesId = newGpsId;
                if (r.AerosolPhaseSpeciesId.HasValue && speciesMap.TryGetValue(r.AerosolPhaseSpeciesId.Value, out var newApsId)) r.AerosolPhaseSpeciesId = newApsId;
                if (r.AerosolPhaseWaterId.HasValue && speciesMap.TryGetValue(r.AerosolPhaseWaterId.Value, out var newApwId)) r.AerosolPhaseWaterId = newApwId;
            }
            foreach (var p in incoming.Phases)
            {
                if (phaseMap.TryGetValue(p.Id, out var newId)) p.Id = newId;
                p.SpeciesIds = p.SpeciesIds.Select(sid => speciesMap.TryGetValue(sid, out var newSid) ? newSid : sid).ToList();
            }
            foreach (var m in incoming.Mechanisms)
            {
                if (m.ValidationStatus == ValidationStatus.NoValidationRequested)
                {
                    m.SpeciesIds = m.SpeciesIds.Select(sid => speciesMap.TryGetValue(sid, out var newSid) ? newSid : sid).ToList();
                    m.ReactionIds = m.ReactionIds.Select(rid => reactionMap.TryGetValue(rid, out var newRid) ? newRid : rid).ToList();
                    m.PhaseIds = m.PhaseIds.Select(pid => phaseMap.TryGetValue(pid, out var newPid) ? newPid : pid).ToList();
                }
            }
        }

        return QueryResult.Success;
    }
}

