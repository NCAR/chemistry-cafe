using System.Text.Json;
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
    /// <param name="viewer">The user who is viewing the families. If null, only public families are returned.</param>
    /// <returns>List of families</returns>
    public async Task<IEnumerable<Family>> GetFamiliesAsync(bool expand, User? viewer = null)
    {
        IQueryable<Family> query = VisibleTo(context.Families, viewer)
            .IncludeMetadataAndVerifiedVersions();

        if (expand)
        {
            query = query.IncludeFullCurrentVersion();
        }

        var families = await query.ToListAsync();

        bool isVerifierOrAdmin = viewer?.Role == Role.Verifier || viewer?.Role == Role.Admin;
        if (!isVerifierOrAdmin)
        {
            foreach (var fam in families)
            {
                fam.VerifiedVersions = fam.VerifiedVersions.Where(v => !v.IsArchived).ToList();
                fam.Mechanisms = fam.Mechanisms.Where(m => !m.IsArchived).ToList();
            }
        }

        return families;
    }

    /// <summary>
    /// Gets a specific family from the database
    /// </summary>
    /// <param name="id">The id of the family</param>
    /// <returns>Family or null if not found</returns>
    public async Task<Family?> GetFamilyAsync(Guid id, User? viewer = null)
    {
        var family = await VisibleTo(context.Families, viewer)
            .IncludeMetadataAndVerifiedVersions()
            .IncludeFullCurrentVersion()
            .SingleOrDefaultAsync(f => f.Id == id);

        if (family != null)
        {
            bool isVerifierOrAdmin = viewer?.Role == Role.Verifier || viewer?.Role == Role.Admin;
            if (!isVerifierOrAdmin)
            {
                family.VerifiedVersions = family.VerifiedVersions.Where(v => !v.IsArchived).ToList();
                family.Mechanisms = family.Mechanisms.Where(m => !m.IsArchived).ToList();
            }
        }

        return family;
    }

    /// <summary>
    /// Gets a specific family version snapshot from the database with its species, reactions, phases, and mechanisms.
    /// </summary>
    public async Task<FamilyDto?> GetFamilyVersionAsync(Guid familyId, Guid versionId, User? viewer = null)
    {
        IQueryable<Family> query = VisibleTo(context.Families, viewer);
        var family = await query
            .AsSplitQuery()
            .Include(f => f.Owner)
            .Include(f => f.Contributors)
            .FirstOrDefaultAsync(f => f.Id == familyId);

        if (family == null)
        {
            return null;
        }

        var version = await context.FamilyVersions
            .IncludeFullVersionGraph()
            .FirstOrDefaultAsync(v => v.Id == versionId && v.FamilyId == familyId);

        if (version == null)
        {
            return null;
        }

        var mechanisms = await context.Mechanisms
            .AsSplitQuery()
            .Include(m => m.Species)
            .Include(m => m.Reactions)
            .Include(m => m.Phases)
            .Where(m => m.FamilyId == familyId && m.FamilyVersionId == versionId)
            .ToListAsync();

        bool isVerifierOrAdmin = viewer?.Role == Role.Verifier || viewer?.Role == Role.Admin;
        if (!isVerifierOrAdmin)
        {
            mechanisms = mechanisms.Where(m => !m.IsArchived).ToList();
        }

        var verifiedVersions = await context.VerifiedMechanismVersions
            .Include(v => v.Verifier)
            .Include(v => v.DeprecatedBy)
            .Include(v => v.ArchivedBy)
            .Where(v => v.FamilyId == familyId && (isVerifierOrAdmin || !v.IsArchived))
            .ToListAsync();

        return new FamilyDto
        {
            Id = family.Id,
            OwnerId = family.Owner?.Id ?? Guid.Empty,
            Owner = family.Owner == null ? null : new OwnerDto
            {
                Id = family.Owner.Id,
                Username = family.Owner.Username,
                Role = family.Owner.Role,
            },
            ContributorIds = family.Contributors?.Select(c => c.UserId).ToList() ?? new(),
            Name = family.Name,
            Description = family.Description,
            IsPublic = family.IsPublic,
            CurrentVersionId = version.Id,
            Species = version.Species.Select(s => s.ToDto()).ToList(),
            Reactions = version.Reactions.Select(r => r.ToDto()).ToList(),
            Phases = version.Phases.Select(p => p.ToDto()).ToList(),
            Mechanisms = mechanisms.Select(m => m.ToDto()).ToList(),
            VerifiedVersions = verifiedVersions.Select(v => v.ToDto()).ToList(),
        };
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
            IsPublic = family.IsPublic,
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
            .Include(f => f.Owner)
            .Include(f => f.Contributors)
            .IncludeFullCurrentVersion()
            .SingleOrDefaultAsync(f => f.Id == id);

        if (existingFamily == null)
        {
            return QueryResult.NotFound;
        }

        bool isOwner = existingFamily.OwnerId == userId;
        bool isEditor = existingFamily.Contributors.Any(c => c.UserId == userId && c.Role == ContributorRole.Editor);
        bool isAdmin = false;
        if (!isOwner && !isEditor)
        {
            var loggedInUser = await _userService.GetUserByIdAsync(userId);
            if (loggedInUser == null || loggedInUser.Role != Role.Admin)
            {
                return QueryResult.NoAccess;
            }
            isAdmin = true;
        }
        else if (!isOwner)
        {
            var loggedInUser = await _userService.GetUserByIdAsync(userId);
            isAdmin = loggedInUser?.Role == Role.Admin;
        }

        if (HasDuplicateChildIds(family))
        {
            return QueryResult.ValidationError;
        }

        if (FindUnresolvedReferences(family).Count > 0)
        {
            return QueryResult.ValidationError;
        }

        // Nobody can edit frozen data, and editable mechanisms cannot use it.
        var frozenFamilyVersionIds = await context.FamilyVersions
            .Where(v => v.FamilyId == existingFamily.Id && v.Id != existingFamily.CurrentVersionId)
            .Select(v => v.Id)
            .ToListAsync();

        if (frozenFamilyVersionIds.Count > 0)
        {
            var frozenSpeciesIds = (await context.Species
                .Where(s => frozenFamilyVersionIds.Contains(s.FamilyVersionId))
                .Select(s => s.Id)
                .ToListAsync()).ToHashSet();
            var frozenReactionIds = (await context.Reactions
                .Where(r => frozenFamilyVersionIds.Contains(r.FamilyVersionId))
                .Select(r => r.Id)
                .ToListAsync()).ToHashSet();
            var frozenPhaseIds = (await context.Phases
                .Where(p => frozenFamilyVersionIds.Contains(p.FamilyVersionId))
                .Select(p => p.Id)
                .ToListAsync()).ToHashSet();

            foreach (var mech in family.Mechanisms)
            {
                if (mech.SpeciesIds.Any(id => frozenSpeciesIds.Contains(id)) ||
                    mech.ReactionIds.Any(id => frozenReactionIds.Contains(id)) ||
                    mech.PhaseIds.Any(id => frozenPhaseIds.Contains(id)))
                {
                    return QueryResult.ValidationError;
                }
            }
        }

        // Only the owner or an admin can change family visibility (IsPublic)
        if (existingFamily.IsPublic != family.IsPublic && !isOwner && !isAdmin)
        {
            return QueryResult.NoAccess;
        }

        bool familyPropsChanged = existingFamily.Name != family.Name
            || existingFamily.Description != family.Description
            || ((isOwner || isAdmin) && existingFamily.IsPublic != family.IsPublic);

        var changeEntries = new List<ChangeEntry>();

        if (familyPropsChanged)
        {
            changeEntries.Add(new ChangeEntry
            {
                Id = Guid.NewGuid(),
                TargetType = ChangeTargetType.Family,
                TargetId = existingFamily.Id,
                TargetName = existingFamily.Name,
                Action = ChangeAction.Updated,
                Before = JsonSerializer.Serialize(new
                {
                    name = existingFamily.Name,
                    description = existingFamily.Description,
                    isPublic = existingFamily.IsPublic
                }),
                After = JsonSerializer.Serialize(new
                {
                    name = family.Name,
                    description = family.Description,
                    isPublic = (isOwner || isAdmin) ? family.IsPublic : existingFamily.IsPublic
                })
            });
        }

        // Update the easy fields
        existingFamily.Name = family.Name;
        existingFamily.Description = family.Description;
        if (isOwner || isAdmin)
        {
            existingFamily.IsPublic = family.IsPublic;
        }

        // reconcile all of the changes in all child objects
        changeEntries.AddRange(TrackChangesToFamily(family, existingFamily));

        if (changeEntries.Count > 0)
        {
            var changeSet = new ChangeSet
            {
                Id = Guid.NewGuid(),
                FamilyId = existingFamily.Id,
                UserId = userId,
                Timestamp = DateTime.UtcNow,
                Note = string.IsNullOrWhiteSpace(family.SaveNote) ? null : family.SaveNote.Trim(),
                Entries = changeEntries
            };
            context.ChangeSets.Add(changeSet);
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
            .Include(f => f.Mechanisms)
            .Include(f => f.Versions)
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

        var verifiedVersions = await context.VerifiedMechanismVersions
            .Include(v => v.Family)
                .ThenInclude(f => f.Owner)
            .Include(v => v.Mechanism)
            .Include(v => v.FamilyVersion)
            .Where(v => v.FamilyId == id)
            .ToListAsync();

        if (verifiedVersions.Count > 0)
        {
            var ncarUser = await context.Users.FirstOrDefaultAsync(u => u.Username == "NCAR")
                ?? await context.Users.FirstOrDefaultAsync(u => u.Role == Role.Admin)
                ?? family.Owner;

            var archivedFamily = new Family
            {
                Id = Guid.NewGuid(),
                Name = $"[Archived] {family.Name}",
                Description = $"Archived verified versions from deleted family '{family.Name}', originally owned by {family.Owner.Username}.\n{family.Description}",
                OwnerId = ncarUser.Id,
                Owner = ncarUser,
                IsPublic = true,
                CreatedDate = DateTime.UtcNow,
            };
            context.Families.Add(archivedFamily);

            foreach (var ver in verifiedVersions)
            {
                ver.OriginalFamilyId = family.Id;
                ver.OriginalFamilyName = family.Name;
                ver.OriginalOwnerId = family.Owner.Id;
                ver.OriginalOwnerUsername = family.Owner.Username;
                ver.IsArchived = true;
                ver.FamilyId = archivedFamily.Id;
                ver.Family = archivedFamily;

                if (ver.Mechanism != null)
                {
                    ver.Mechanism.FamilyId = archivedFamily.Id;
                    ver.Mechanism.Family = archivedFamily;
                }

                if (ver.FamilyVersion != null)
                {
                    ver.FamilyVersion.FamilyId = archivedFamily.Id;
                    ver.FamilyVersion.Family = archivedFamily;
                    archivedFamily.Versions.Add(ver.FamilyVersion);
                }
            }

            archivedFamily.CurrentVersion = archivedFamily.Versions.FirstOrDefault();
            archivedFamily.CurrentVersionId = archivedFamily.CurrentVersion?.Id;
            await context.SaveChangesAsync();
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
        Dictionary<Guid, HashSet<Guid>> speciesByPhase = family.Phases
            .ToDictionary(p => p.Id, p => p.SpeciesIds.ToHashSet());

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
            missing.AddRange(mechanism.SpeciesIds.Where(id => !speciesIds.Contains(id)));
            missing.AddRange(mechanism.ReactionIds.Where(id => !reactionIds.Contains(id)));
            missing.AddRange(mechanism.PhaseIds.Where(id => !phaseIds.Contains(id)));
        }

        // Reaction references. Reactants and products point at species, and the
        // gas-phase fields point at species or phases.
        foreach (ReactionDto reaction in family.Reactions)
        {
            missing.AddRange(reaction.Reactants.Select(r => r.SpeciesId).Where(id => !speciesIds.Contains(id)));
            missing.AddRange(reaction.Products.Select(p => p.SpeciesId).Where(id => !speciesIds.Contains(id)));

            if (reaction.GasPhaseSpeciesId is Guid gasSpecies && !speciesIds.Contains(gasSpecies))
            {
                missing.Add(gasSpecies);
            }
            if (reaction.GasPhaseId is Guid gasPhase && !phaseIds.Contains(gasPhase))
            {
                missing.Add(gasPhase);
            }
            else if (reaction.GasPhaseId is Guid reactionGasPhase &&
                speciesByPhase.TryGetValue(reactionGasPhase, out HashSet<Guid>? gasPhaseSpecies))
            {
                missing.AddRange(reaction.Reactants
                    .Select(r => r.SpeciesId)
                    .Where(id => !gasPhaseSpecies.Contains(id)));
                missing.AddRange(reaction.Products
                    .Select(p => p.SpeciesId)
                    .Where(id => !gasPhaseSpecies.Contains(id)));
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
    private List<ChangeEntry> TrackChangesToFamily(FamilyDto incoming, Family existing)
    {
        var changeEntries = new List<ChangeEntry>();
        FamilyVersion version = existing.CurrentVersion;

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
        HashSet<Guid> changedSpeciesIds = new(deletedSpeciesIds);
        deletedSpeciesIds.ToList().ForEach(id =>
        {
            Species s = existing.Species.Single(s => s.Id == id);
            changeEntries.Add(new ChangeEntry
            {
                Id = Guid.NewGuid(),
                TargetType = ChangeTargetType.Species,
                TargetId = s.Id,
                TargetName = s.Name,
                Action = ChangeAction.Deleted,
                Before = JsonSerializer.Serialize(s.ToDto()),
                After = null
            });
            context.Species.Remove(s);
            existing.Species.Remove(s);
        });
        newSpeciesIds.ToList().ForEach(id => {
            SpeciesDto incomingSpecies = incoming.Species.Single(s => s.Id == id);
            Species added = incomingSpecies.ToEntity();
            added.FamilyVersionId = version.Id;
            changeEntries.Add(new ChangeEntry
            {
                Id = Guid.NewGuid(),
                TargetType = ChangeTargetType.Species,
                TargetId = added.Id,
                TargetName = added.Name,
                Action = ChangeAction.Added,
                Before = null,
                After = JsonSerializer.Serialize(incomingSpecies)
            });
            context.Species.Add(added);
            if (!existing.Species.Contains(added))
            {
                existing.Species.Add(added);
            }
        });
        maybeUpdatedSpeciesIds.ToList().ForEach(id =>
        {
            SpeciesDto incomingSpecies = incoming.Species.Single(s => s.Id == id);
            Species existingSpecies = existing.Species.Single(s => s.Id == id);
            if (existingSpecies.IsDifferent(incomingSpecies))
            {
                changedSpeciesIds.Add(id);
                changeEntries.Add(new ChangeEntry
                {
                    Id = Guid.NewGuid(),
                    TargetType = ChangeTargetType.Species,
                    TargetId = id,
                    TargetName = incomingSpecies.Name,
                    Action = ChangeAction.Updated,
                    Before = JsonSerializer.Serialize(existingSpecies.ToDto()),
                    After = JsonSerializer.Serialize(incomingSpecies)
                });
            }
            existingSpecies.UpdateFrom(incomingSpecies);
        });

        // Reaction changes
        HashSet<Guid> deletedReactionIds = existingReactionIds.Except(incomingReactionIds).ToHashSet();
        HashSet<Guid> newReactionIds = incomingReactionIds.Except(existingReactionIds).ToHashSet();
        HashSet<Guid> maybeUpdatedReactionIds = existingReactionIds.Intersect(incomingReactionIds).ToHashSet();
        HashSet<Guid> changedReactionIds = new(deletedReactionIds);
        deletedReactionIds.ToList().ForEach(id =>
        {
            Reaction r = existing.Reactions.Single(r => r.Id == id);
            changeEntries.Add(new ChangeEntry
            {
                Id = Guid.NewGuid(),
                TargetType = ChangeTargetType.Reaction,
                TargetId = r.Id,
                TargetName = !string.IsNullOrWhiteSpace(r.Name) ? r.Name : r.Id.ToString(),
                Action = ChangeAction.Deleted,
                Before = JsonSerializer.Serialize(r.ToDto()),
                After = null
            });
            context.Reactions.Remove(r);
            existing.Reactions.Remove(r);
        });
        newReactionIds.ToList().ForEach(id => {
            ReactionDto incomingReaction = incoming.Reactions.Single(r => r.Id == id);
            Reaction added = incomingReaction.ToEntity();
            added.FamilyVersionId = version.Id;
            changeEntries.Add(new ChangeEntry
            {
                Id = Guid.NewGuid(),
                TargetType = ChangeTargetType.Reaction,
                TargetId = added.Id,
                TargetName = !string.IsNullOrWhiteSpace(incomingReaction.Name) ? incomingReaction.Name : added.Id.ToString(),
                Action = ChangeAction.Added,
                Before = null,
                After = JsonSerializer.Serialize(incomingReaction)
            });
            context.Reactions.Add(added);
            if (!existing.Reactions.Contains(added))
            {
                existing.Reactions.Add(added);
            }
        });
        maybeUpdatedReactionIds.ToList().ForEach(id =>
        {
            ReactionDto incomingReaction = incoming.Reactions.Single(r => r.Id == id);
            Reaction existingReaction = existing.Reactions.Single(r => r.Id == id);
            if (existingReaction.IsDifferent(incomingReaction))
            {
                changedReactionIds.Add(id);
                changeEntries.Add(new ChangeEntry
                {
                    Id = Guid.NewGuid(),
                    TargetType = ChangeTargetType.Reaction,
                    TargetId = id,
                    TargetName = !string.IsNullOrWhiteSpace(incomingReaction.Name) ? incomingReaction.Name : (!string.IsNullOrWhiteSpace(existingReaction.Name) ? existingReaction.Name : id.ToString()),
                    Action = ChangeAction.Updated,
                    Before = JsonSerializer.Serialize(existingReaction.ToDto()),
                    After = JsonSerializer.Serialize(incomingReaction)
                });
            }
            existingReaction.UpdateFrom(incomingReaction);
        });

        // Phase changes
        HashSet<Guid> deletedPhaseIds = existingPhaseIds.Except(incomingPhaseIds).ToHashSet();
        HashSet<Guid> newPhaseIds = incomingPhaseIds.Except(existingPhaseIds).ToHashSet();
        HashSet<Guid> maybeUpdatedPhaseIds = existingPhaseIds.Intersect(incomingPhaseIds).ToHashSet();
        HashSet<Guid> changedPhaseIds = new(deletedPhaseIds);
        deletedPhaseIds.ToList().ForEach(id =>
        {
            Phase p = existing.Phases.Single(p => p.Id == id);
            changeEntries.Add(new ChangeEntry
            {
                Id = Guid.NewGuid(),
                TargetType = ChangeTargetType.Phase,
                TargetId = p.Id,
                TargetName = p.Name,
                Action = ChangeAction.Deleted,
                Before = JsonSerializer.Serialize(p.ToDto()),
                After = null
            });
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
                    Species = existing.Species.Single(s => s.Id == sid),
                    DiffusionCoefficient = incomingPhase.DiffusionCoefficientOf(sid),
                })
                .ToList();
            changeEntries.Add(new ChangeEntry
            {
                Id = Guid.NewGuid(),
                TargetType = ChangeTargetType.Phase,
                TargetId = added.Id,
                TargetName = incomingPhase.Name,
                Action = ChangeAction.Added,
                Before = null,
                After = JsonSerializer.Serialize(incomingPhase)
            });
            context.Phases.Add(added);
            if (!existing.Phases.Contains(added))
            {
                existing.Phases.Add(added);
            }
        });
        maybeUpdatedPhaseIds.ToList().ForEach(id =>
        {
            PhaseDto incomingPhase = incoming.Phases.Single(p => p.Id == id);
            Phase existingPhase = existing.Phases.Single(p => p.Id == id);
            if (existingPhase.IsDifferent(incomingPhase))
            {
                changedPhaseIds.Add(id);
                changeEntries.Add(new ChangeEntry
                {
                    Id = Guid.NewGuid(),
                    TargetType = ChangeTargetType.Phase,
                    TargetId = id,
                    TargetName = incomingPhase.Name,
                    Action = ChangeAction.Updated,
                    Before = JsonSerializer.Serialize(existingPhase.ToDto()),
                    After = JsonSerializer.Serialize(incomingPhase)
                });
            }
            existingPhase.UpdateFrom(incomingPhase, existing.Species, ps => context.Remove(ps));
        });

        // Mechanism changes: only operate on editable (unverified) mechanisms in the current version
        var verifiedMechanismIds = context.VerifiedMechanismVersions
            .Where(v => v.FamilyId == existing.Id)
            .Select(v => v.MechanismId)
            .ToHashSet();

        HashSet<Guid> existingEditableMechanismIds = existing.Mechanisms
            .Where(m => !verifiedMechanismIds.Contains(m.Id) && m.FamilyVersionId == version.Id)
            .Select(m => m.Id)
            .ToHashSet();
        HashSet<Guid> incomingEditableMechanismIds = incoming.Mechanisms
            .Where(m => !verifiedMechanismIds.Contains(m.Id))
            .Select(m => m.Id)
            .ToHashSet();

        HashSet<Guid> deletedMechanismIds = existingEditableMechanismIds.Except(incomingEditableMechanismIds).ToHashSet();
        HashSet<Guid> newMechanismIds = incomingEditableMechanismIds.Except(existingEditableMechanismIds).ToHashSet();
        HashSet<Guid> maybeUpdatedMechanismIds = existingEditableMechanismIds.Intersect(incomingEditableMechanismIds).ToHashSet();
        deletedMechanismIds.ToList().ForEach(id => {
            Mechanism m = existing.Mechanisms.Single(m => m.Id == id);
            changeEntries.Add(new ChangeEntry
            {
                Id = Guid.NewGuid(),
                TargetType = ChangeTargetType.Mechanism,
                TargetId = m.Id,
                TargetName = m.Name,
                Action = ChangeAction.Deleted,
                Before = JsonSerializer.Serialize(m.ToDto()),
                After = null
            });
            context.Mechanisms.Remove(m);
            existing.Mechanisms.Remove(m);
        });
        newMechanismIds.ToList().ForEach(id => {
            MechanismDto incomingMechanism = incoming.Mechanisms.Single(m => m.Id == id);
            Mechanism added = incomingMechanism.ToEntity();
            added.FamilyId = existing.Id;
            added.Family = existing;
            added.FamilyVersionId = version.Id;
            added.Species = incomingMechanism.SpeciesIds.Select(sid => existing.Species.Single(s => s.Id == sid)).ToList();
            added.Reactions = incomingMechanism.ReactionIds.Select(rid => existing.Reactions.Single(r => r.Id == rid)).ToList();
            added.Phases = incomingMechanism.PhaseIds.Select(pid => existing.Phases.Single(p => p.Id == pid)).ToList();
            added.CreatedDate = DateTime.UtcNow;
            added.UpdatedDate = DateTime.UtcNow;
            changeEntries.Add(new ChangeEntry
            {
                Id = Guid.NewGuid(),
                TargetType = ChangeTargetType.Mechanism,
                TargetId = added.Id,
                TargetName = incomingMechanism.Name,
                Action = ChangeAction.Added,
                Before = null,
                After = JsonSerializer.Serialize(incomingMechanism)
            });
            context.Mechanisms.Add(added);
            if (!existing.Mechanisms.Contains(added))
            {
                existing.Mechanisms.Add(added);
            }
        });
        maybeUpdatedMechanismIds.ToList().ForEach(id =>
        {
            MechanismDto incomingMechanism = incoming.Mechanisms.Single(m => m.Id == id);
            Mechanism existingMechanism = existing.Mechanisms.Single(m => m.Id == id);

            bool isDiff = existingMechanism.IsDifferent(incomingMechanism);
            bool changed = isDiff
                || existingMechanism.HasDependencyChanges(incomingMechanism, changedSpeciesIds, changedReactionIds, changedPhaseIds);

            if (isDiff)
            {
                changeEntries.Add(new ChangeEntry
                {
                    Id = Guid.NewGuid(),
                    TargetType = ChangeTargetType.Mechanism,
                    TargetId = id,
                    TargetName = incomingMechanism.Name,
                    Action = ChangeAction.Updated,
                    Before = JsonSerializer.Serialize(existingMechanism.ToDto()),
                    After = JsonSerializer.Serialize(incomingMechanism)
                });
            }

            existingMechanism.UpdateFrom(incomingMechanism, existing, changed);
        });

        return changeEntries;
    }

    /// <summary>
    /// Filters a query of families to only those that are visible to the given user.
    /// </summary>
    private static IQueryable<Family> VisibleTo(IQueryable<Family> query, User? viewer)
    {
        if (viewer == null)
        {
            return query.Where(f => f.IsPublic);
        }
        else if (viewer.Role == Role.Admin)
        {
            return query;
        }
        else
        {
            return query.Where(f => f.IsPublic || f.OwnerId == viewer.Id || f.Contributors.Any(c => c.UserId == viewer.Id));
        }
    }

    /// <summary>
    /// Gets all contributors for a specific family. Caller must be the family owner, an admin, or a contributor.
    /// </summary>
    public async Task<(QueryResult, IEnumerable<FamilyContributorDto>?)> GetContributorsAsync(Guid familyId, string nameIdentifier)
    {
        if (!Guid.TryParse(nameIdentifier, out Guid userId))
        {
            return (QueryResult.ParseError, null);
        }

        var family = await context.Families
            .Include(f => f.Owner)
            .Include(f => f.Contributors)
                .ThenInclude(c => c.User)
            .FirstOrDefaultAsync(f => f.Id == familyId);

        if (family == null)
        {
            return (QueryResult.NotFound, null);
        }

        var loggedInUser = await _userService.GetUserByIdAsync(userId);
        if (loggedInUser == null)
        {
            return (QueryResult.NotFound, null);
        }

        var contributors = await context.FamilyContributors
            .Include(c => c.User)
            .Where(c => c.FamilyId == familyId)
            .ToListAsync();

        bool canView = family.OwnerId == userId
            || loggedInUser.Role == Role.Admin
            || contributors.Any(c => c.UserId == userId);

        if (!canView)
        {
            return (QueryResult.NoAccess, null);
        }

        var dtos = new List<FamilyContributorDto>
        {
            new FamilyContributorDto
            {
                UserId = family.Owner.Id,
                Role = ContributorRole.Owner,
                Email = family.Owner.Email,
                Username = family.Owner.Username,
                FirstName = family.Owner.FirstName,
                LastName = family.Owner.LastName,
            }
        };
        dtos.AddRange(contributors.Select(c => c.ToDto()));
        return (QueryResult.Success, dtos);
    }

    /// <summary>
    /// Adds or updates a contributor for a family. Caller must be the family owner or an admin.
    /// </summary>
    public async Task<(QueryResult, FamilyContributorDto?)> AddOrUpdateContributorAsync(
        Guid familyId,
        Guid? targetUserId,
        string? targetEmail,
        ContributorRole role,
        string nameIdentifier)
    {
        if (!Guid.TryParse(nameIdentifier, out Guid userId))
        {
            return (QueryResult.ParseError, null);
        }

        var family = await context.Families
            .Include(f => f.Owner)
            .Include(f => f.Contributors)
                .ThenInclude(c => c.User)
            .FirstOrDefaultAsync(f => f.Id == familyId);

        if (family == null)
        {
            return (QueryResult.NotFound, null);
        }

        if (family.OwnerId != userId)
        {
            var loggedInUser = await _userService.GetUserByIdAsync(userId);
            if (loggedInUser == null || loggedInUser.Role != Role.Admin)
            {
                return (QueryResult.NoAccess, null);
            }
        }

        User? targetUser = null;
        if (targetUserId.HasValue && targetUserId.Value != Guid.Empty)
        {
            targetUser = await context.Users.FirstOrDefaultAsync(u => u.Id == targetUserId.Value);
        }
        else if (!string.IsNullOrWhiteSpace(targetEmail))
        {
            targetUser = await context.Users.FirstOrDefaultAsync(u => u.Email == targetEmail);
        }

        if (role == ContributorRole.Owner)
        {
            return (QueryResult.ValidationError, null);
        }

        if (targetUser == null)
        {
            return (QueryResult.UserNotFound, null);
        }

        if (targetUser.Id == family.OwnerId)
        {
            return (QueryResult.ValidationError, null);
        }

        var existingContributor = family.Contributors.FirstOrDefault(c => c.UserId == targetUser.Id);
        if (existingContributor != null)
        {
            existingContributor.Role = role;
        }
        else
        {
            existingContributor = new FamilyContributor
            {
                FamilyId = family.Id,
                Family = family,
                UserId = targetUser.Id,
                User = targetUser,
                Role = role,
            };
            context.FamilyContributors.Add(existingContributor);
            family.Contributors.Add(existingContributor);
        }

        await context.SaveChangesAsync();
        return (QueryResult.Success, existingContributor.ToDto());
    }

    /// <summary>
    /// Removes a contributor from a family. Caller must be the family owner or an admin.
    /// </summary>
    public async Task<QueryResult> RemoveContributorAsync(
        Guid familyId,
        Guid? targetUserId,
        string nameIdentifier)
    {
        if (!Guid.TryParse(nameIdentifier, out Guid userId))
        {
            return QueryResult.ParseError;
        }

        var family = await context.Families
            .Include(f => f.Owner)
            .Include(f => f.Contributors)
                .ThenInclude(c => c.User)
            .FirstOrDefaultAsync(f => f.Id == familyId);

        if (family == null)
        {
            return QueryResult.NotFound;
        }

        if (family.OwnerId != userId)
        {
            var loggedInUser = await _userService.GetUserByIdAsync(userId);
            if (loggedInUser == null || loggedInUser.Role != Role.Admin)
            {
                return QueryResult.NoAccess;
            }
        }

        if (targetUserId.HasValue && targetUserId.Value == family.OwnerId)
        {
            return QueryResult.ValidationError;
        }

        FamilyContributor? contributor = null;
        if (targetUserId.HasValue && targetUserId.Value != Guid.Empty)
        {
            contributor = family.Contributors.FirstOrDefault(c => c.UserId == targetUserId.Value);
        }

        if (contributor == null)
        {
            return QueryResult.NotFound;
        }

        context.FamilyContributors.Remove(contributor);
        await context.SaveChangesAsync();

        return QueryResult.Success;
    }

    /// <summary>
    /// Deep-copies an entire FamilyVersion into a new FamilyVersion snapshot, preserving internal relationships
    /// (PhaseSpecies, Reactants, Products, Reaction parameters) and recording SourceObjectId on each cloned object.
    /// </summary>
    public static (FamilyVersion NewVersion,
                   Dictionary<Guid, Species> SpeciesMap,
                   Dictionary<Guid, Phase> PhaseMap,
                   Dictionary<Guid, Reaction> ReactionMap)
        CopyFamilyVersion(FamilyVersion sourceVersion, string? versionName = null, DateTime? timestamp = null)
        => sourceVersion.CloneSnapshot(timestamp);

    /// <summary>
    /// Verifies a mechanism in a public family. Only Verifiers and Admins can verify mechanisms.
    /// Creates a frozen FamilyVersion containing copies of the whole family and the verified mechanism.
    /// </summary>
    public async Task<(QueryResult Code, VerifiedMechanismVersionDto? Result)> VerifyMechanismAsync(
        Guid familyId,
        Guid mechanismId,
        VerifyMechanismRequest request,
        string nameIdentifier)
    {
        if (!Guid.TryParse(nameIdentifier, out Guid userId))
        {
            return (QueryResult.ParseError, null);
        }

        var user = await _userService.GetUserByIdAsync(userId);
        if (user == null)
        {
            return (QueryResult.OwnerNotFound, null);
        }

        if (user.Role != Role.Verifier && user.Role != Role.Admin)
        {
            return (QueryResult.NoAccess, null);
        }

        // Lightweight check for family existence, visibility, and CurrentVersionId
        var family = await context.Families
            .AsNoTracking()
            .Where(f => f.Id == familyId)
            .Select(f => new { f.Id, f.Name, f.IsPublic, f.CurrentVersionId })
            .FirstOrDefaultAsync();

        if (family == null)
        {
            return (QueryResult.NotFound, null);
        }

        if (!family.IsPublic)
        {
            return (QueryResult.ValidationError, null);
        }

        // Query targeted mechanism to verify existence and get its referenced entity IDs
        var mechanism = await context.Mechanisms
            .Include(m => m.Species)
            .Include(m => m.Phases)
            .Include(m => m.Reactions)
            .FirstOrDefaultAsync(m => m.Id == mechanismId && m.FamilyId == familyId);

        if (mechanism == null)
        {
            return (QueryResult.NotFound, null);
        }

        // Load the family's CurrentVersion to deep-copy the entire family snapshot
        var currentVersion = await context.FamilyVersions
            .AsNoTracking()
            .AsSplitQuery()
            .IncludeFullVersionGraph()
            .FirstOrDefaultAsync(v => v.Id == family.CurrentVersionId && v.FamilyId == familyId);

        if (currentVersion == null)
        {
            return (QueryResult.NotFound, null);
        }

        var now = DateTime.UtcNow;
        string dateStr = now.ToString("yyyy-MM-dd");
        string verifiedName = !string.IsNullOrWhiteSpace(request?.Name)
            ? request.Name.Trim()
            : $"{family.Name}-{mechanism.Name}-{dateStr}";

        // Deep-copy the entire family version into the new FamilyVersion snapshot
        var (frozenVersion, speciesMap, phaseMap, reactionMap) = currentVersion.CloneSnapshot(now);

        string verifierDisplayName = user.GetDisplayName();

        var verifiedMechanism = mechanism.CloneForSnapshot(
            frozenVersion,
            verifiedName,
            now,
            verifierDisplayName,
            speciesMap,
            phaseMap,
            reactionMap);

        var verifiedVersion = new VerifiedMechanismVersion
        {
            Id = Guid.NewGuid(),
            FamilyId = family.Id,
            FamilyVersionId = frozenVersion.Id,
            FamilyVersion = frozenVersion,
            SourceMechanismId = mechanism.Id,
            MechanismId = verifiedMechanism.Id,
            Mechanism = verifiedMechanism,
            Name = verifiedName,
            Notes = request?.Note,
            VerifiedDate = now,
            VerifierId = user.Id,
            Verifier = user,
            IsDeprecated = false,
            IsArchived = false,
        };

        mechanism.UpdatedDate = now;
        mechanism.Verified = true;
        mechanism.VerifiedDate = now;
        mechanism.VerifiedBy = verifierDisplayName;

        context.FamilyVersions.Add(frozenVersion);
        context.Mechanisms.Add(verifiedMechanism);
        context.VerifiedMechanismVersions.Add(verifiedVersion);

        await context.SaveChangesAsync();

        return (QueryResult.Success, verifiedVersion.ToDto());
    }

    /// <summary>
    /// Deprecates a verified mechanism. Only Verifiers and Admins can deprecate.
    /// </summary>
    public async Task<(QueryResult Code, VerifiedMechanismVersionDto? Result)> DeprecateMechanismAsync(
        Guid familyId,
        Guid mechanismId,
        DeprecateMechanismRequest request,
        string nameIdentifier)
    {
        if (!Guid.TryParse(nameIdentifier, out Guid userId))
        {
            return (QueryResult.ParseError, null);
        }

        var user = await _userService.GetUserByIdAsync(userId);
        if (user == null)
        {
            return (QueryResult.OwnerNotFound, null);
        }

        if (user.Role != Role.Verifier && user.Role != Role.Admin)
        {
            return (QueryResult.NoAccess, null);
        }

        var verifiedVersion = await context.VerifiedMechanismVersions
            .Include(v => v.Verifier)
            .Include(v => v.DeprecatedBy)
            .Include(v => v.ArchivedBy)
            .Include(v => v.Mechanism)
            .FirstOrDefaultAsync(v => v.FamilyId == familyId && (v.MechanismId == mechanismId || v.Id == mechanismId));

        if (verifiedVersion == null)
        {
            return (QueryResult.NotFound, null);
        }

        var now = DateTime.UtcNow;
        verifiedVersion.IsDeprecated = true;
        verifiedVersion.DeprecationReason = request.Reason;
        verifiedVersion.DeprecatedDate = now;
        verifiedVersion.DeprecatedById = user.Id;
        verifiedVersion.DeprecatedBy = user;
        verifiedVersion.BetterVersionId = request.BetterVersionId;
        verifiedVersion.AppendDeprecationHistory("deprecated", user, now, request.Reason, request.BetterVersionId);

        await context.SaveChangesAsync();
        return (QueryResult.Success, verifiedVersion.ToDto());
    }

    /// <summary>
    /// Removes deprecation from a verified mechanism. Only Verifiers and Admins can remove deprecation.
    /// </summary>
    public async Task<(QueryResult Code, VerifiedMechanismVersionDto? Result)> UndeprecateMechanismAsync(
        Guid familyId,
        Guid mechanismId,
        string nameIdentifier)
    {
        if (!Guid.TryParse(nameIdentifier, out Guid userId))
        {
            return (QueryResult.ParseError, null);
        }

        var user = await _userService.GetUserByIdAsync(userId);
        if (user == null)
        {
            return (QueryResult.OwnerNotFound, null);
        }

        if (user.Role != Role.Verifier && user.Role != Role.Admin)
        {
            return (QueryResult.NoAccess, null);
        }

        var verifiedVersion = await context.VerifiedMechanismVersions
            .Include(v => v.Verifier)
            .Include(v => v.DeprecatedBy)
            .Include(v => v.ArchivedBy)
            .Include(v => v.Mechanism)
            .FirstOrDefaultAsync(v => v.FamilyId == familyId && (v.MechanismId == mechanismId || v.Id == mechanismId));

        if (verifiedVersion == null)
        {
            return (QueryResult.NotFound, null);
        }

        if (!verifiedVersion.IsDeprecated)
        {
            return (QueryResult.ValidationError, null);
        }

        var now = DateTime.UtcNow;
        verifiedVersion.IsDeprecated = false;
        verifiedVersion.DeprecationReason = null;
        verifiedVersion.DeprecatedDate = null;
        verifiedVersion.DeprecatedById = null;
        verifiedVersion.DeprecatedBy = null;
        verifiedVersion.AppendDeprecationHistory("undeprecated", user, now, "Deprecation removed");

        await context.SaveChangesAsync();
        return (QueryResult.Success, verifiedVersion.ToDto());
    }

    /// <summary>
    /// Archives or unarchives a verified mechanism. Only Verifiers and Admins can archive/unarchive.
    /// </summary>
    public async Task<(QueryResult Code, VerifiedMechanismVersionDto? Result)> ArchiveMechanismAsync(
        Guid familyId,
        Guid mechanismId,
        ArchiveMechanismRequest request,
        string nameIdentifier)
    {
        if (!Guid.TryParse(nameIdentifier, out Guid userId))
        {
            return (QueryResult.ParseError, null);
        }

        var user = await _userService.GetUserByIdAsync(userId);
        if (user == null)
        {
            return (QueryResult.OwnerNotFound, null);
        }

        if (user.Role != Role.Verifier && user.Role != Role.Admin)
        {
            return (QueryResult.NoAccess, null);
        }

        var verifiedVersion = await context.VerifiedMechanismVersions
            .Include(v => v.Verifier)
            .Include(v => v.DeprecatedBy)
            .Include(v => v.ArchivedBy)
            .Include(v => v.Mechanism)
            .FirstOrDefaultAsync(v => v.FamilyId == familyId && (v.MechanismId == mechanismId || v.Id == mechanismId));

        if (verifiedVersion == null)
        {
            return (QueryResult.NotFound, null);
        }

        var now = DateTime.UtcNow;
        verifiedVersion.IsArchived = request.IsArchived;
        verifiedVersion.ArchivedDate = request.IsArchived ? now : null;
        verifiedVersion.ArchivedById = request.IsArchived ? user.Id : null;
        verifiedVersion.ArchivedBy = request.IsArchived ? user : null;

        await context.SaveChangesAsync();
        return (QueryResult.Success, verifiedVersion.ToDto());
    }

    /// <summary>
    /// Permanently deletes a verified mechanism and its frozen FamilyVersion.
    /// Only Verifiers and Admins can permanently delete verified mechanisms.
    /// </summary>
    public async Task<QueryResult> DeleteVerifiedMechanismAsync(
        Guid familyId,
        Guid mechanismId,
        string nameIdentifier)
    {
        if (!Guid.TryParse(nameIdentifier, out Guid userId))
        {
            return QueryResult.ParseError;
        }

        var user = await _userService.GetUserByIdAsync(userId);
        if (user == null)
        {
            return QueryResult.OwnerNotFound;
        }

        if (user.Role != Role.Verifier && user.Role != Role.Admin)
        {
            return QueryResult.NoAccess;
        }

        var verifiedVersion = await context.VerifiedMechanismVersions
            .Include(v => v.Mechanism)
            .FirstOrDefaultAsync(v => v.FamilyId == familyId && (v.MechanismId == mechanismId || v.Id == mechanismId));

        if (verifiedVersion == null)
        {
            return QueryResult.NotFound;
        }

        var versionId = verifiedVersion.FamilyVersionId;
        var mech = verifiedVersion.Mechanism;

        context.VerifiedMechanismVersions.Remove(verifiedVersion);

        if (mech != null)
        {
            context.Mechanisms.Remove(mech);
        }

        var version = await context.FamilyVersions.FirstOrDefaultAsync(v => v.Id == versionId);
        if (version != null)
        {
            context.FamilyVersions.Remove(version);
        }

        await context.SaveChangesAsync();
        return QueryResult.Success;
    }

    /// <summary>
    /// Lists all archived verified mechanisms across all families (including NCAR archive).
    /// Accessible only to Verifiers and Admins.
    /// </summary>
    public async Task<(QueryResult Code, List<ArchivedVerifiedVersionDto>? Result)> GetArchivedVerifiedVersionsAsync(string nameIdentifier)
    {
        if (!Guid.TryParse(nameIdentifier, out Guid userId))
        {
            return (QueryResult.ParseError, null);
        }

        var user = await _userService.GetUserByIdAsync(userId);
        if (user == null)
        {
            return (QueryResult.OwnerNotFound, null);
        }

        if (user.Role != Role.Verifier && user.Role != Role.Admin)
        {
            return (QueryResult.NoAccess, null);
        }

        var verifiedVersions = await context.VerifiedMechanismVersions
            .Include(v => v.Family)
                .ThenInclude(f => f.Owner)
            .Include(v => v.Verifier)
            .Include(v => v.Mechanism)
            .Where(v => v.IsArchived || v.Family.Name.StartsWith("[Archived]"))
            .ToListAsync();

        var result = verifiedVersions.Select(v => new ArchivedVerifiedVersionDto
        {
            MechanismId = v.MechanismId,
            FamilyId = v.FamilyId,
            FamilyVersionId = v.FamilyVersionId,
            Name = v.Name,
            Description = v.Mechanism?.Description,
            OriginalFamilyName = v.OriginalFamilyName ?? v.Family?.Name ?? "",
            OriginalOwnerUsername = v.OriginalOwnerUsername ?? v.Family?.Owner?.Username ?? "",
            VerifierUsername = v.Verifier?.Username ?? "",
            VerifiedDate = v.VerifiedDate.ToString("o"),
            Notes = v.Notes ?? "",
            IsDeprecated = v.IsDeprecated,
            DeprecationReason = v.DeprecationReason ?? "",
            BetterVersionId = v.BetterVersionId?.ToString() ?? "",
        }).ToList();

        return (QueryResult.Success, result);
    }

    /// <summary>
    /// Gets the audit history (change sets and entries) for a family.
    /// Only the owner, contributors, and admins can view family history.
    /// </summary>
    public async Task<(QueryResult Code, List<ChangeSetDto>? History)> GetFamilyHistoryAsync(
        Guid familyId,
        string? nameIdentifier,
        ChangeTargetType? targetType = null,
        Guid? targetId = null)
    {
        var (userResult, viewer) = await _userService.GetCurrentUserAsync(nameIdentifier);
        if (viewer == null)
        {
            return (QueryResult.NoAccess, null);
        }

        var family = await context.Families
            .Include(f => f.Owner)
            .Include(f => f.Contributors)
            .FirstOrDefaultAsync(f => f.Id == familyId);

        if (family == null)
        {
            return (QueryResult.NotFound, null);
        }

        bool isOwner = family.OwnerId == viewer.Id;
        bool isContributor = family.Contributors.Any(c => c.UserId == viewer.Id);
        bool isAdmin = viewer.Role == Role.Admin;

        if (!isOwner && !isContributor && !isAdmin)
        {
            return (QueryResult.NoAccess, null);
        }

        IQueryable<ChangeSet> query = context.ChangeSets
            .Include(cs => cs.User)
            .Include(cs => cs.Entries)
            .Where(cs => cs.FamilyId == familyId);

        if (targetType.HasValue)
        {
            query = query.Where(cs => cs.Entries.Any(e => e.TargetType == targetType.Value));
        }

        if (targetId.HasValue)
        {
            query = query.Where(cs => cs.Entries.Any(e => e.TargetId == targetId.Value));
        }

        var changeSets = await query
            .OrderByDescending(cs => cs.Timestamp)
            .ToListAsync();

        var dtos = changeSets.Select(cs => new ChangeSetDto
        {
            Id = cs.Id,
            FamilyId = cs.FamilyId,
            UserId = cs.UserId,
            User = cs.User == null ? null : new OwnerDto
            {
                Id = cs.User.Id,
                Username = cs.User.Username,
                Role = cs.User.Role,
            },
            Timestamp = DateTime.SpecifyKind(cs.Timestamp, DateTimeKind.Utc),
            Note = cs.Note,
            Entries = cs.Entries
                .Where(e => (!targetType.HasValue || e.TargetType == targetType.Value)
                         && (!targetId.HasValue || e.TargetId == targetId.Value))
                .Select(e => new ChangeEntryDto
                {
                    Id = e.Id,
                    ChangeSetId = e.ChangeSetId,
                    TargetType = e.TargetType.ToString(),
                    TargetId = e.TargetId,
                    TargetName = e.TargetName,
                    Action = e.Action.ToString(),
                    Before = e.Before,
                    After = e.After
                }).ToList()
        }).ToList();

        return (QueryResult.Success, dtos);
    }

    /// <summary>
    /// Gets global audit history across all families. Admin only.
    /// </summary>
    public async Task<(QueryResult Code, List<ChangeSetDto>? History)> GetGlobalHistoryAsync(
        string? nameIdentifier,
        Guid? familyId = null,
        Guid? userId = null,
        ChangeTargetType? targetType = null,
        Guid? targetId = null,
        int limit = 100)
    {
        var (userResult, viewer) = await _userService.GetCurrentUserAsync(nameIdentifier);
        if (viewer == null || viewer.Role != Role.Admin)
        {
            return (QueryResult.NoAccess, null);
        }

        IQueryable<ChangeSet> query = context.ChangeSets
            .Include(cs => cs.User)
            .Include(cs => cs.Entries)
            .AsQueryable();

        if (familyId.HasValue)
        {
            query = query.Where(cs => cs.FamilyId == familyId.Value);
        }

        if (userId.HasValue)
        {
            query = query.Where(cs => cs.UserId == userId.Value);
        }

        if (targetType.HasValue)
        {
            query = query.Where(cs => cs.Entries.Any(e => e.TargetType == targetType.Value));
        }

        if (targetId.HasValue)
        {
            query = query.Where(cs => cs.Entries.Any(e => e.TargetId == targetId.Value));
        }

        var changeSets = await query
            .OrderByDescending(cs => cs.Timestamp)
            .Take(limit)
            .ToListAsync();

        var dtos = changeSets.Select(cs => new ChangeSetDto
        {
            Id = cs.Id,
            FamilyId = cs.FamilyId,
            UserId = cs.UserId,
            User = cs.User == null ? null : new OwnerDto
            {
                Id = cs.User.Id,
                Username = cs.User.Username,
                Role = cs.User.Role,
            },
            Timestamp = DateTime.SpecifyKind(cs.Timestamp, DateTimeKind.Utc),
            Note = cs.Note,
            Entries = cs.Entries
                .Where(e => (!targetType.HasValue || e.TargetType == targetType.Value)
                         && (!targetId.HasValue || e.TargetId == targetId.Value))
                .Select(e => new ChangeEntryDto
                {
                    Id = e.Id,
                    ChangeSetId = e.ChangeSetId,
                    TargetType = e.TargetType.ToString(),
                    TargetId = e.TargetId,
                    TargetName = e.TargetName,
                    Action = e.Action.ToString(),
                    Before = e.Before,
                    After = e.After
                }).ToList()
        }).ToList();

        return (QueryResult.Success, dtos);
    }

    /// <summary>
    /// Records a group change entry into a change set (supporting Issue #351).
    /// </summary>
    public static ChangeEntry CreateGroupChangeEntry(
        Guid groupId,
        string groupName,
        ChangeAction action,
        object? before = null,
        object? after = null)
    {
        return new ChangeEntry
        {
            Id = Guid.NewGuid(),
            TargetType = ChangeTargetType.Group,
            TargetId = groupId,
            TargetName = groupName,
            Action = action,
            Before = before == null ? null : JsonSerializer.Serialize(before),
            After = after == null ? null : JsonSerializer.Serialize(after)
        };
    }
}
