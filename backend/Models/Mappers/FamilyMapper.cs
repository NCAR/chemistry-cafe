using ChemistryCafeAPI.Models;
using ChemistryCafeAPI.Models.Dto;

namespace ChemistryCafeAPI.Models.Mappers;

public static class FamilyMapper
{
    public static FamilyDto ToDto(this Family family)
    {
        var verifiedMechanismIds = family.VerifiedVersions?
            .Select(v => v.MechanismId)
            .ToHashSet() ?? new HashSet<Guid>();

        var latestVerifiedBySource = family.VerifiedVersions?
            .Where(v => !v.IsArchived && !v.IsDeprecated && v.SourceMechanismId.HasValue)
            .OrderByDescending(v => v.VerifiedDate)
            .GroupBy(v => v.SourceMechanismId!.Value)
            .ToDictionary(g => g.Key, g => g.First()) ?? new();

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
            IsArchived = family.IsArchived,
            CurrentVersionId = family.CurrentVersionId,
            Species = family.Species.Select(s => s.ToDto()).ToList(),
            Reactions = family.Reactions.Select(r => r.ToDto()).ToList(),
            Phases = family.Phases.Select(p => p.ToDto()).ToList(),
            Mechanisms = family.Mechanisms
                .Where(m => !verifiedMechanismIds.Contains(m.Id)
                    && (family.CurrentVersionId == null || m.FamilyVersionId == family.CurrentVersionId))
                .Select(m =>
                {
                    var dto = m.ToDto();
                    if (latestVerifiedBySource.TryGetValue(m.Id, out var v))
                    {
                        // A regular mechanism in a family is marked and linked to a verified version
                        // based on if it was not changed since it was last verified.
                        bool unchanged = m.UpdatedDate <= v.VerifiedDate;
                        if (unchanged)
                        {
                            dto.Verified = true;
                            dto.VerifiedDate = v.VerifiedDate;
                            dto.VerifiedBy = v.Verifier?.GetDisplayName();
                        }
                        else
                        {
                            dto.Verified = false;
                            dto.VerifiedDate = null;
                            dto.VerifiedBy = null;
                        }
                    }
                    return dto;
                })
                .ToList(),
            VerifiedVersions = family.VerifiedVersions?.Select(v => v.ToDto()).ToList() ?? new(),
        };
    }

    public static VerifiedMechanismVersionDto ToDto(this VerifiedMechanismVersion v)
    {
        return new VerifiedMechanismVersionDto
        {
            Id = v.Id,
            FamilyId = v.FamilyId,
            FamilyVersionId = v.FamilyVersionId,
            SourceMechanismId = v.SourceMechanismId,
            MechanismId = v.MechanismId,
            Name = v.Name,
            Notes = v.Notes,
            VerifiedDate = v.VerifiedDate,
            VerifierId = v.VerifierId,
            VerifierUsername = v.Verifier?.Username ?? "",
            VerifierName = v.Verifier?.GetDisplayName(),
            IsDeprecated = v.IsDeprecated,
            DeprecationReason = v.DeprecationReason,
            DeprecatedDate = v.DeprecatedDate,
            DeprecatedByUsername = v.DeprecatedBy?.Username,
            BetterVersionId = v.BetterVersionId,
            IsArchived = v.IsArchived,
            ArchivedDate = v.ArchivedDate,
            ArchivedByUsername = v.ArchivedBy?.Username,
            OriginalFamilyName = v.OriginalFamilyName,
            OriginalOwnerUsername = v.OriginalOwnerUsername,
        };
    }

    public static FamilyContributorDto ToDto(this FamilyContributor contributor)
    {
        return new FamilyContributorDto
        {
            UserId = contributor.UserId,
            Role = contributor.Role,
            Email = contributor.User?.Email,
            Username = contributor.User?.Username,
            FirstName = contributor.User?.FirstName,
            LastName = contributor.User?.LastName,
        };
    }
}
