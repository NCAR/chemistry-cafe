using System.Text.Json;
using ChemistryCafeAPI.Models;
using ChemistryCafeAPI.Models.Dto;

namespace ChemistryCafeAPI.Models.Mappers;

public static class MechanismMapper
{
    public static MechanismDto ToDto(this Mechanism mechanism)
    {
        bool isVerified = mechanism.Verified;
        DateTime? verifiedDate = mechanism.VerifiedDate;
        string? verifiedBy = mechanism.VerifiedBy;

        var latestVerified = mechanism.VerifiedVersions?
            .Where(v => !v.IsArchived && !v.IsDeprecated)
            .OrderByDescending(v => v.VerifiedDate)
            .FirstOrDefault();

        if (latestVerified != null)
        {
            // A regular mechanism in a family is marked and linked to a verified version
            // if it has not changed since it was last verified.
            bool unchanged = mechanism.UpdatedDate <= latestVerified.VerifiedDate;
            if (unchanged)
            {
                isVerified = true;
                verifiedDate ??= latestVerified.VerifiedDate;
                verifiedBy ??= latestVerified.Verifier?.GetDisplayName();
            }
            else
            {
                isVerified = false;
            }
        }

        return new MechanismDto
        {
            Id = mechanism.Id,
            SourceObjectId = mechanism.SourceObjectId,
            FamilyVersionId = mechanism.FamilyVersionId,
            FamilyId = mechanism.FamilyId,
            IsReadOnly = mechanism.IsReadOnly,
            Name = mechanism.Name,
            Description = mechanism.Description,
            SpeciesIds = mechanism.Species.Select(s => s.Id).ToList(),
            ReactionIds = mechanism.Reactions.Select(r => r.Id).ToList(),
            PhaseIds = mechanism.Phases.Select(p => p.Id).ToList(),
            OtherProperties = mechanism.OtherProperties,
            Verified = isVerified,
            VerifiedDate = isVerified ? verifiedDate : null,
            VerifiedBy = isVerified ? verifiedBy : null
        };
    }

    /// <summary>
    /// Maps the scalar fields to a Mechanism entity. The species/reaction/phase
    /// join memberships are resolved against the family during the family save.
    /// </summary>
    public static Mechanism ToEntity(this MechanismDto mechanismDto)
    {
        return new Mechanism
        {
            Id = mechanismDto.Id,
            SourceObjectId = mechanismDto.SourceObjectId,
            FamilyId = mechanismDto.FamilyId,
            FamilyVersionId = mechanismDto.FamilyVersionId,
            Name = mechanismDto.Name,
            Description = mechanismDto.Description,
            OtherProperties = mechanismDto.OtherProperties,
            Verified = mechanismDto.Verified,
            VerifiedDate = mechanismDto.VerifiedDate,
            VerifiedBy = mechanismDto.VerifiedBy
        };
    }
}
